import { execFileSync } from "node:child_process";

import {
	assertLocalTestDatabaseUri,
	loadLocalEnv,
} from "./integration/env.mjs";

loadLocalEnv();

const testUri = process.env.DATABASE_URI_TEST;
if (!testUri) {
	throw new Error("verify:merge-risky requires an explicit DATABASE_URI_TEST.");
}
assertLocalTestDatabaseUri(testUri);

execFileSync("pnpm", ["verify"], {
	stdio: "inherit",
	shell: process.platform === "win32",
	env: {
		...process.env,
		AMS_REQUIRE_INTEGRATION_DB: "true",
		DATABASE_URI_TEST: testUri,
		DATABASE_URI: testUri,
	},
});

console.log("verify:merge-risky: ok (required integration + build)");
