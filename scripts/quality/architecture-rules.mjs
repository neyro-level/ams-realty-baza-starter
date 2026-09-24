import path from "node:path";
import ts from "typescript";

function sourceFile(name, content) {
	return ts.createSourceFile(
		name,
		content,
		ts.ScriptTarget.Latest,
		true,
		name.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
	);
}

function normalize(name) {
	return name.replaceAll("\\", "/");
}

function moduleReferences(name, content) {
	const references = [];
	const visit = (node) => {
		if (
			(ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) &&
			node.moduleSpecifier &&
			ts.isStringLiteral(node.moduleSpecifier)
		) {
			references.push({ kind: "static", value: node.moduleSpecifier.text });
		}
		if (
			ts.isImportEqualsDeclaration(node) &&
			ts.isExternalModuleReference(node.moduleReference) &&
			node.moduleReference.expression &&
			ts.isStringLiteral(node.moduleReference.expression)
		) {
			references.push({
				kind: "static",
				value: node.moduleReference.expression.text,
			});
		}
		if (
			ts.isCallExpression(node) &&
			node.expression.kind === ts.SyntaxKind.ImportKeyword &&
			node.arguments.length === 1 &&
			ts.isStringLiteral(node.arguments[0])
		) {
			references.push({ kind: "dynamic", value: node.arguments[0].text });
		}
		ts.forEachChild(node, visit);
	};
	visit(sourceFile(name, content));
	return references;
}

function isFrameworkOrPersistence(moduleName) {
	return /^(?:next(?:\/|$)|payload$|@payloadcms\/|pg$|prisma$|@prisma\/)/.test(
		moduleName,
	);
}

function projectTarget(file, moduleName) {
	if (moduleName.startsWith("@/")) return `src/${moduleName.slice(2)}`;
	if (moduleName === "@ams/realtbase-ui") return "packages/ui";
	if (moduleName.startsWith("@ams/realtbase-ui/")) {
		return `packages/ui/${moduleName.slice("@ams/realtbase-ui/".length)}`;
	}
	if (!moduleName.startsWith(".")) return moduleName;
	return path.posix.normalize(
		path.posix.join(path.posix.dirname(file), moduleName),
	);
}

export function findPackageBoundaryViolations(entries) {
	const violations = [];
	for (const { name, content } of entries) {
		const file = normalize(name);
		const isUi = file.startsWith("packages/ui/");
		const isContracts = file.startsWith("packages/contracts/");
		const isCore = file.startsWith("src/core/");
		if (!isUi && !isContracts && !isCore) continue;
		for (const reference of moduleReferences(file, content)) {
			const target = projectTarget(file, reference.value);
			if (target.startsWith("src/project/")) {
				violations.push(`${file}: reusable layer imports project ${target}`);
				continue;
			}
			if ((isUi || isContracts) && isFrameworkOrPersistence(reference.value)) {
				violations.push(
					`${file}: ${isUi ? "UI" : "contracts"} imports framework/persistence runtime ${reference.value}`,
				);
			}
			if (isCore && target.startsWith("packages/ui")) {
				violations.push(`${file}: core imports UI ${target}`);
			}
		}
	}
	return violations;
}

function stringLiterals(name, content) {
	const values = [];
	const visit = (node) => {
		if (ts.isStringLiteralLike(node)) values.push(node.text);
		ts.forEachChild(node, visit);
	};
	visit(sourceFile(name, content));
	return values;
}

export function findForbiddenProjectLiteralViolations(entries, denylist) {
	const forbidden = denylist.filter((value) => typeof value === "string" && value.length > 0);
	return entries.flatMap(({ name, content }) => {
		const file = normalize(name);
		return stringLiterals(file, content).flatMap((value) =>
			forbidden.some((literal) => value.includes(literal))
				? [`${file}: reusable layer contains project city/brand/domain literal`]
				: [],
		);
	});
}

export function findHrefLiteralReports(entries) {
	const reports = [];
	for (const { name, content } of entries) {
		const file = normalize(name);
		const visit = (node) => {
			if (
				ts.isJsxAttribute(node) &&
				node.name.text === "href" &&
				(node.initializer &&
					(ts.isStringLiteral(node.initializer) ||
						(ts.isJsxExpression(node.initializer) &&
							node.initializer.expression &&
							ts.isStringLiteralLike(node.initializer.expression))))
			) {
				reports.push(`${file}: JSX href literal`);
			}
			if (
				ts.isPropertyAssignment(node) &&
				((ts.isIdentifier(node.name) && node.name.text === "href") ||
					(ts.isStringLiteral(node.name) && node.name.text === "href")) &&
				ts.isStringLiteralLike(node.initializer)
			) {
				reports.push(`${file}: object href literal`);
			}
			ts.forEachChild(node, visit);
		};
		visit(sourceFile(file, content));
	}
	return reports;
}

function isCacheGraph(file) {
	return (
		file.startsWith("src/core/ingest/") ||
		file.startsWith("src/project/jobs/") ||
		file.startsWith("src/core/cache/")
	);
}

export function findCacheGraphViolations(entries) {
	const violations = [];
	for (const { name, content } of entries) {
		const file = normalize(name);
		if (!isCacheGraph(file)) continue;
		for (const reference of moduleReferences(file, content)) {
			if (reference.kind === "static" && reference.value.startsWith("next/")) {
				violations.push(
					`${file}: top-level ${reference.value} import in cache graph`,
				);
			}
			if (
				reference.kind === "dynamic" &&
				reference.value === "next/cache" &&
				file !== "src/core/cache/in-process.ts"
			) {
				violations.push(
					`${file}: lazy next/cache is only allowed in the in-process adapter`,
				);
			}
		}
	}
	return violations;
}

export function findUiPersistenceViolations(entries) {
	const violations = [];
	const forbidden = new Set(["localStorage", "sessionStorage", "indexedDB"]);
	for (const { name, content } of entries) {
		const file = normalize(name);
		if (!file.startsWith("packages/ui/")) continue;
		const hits = new Set();
		const visit = (node) => {
			if (ts.isIdentifier(node) && forbidden.has(node.text))
				hits.add(node.text);
			ts.forEachChild(node, visit);
		};
		visit(sourceFile(file, content));
		for (const api of hits) {
			violations.push(`${file}: UI must not own browser persistence (${api})`);
		}
	}
	return violations;
}
