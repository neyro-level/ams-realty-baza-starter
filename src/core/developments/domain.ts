export type DevelopmentKind = "residential_complex" | "cottage_village";

type DevelopmentRecord = Record<string, unknown>;

const residentialOnlyFields = ["layouts", "progress"] as const;
const cottageOnlyFields = [
	"communications",
	"totalArea",
	"plotsCount",
	"villageClass",
] as const;

function meaningful(value: unknown): boolean {
	if (value === undefined || value === null || value === "" || value === false) return false;
	if (Array.isArray(value)) return value.some(meaningful);
	if (typeof value === "object") return Object.values(value).some(meaningful);
	return true;
}

export function assertDevelopmentKindFields(data: DevelopmentRecord): void {
	const kind = data.kind as DevelopmentKind | undefined;
	if (!(["residential_complex", "cottage_village"] as const).includes(kind as DevelopmentKind)) {
		throw new Error("Development kind is required.");
	}
	const forbidden = kind === "residential_complex" ? cottageOnlyFields : residentialOnlyFields;
	for (const field of forbidden) {
		if (meaningful(data[field])) {
			throw new Error(`${field} is not valid for development kind=${kind}.`);
		}
	}
}

export function assertDevelopmentSlug(slug: unknown): string {
	if (typeof slug !== "string" || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
		throw new Error("Development slug must be canonical lowercase ASCII.");
	}
	if (slug.startsWith("zhk-") || slug.startsWith("kp-")) {
		throw new Error("Development slug stores semantic identity without the URL prefix.");
	}
	return slug;
}

export function developmentUrlSlug(kind: DevelopmentKind, semanticSlug: string): string {
	assertDevelopmentSlug(semanticSlug);
	return `${kind === "residential_complex" ? "zhk" : "kp"}-${semanticSlug}`;
}

export function buildDevelopmentSemanticSlug(input: {
	base: string;
	citySlug: string;
	hasRealCollision: boolean;
}): string {
	const base = assertDevelopmentSlug(input.base);
	if (!input.hasRealCollision) return base;
	return `${base}-${assertDevelopmentSlug(input.citySlug)}`;
}

export function assertPublishedDevelopmentSlugImmutable(input: {
	nextSlug: string;
	originalSlug?: string | null;
	originalPublishedAt?: string | null;
}): void {
	if (
		input.originalPublishedAt &&
		input.originalSlug &&
		input.nextSlug !== input.originalSlug
	) {
		throw new Error("Published development slug is immutable.");
	}
}
