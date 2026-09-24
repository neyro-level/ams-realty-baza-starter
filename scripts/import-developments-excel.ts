import { readFile } from "node:fs/promises";
import { basename, resolve } from "node:path";
import { getPayload } from "payload";
import config from "../payload.config.ts";
import { importDevelopmentExcel } from "../src/core/ingest/development-excel.ts";
import { createPayloadDevelopmentExcelRepository } from "../src/core/data-access/system/development-excel-repository.ts";

const argument = (name: string): string | undefined =>
	process.argv.find((item) => item.startsWith(`--${name}=`))?.slice(name.length + 3);
const file = argument("file");
const sourceKey = argument("source-key");
const mode = process.argv.includes("--apply") ? "apply" : "dry-run";
if (!file || !sourceKey) {
	throw new Error("Usage: --file=<xlsx> --source-key=<canonical-slug> [--apply]");
}
if (!file.toLowerCase().endsWith(".xlsx")) throw new Error("Only .xlsx workbooks are accepted.");

const absoluteFile = resolve(file);
const payload = await getPayload({ config });
const report = await importDevelopmentExcel({
	buffer: await readFile(absoluteFile),
	fileName: basename(absoluteFile),
	sourceKey,
	mode,
	now: new Date(),
	repository: createPayloadDevelopmentExcelRepository(payload),
});
console.log(JSON.stringify(report, null, 2));
if (report.errors > 0) process.exitCode = 1;
