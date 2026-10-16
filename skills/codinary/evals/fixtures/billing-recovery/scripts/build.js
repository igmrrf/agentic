import { copyFile, mkdir } from "node:fs/promises";

const DIST_DIRECTORY = new URL("../dist/", import.meta.url);
const SOURCE_FILES = ["billing.js", "cli.js"];

await mkdir(DIST_DIRECTORY, { recursive: true });
for (const filename of SOURCE_FILES) {
  await copyFile(
    new URL(`../src/${filename}`, import.meta.url),
    new URL(filename, DIST_DIRECTORY),
  );
}
