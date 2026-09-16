import "server-only";
import { isIP } from "node:net";
import { setTimeout as delay } from "node:timers/promises";
import { lookup } from "node:dns/promises";

const defaultTimeoutMs = 10_000;
const defaultMaxBytes = 5 * 1024 * 1024;

type SafeOutboundOptions = {
	allowedHosts: readonly string[];
	approvedHttpHosts?: readonly string[];
	timeoutMs?: number;
	maxBytes?: number;
	headers?: HeadersInit;
};

function isPrivateIPv4(address: string): boolean {
	const parts = address.split(".").map(Number);
	if (parts.length !== 4 || parts.some((part) => !Number.isInteger(part))) return false;
	const [a, b] = parts;
	return (
		a === 10 ||
		a === 127 ||
		(a === 172 && b >= 16 && b <= 31) ||
		(a === 192 && b === 168) ||
		(a === 169 && b === 254) ||
		a === 0
	);
}

function isPrivateIPv6(address: string): boolean {
	const normalized = address.toLowerCase();
	return (
		normalized === "::1" ||
		normalized.startsWith("fc") ||
		normalized.startsWith("fd") ||
		normalized.startsWith("fe80:")
	);
}

function isUnsafeAddress(address: string): boolean {
	const version = isIP(address);
	if (version === 4) return isPrivateIPv4(address);
	if (version === 6) return isPrivateIPv6(address);
	return true;
}

async function assertSafeDestination(url: URL, options: SafeOutboundOptions): Promise<void> {
	const host = url.hostname.toLowerCase();
	const allowedHosts = new Set(options.allowedHosts.map((item) => item.toLowerCase()));
	const approvedHttpHosts = new Set(
		(options.approvedHttpHosts ?? []).map((item) => item.toLowerCase()),
	);

	if (!allowedHosts.has(host)) throw new Error(`Outbound host is not allowlisted: ${host}`);
	if (url.protocol !== "https:" && !(url.protocol === "http:" && approvedHttpHosts.has(host))) {
		throw new Error(`Outbound protocol is not approved for ${host}`);
	}

	const addresses = await lookup(host, { all: true, verbatim: true });
	if (addresses.some((item) => isUnsafeAddress(item.address))) {
		throw new Error(`Outbound host resolves to a private or link-local address: ${host}`);
	}
}

async function readBounded(response: Response, maxBytes: number): Promise<ArrayBuffer> {
	const reader = response.body?.getReader();
	if (!reader) return response.arrayBuffer();

	const chunks: Uint8Array[] = [];
	let received = 0;

	while (true) {
		const { done, value } = await reader.read();
		if (done) break;
		if (!value) continue;
		received += value.byteLength;
		if (received > maxBytes) {
			await reader.cancel();
			throw new Error("Outbound response exceeded max size.");
		}
		chunks.push(value);
	}

	const body = new Uint8Array(received);
	let offset = 0;
	for (const chunk of chunks) {
		body.set(chunk, offset);
		offset += chunk.byteLength;
	}
	return body.buffer;
}

export async function safeOutboundFetch(
	input: string | URL,
	options: SafeOutboundOptions,
): Promise<Response> {
	const url = new URL(input);
	await assertSafeDestination(url, options);

	const controller = new AbortController();
	const timeout = delay(options.timeoutMs ?? defaultTimeoutMs, undefined, {
		signal: controller.signal,
	}).then(() => controller.abort());

	try {
		const response = await fetch(url, {
			headers: options.headers,
			redirect: "manual",
			signal: controller.signal,
		});

		if (
			response.status >= 300 &&
			response.status < 400 &&
			response.headers.has("location")
		) {
			const nextUrl = new URL(response.headers.get("location") ?? "", url);
			await assertSafeDestination(nextUrl, options);
			return safeOutboundFetch(nextUrl, options);
		}

		const body = await readBounded(response, options.maxBytes ?? defaultMaxBytes);
		return new Response(body, {
			status: response.status,
			statusText: response.statusText,
			headers: response.headers,
		});
	} finally {
		controller.abort();
		await timeout.catch(() => undefined);
	}
}
