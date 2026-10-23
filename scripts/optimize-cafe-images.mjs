// Re-encode approved originals without modifying them. No image generation or remote access.
import fs from "node:fs";
import { createHash } from "node:crypto";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const sharp = require(createRequire(require.resolve("next/package.json")).resolve("sharp"));
const input = "output/image-tests/cafe";
const output = "public/demo/cafe/v2/images";
const sources = ["pilot-04-handmade-comic.png", ...fs.readdirSync(input).filter(name => /^sequence-\d+.*\.png$/.test(name)).sort()];
if (sources.length !== 12) throw new Error("Expected twelve approved originals");
fs.mkdirSync(output, { recursive: true });
const manifest = [];
for (const [index, source] of sources.entries()) {
  const id = `V${String(index + 1).padStart(2, "0")}`;
  const bytes = fs.readFileSync(`${input}/${source}`);
  const entry = { id, source, sourceSha256: createHash("sha256").update(bytes).digest("hex"), files: [] };
  for (const width of [640, 960]) {
    const path = `${output}/${id}-${width}.webp`;
    await sharp(bytes).resize({ width, withoutEnlargement: true }).webp({ quality: 48, effort: 6 }).toFile(path);
    entry.files.push({ width, bytes: fs.statSync(path).size, path });
  }
  manifest.push(entry);
}
fs.writeFileSync(`${output}/manifest.json`, JSON.stringify(manifest, null, 2));
console.log("Optimized 12 approved images; originals unchanged.");
