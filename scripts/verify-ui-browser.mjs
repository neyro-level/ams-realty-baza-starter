import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const baseUrl = process.env.STARTER_VISUAL_BASE_URL;
assert.ok(baseUrl, "STARTER_VISUAL_BASE_URL is required");
const captureDirectory = process.env.STARTER_VISUAL_CAPTURE_DIR;
if (captureDirectory) mkdirSync(captureDirectory, { recursive: true });

const browserCandidates = [
	process.env.CHROME_PATH,
	"C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
	"C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
].filter(Boolean);
let browserPath;
for (const candidate of browserCandidates) {
	try {
		const response = await import("node:fs").then(({ existsSync }) =>
			existsSync(candidate),
		);
		if (response) {
			browserPath = candidate;
			break;
		}
	} catch {}
}
assert.ok(browserPath, "Chrome or Edge executable was not found");

const viewports = [
	{ name: "mobile", width: 390, height: 844 },
	{ name: "tablet", width: 768, height: 1024 },
	{ name: "desktop", width: 1280, height: 900 },
	{ name: "wide", width: 1440, height: 1000 },
];
const routes = [
	"/",
	"/primorsk/kvartiry/",
	"/primorsk/kvartiry/?rooms=2",
	"/novostroyki/zhk-severnyy-bereg/",
	"/uslugi/",
];

const port = 9400 + (process.pid % 400);
const profile = mkdtempSync(join(tmpdir(), "ams-s14-browser-"));
const browser = spawn(
	browserPath,
	[
		"--headless=new",
		"--disable-gpu",
		"--no-first-run",
		"--no-default-browser-check",
		`--remote-debugging-port=${port}`,
		`--user-data-dir=${profile}`,
		"about:blank",
	],
	{ stdio: "ignore" },
);

const delay = (milliseconds) =>
	new Promise((resolve) => setTimeout(resolve, milliseconds));

async function json(path) {
	const response = await fetch(`http://127.0.0.1:${port}${path}`);
	if (!response.ok) throw new Error(`CDP ${path}: HTTP ${response.status}`);
	return response.json();
}

async function waitForBrowser() {
	for (let attempt = 0; attempt < 80; attempt += 1) {
		try {
			return await json("/json/version");
		} catch {
			await delay(250);
		}
	}
	throw new Error("Browser DevTools endpoint did not become ready.");
}

function createCdpClient(webSocketDebuggerUrl) {
	const socket = new WebSocket(webSocketDebuggerUrl);
	let sequence = 0;
	const pending = new Map();
	socket.onmessage = ({ data }) => {
		const message = JSON.parse(data);
		if (!message.id) return;
		const waiter = pending.get(message.id);
		if (!waiter) return;
		pending.delete(message.id);
		if (message.error) waiter.reject(new Error(message.error.message));
		else waiter.resolve(message.result);
	};
	return {
		ready: new Promise((resolve, reject) => {
			socket.onopen = resolve;
			socket.onerror = reject;
		}),
		send(method, params = {}) {
			sequence += 1;
			const id = sequence;
			return new Promise((resolve, reject) => {
				pending.set(id, { resolve, reject });
				socket.send(JSON.stringify({ id, method, params }));
			});
		},
		close() {
			socket.close();
		},
	};
}

async function waitForDocument(client) {
	for (let attempt = 0; attempt < 120; attempt += 1) {
		const result = await client.send("Runtime.evaluate", {
			expression: "document.readyState",
			returnByValue: true,
		});
		if (result.result.value === "complete") {
			await delay(300);
			return;
		}
		await delay(250);
	}
	throw new Error("Document did not reach complete state.");
}

async function checkInternalLinks(hrefs) {
	const results = [];
	for (const href of [...new Set(hrefs)]) {
		const url = new URL(href, baseUrl);
		if (url.origin !== new URL(baseUrl).origin || url.hash) continue;
		const response = await fetch(url, { redirect: "manual" });
		results.push({
			href: `${url.pathname}${url.search}`,
			status: response.status,
		});
	}
	return results;
}

