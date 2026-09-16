export type ImageHostIssueCode =
	| "feed.image_url_invalid"
	| "feed.image_host_missing"
	| "feed.image_host_disallowed";

export type ImageHostValidationResult =
	| { ok: true; url: string; host: string }
	| { ok: false; code: ImageHostIssueCode };

export function parseAllowedImageHosts(
	value: string | null | undefined,
): Set<string> {
	const hosts = new Set<string>();

	for (const rawPart of (value ?? "").split(",")) {
		const part = rawPart.trim().toLowerCase();
		if (!part || part === "*" || part.startsWith("*.")) {
			continue;
		}

		try {
			const asUrl = part.includes("://")
				? new URL(part)
				: new URL(`https://${part}`);
			if (asUrl.hostname && !asUrl.hostname.includes("*")) {
				hosts.add(asUrl.hostname);
			}
		} catch {
			if (/^[a-z0-9.-]+$/i.test(part) && !part.includes("*")) {
				hosts.add(part);
			}
		}
	}

	return hosts;
}

export function validateExternalImageUrl(
	value: string,
	allowedHosts: ReadonlySet<string>,
): ImageHostValidationResult {
	let url: URL;
	try {
		url = new URL(value);
	} catch {
		return { ok: false, code: "feed.image_url_invalid" };
	}

	if (url.protocol !== "https:" && url.protocol !== "http:") {
		return { ok: false, code: "feed.image_url_invalid" };
	}

	const host = url.hostname.toLowerCase();
	if (!host) {
		return { ok: false, code: "feed.image_host_missing" };
	}

	if (!allowedHosts.has(host)) {
		return { ok: false, code: "feed.image_host_disallowed" };
	}

	return { ok: true, url: url.toString(), host };
}
