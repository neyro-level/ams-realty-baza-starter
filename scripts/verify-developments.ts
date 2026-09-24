import assert from "node:assert/strict";
import {
	assertDevelopmentKindFields,
	assertDevelopmentSlug,
	buildDevelopmentSemanticSlug,
	developmentUrlSlug,
} from "../src/core/developments/domain.ts";

assert.doesNotThrow(() =>
	assertDevelopmentKindFields({ kind: "residential_complex", layouts: [{ title: "1 room" }] }),
);
assert.doesNotThrow(() =>
	assertDevelopmentKindFields({ kind: "cottage_village", communications: { gas: true } }),
);
assert.throws(
	() => assertDevelopmentKindFields({ kind: "residential_complex", plotsCount: 10 }),
	/kind=residential_complex/,
);
assert.throws(
	() => assertDevelopmentKindFields({ kind: "cottage_village", progress: [{ percent: 20 }] }),
	/kind=cottage_village/,
);
assert.equal(assertDevelopmentSlug("solnechnyy"), "solnechnyy");
assert.throws(() => assertDevelopmentSlug("zhk-solnechnyy"), /without the URL prefix/);
assert.equal(developmentUrlSlug("residential_complex", "solnechnyy"), "zhk-solnechnyy");
assert.equal(developmentUrlSlug("cottage_village", "bereg"), "kp-bereg");
assert.equal(
	buildDevelopmentSemanticSlug({ base: "solnechnyy", citySlug: "rostov", hasRealCollision: false }),
	"solnechnyy",
);
assert.equal(
	buildDevelopmentSemanticSlug({ base: "solnechnyy", citySlug: "rostov", hasRealCollision: true }),
	"solnechnyy-rostov",
);

console.log("verify:developments: ok");