let client;
try {
	await waitForBrowser();
	const page = await fetch(
		`http://127.0.0.1:${port}/json/new?${encodeURIComponent("about:blank")}`,
		{ method: "PUT" },
	).then((response) => response.json());
	client = createCdpClient(page.webSocketDebuggerUrl);
	await client.ready;
	await client.send("Page.enable");
	await client.send("Runtime.enable");
	await client.send("Accessibility.enable");

	const matrix = [];
	let checkedLinks = [];
	for (const route of routes) {
		const routeResponse = await fetch(new URL(route, baseUrl), {
			redirect: "manual",
		});
		assert.equal(
			routeResponse.status,
			200,
			`Representative route failed: ${route}`,
		);
		for (const viewport of viewports) {
			await client.send("Emulation.setDeviceMetricsOverride", {
				width: viewport.width,
				height: viewport.height,
				deviceScaleFactor: 1,
				mobile: viewport.width < 768,
			});
			await client.send("Page.navigate", { url: new URL(route, baseUrl).href });
			await waitForDocument(client);
			const inspection = await client.send("Runtime.evaluate", {
				expression: `(() => ({
				path: location.pathname + location.search,
				title: document.title,
				main: document.querySelectorAll('main').length,
				h1: document.querySelectorAll('h1').length,
				overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
				hrefs: [...document.querySelectorAll('a[href]')]
					.filter((node) => node.getClientRects().length > 0)
					.map((node) => node.getAttribute('href'))
					.filter(Boolean),
				filterStatus: document.body.textContent.includes('Каталог отфильтрован'),
				anchors: ['development-prices','development-layouts','development-progress','development-faq']
					.filter((id) => document.getElementById(id)),
				analyticsEvents: [...document.querySelectorAll('[data-analytics-event]')]
					.map((node) => node.getAttribute('data-analytics-event')),
			}))()`,
				returnByValue: true,
			});
			const value = inspection.result.value;
			assert.equal(value.main, 1, `${route} must render one main landmark`);
			assert.equal(value.h1, 1, `${route} must render one h1`);
			assert.ok(
				value.overflow <= 1,
				`${route} overflows by ${value.overflow}px`,
			);
			if (route.includes("rooms=2")) assert.equal(value.filterStatus, true);
			if (route.includes("zhk-severnyy-bereg")) {
				assert.ok(value.anchors.includes("development-prices"));
				assert.ok(value.analyticsEvents.includes("development_view"));
			}
			if (route === "/primorsk/kvartiry/") {
				assert.ok(value.analyticsEvents.includes("listing_view"));
			}
			if (viewport.name === "desktop") {
				checkedLinks = checkedLinks.concat(
					await checkInternalLinks(value.hrefs),
				);
			}

			const accessibility = await client.send("Accessibility.getFullAXTree");
			const unnamedControls = accessibility.nodes.filter(
				(node) =>
					["button", "textbox", "checkbox", "link"].includes(
						node.role?.value,
					) && !node.name?.value,
			);
			assert.deepEqual(
				unnamedControls.map((node) => node.role?.value),
				[],
				`${route} has unnamed accessible controls`,
			);
			const screenshot = await client.send("Page.captureScreenshot", {
				format: "png",
				captureBeyondViewport: false,
			});
			const screenshotBuffer = Buffer.from(screenshot.data, "base64");
			if (captureDirectory) {
				const routeKey =
					route === "/"
						? "home"
						: route.replaceAll(/[^a-z0-9]+/gi, "-").replaceAll(/^-|-$/g, "");
				writeFileSync(
					join(captureDirectory, `${routeKey}-${viewport.name}.png`),
					screenshotBuffer,
				);
			}
			matrix.push({
				route,
				viewport: viewport.name,
				width: viewport.width,
				height: viewport.height,
				h1: value.h1,
				overflow: value.overflow,
				unnamedControls: unnamedControls.length,
				screenshotSha256: createHash("sha256")
					.update(screenshotBuffer)
					.digest("hex"),
			});
		}
	}

	const uniqueLinks = [
		...new Map(checkedLinks.map((item) => [item.href, item])).values(),
	];
	const brokenLinks = uniqueLinks.filter((item) => item.status !== 200);
	if (brokenLinks.length)
		console.error(JSON.stringify({ brokenLinks }, null, 2));
	assert.deepEqual(
		brokenLinks,
		[],
		"Visible internal links must return HTTP 200",
	);

	console.log(
		JSON.stringify(
			{
				schema: "ams-ui-browser-proof/v1",
				baseUrl,
				matrix,
				checkedInternalLinks: uniqueLinks,
				status: "PASS",
			},
			null,
			2,
		),
	);
} finally {
	client?.close();
	browser.kill();
	await delay(500);
	try {
		rmSync(profile, {
			recursive: true,
			force: true,
			maxRetries: 10,
			retryDelay: 250,
		});
	} catch {
		// Browser profile cleanup is best-effort on Windows; proof validity does not
		// depend on deletion of this OS-temporary directory.
	}
}
