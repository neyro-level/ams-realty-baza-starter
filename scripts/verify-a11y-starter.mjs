import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

function read(relative) {
	return readFileSync(relative, "utf8");
}

const leadForm = read("packages/ui/src/views/starter/LeadFormView.tsx");
assert.ok(leadForm.includes("FieldLabel htmlFor={ids.name}"));
assert.ok(leadForm.includes("FieldLabel htmlFor={ids.phone}"));
assert.ok(leadForm.includes("FieldError"));
assert.ok(leadForm.includes("successRef.current?.focus()"));

const starterPages = read("packages/ui/src/views/starter/StarterPages.tsx");
assert.equal([...starterPages.matchAll(/<h1\b/g)].length >= 4, true);

const homeCss = read("packages/ui/src/styles/home-page.css");
assert.ok(homeCss.includes("prefers-reduced-motion"));

const globals = read("src/app/globals.css");
assert.ok(
	globals.includes("prefers-reduced-motion") ||
		homeCss.includes("prefers-reduced-motion"),
);

const fallback = read("packages/ui/src/views/starter/MediaFallback.tsx");
assert.ok(fallback.includes("aria-hidden"));

const focus = read("packages/ui/src/components/ui/button.tsx");
assert.ok(focus.includes("focus-visible"));

console.log("verify:a11y-starter: ok");
