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
assert.ok(starterPages.includes("export function HomeHeroSection"));
assert.ok(starterPages.includes("export function HomeServicesSection"));

const homePage = read("src/app/(site)/page.tsx");
assert.equal(
	homePage.includes("<HomePageView"),
	false,
	"home page must compose sections, not a single HomePageView tree",
);
assert.ok(homePage.includes("<HomeHeroSection"));
assert.ok(homePage.includes("<HomeServicesSection"));

const layout = read("src/app/(site)/layout.tsx");
assert.ok(layout.includes("<StarterSiteHeader"));
assert.ok(layout.includes("<main>"));
assert.ok(layout.includes("<StarterSiteFooter"));

const globals = read("src/app/globals.css");
assert.ok(globals.includes("prefers-reduced-motion"));
assert.equal(
	/html[^>]*className=["'][^"']*dark/.test(read("src/app/layout.tsx")),
	false,
	"root html must not enable a dark theme class",
);

const fallback = read("packages/ui/src/views/starter/MediaFallback.tsx");
assert.ok(fallback.includes("aria-hidden"));

const focus = read("packages/ui/src/components/ui/button.tsx");
assert.ok(focus.includes("focus-visible"));

console.log("verify:a11y-starter: ok");
