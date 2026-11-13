// Draws the app icons from the Nelio mark (accent rounded square + white spark, as in the Logo component).
// Run from the repository root: node apps/web/scripts/make-icons.mjs
import { createRequire } from "node:module";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const sharp = require("sharp");
const out = join(dirname(fileURLToPath(import.meta.url)), "..", "public", "icons");
mkdirSync(out, { recursive: true });

const SPARK = "M12 3l2.2 6.3L20 12l-5.8 2.7L12 21l-2.2-6.3L4 12l5.8-2.7z"; // icons.py "spark"

/** Standard icon: rounded square. Maskable: full-bleed background with the spark inside the safe zone. */
const svg = (maskable) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  ${maskable ? '<rect width="512" height="512" fill="#2F5BFF"/>' : '<rect width="512" height="512" rx="164" fill="#2F5BFF"/>'}
  <g transform="translate(256 256) scale(${maskable ? 11 : 15}) translate(-12 -12)">
    <path d="${SPARK}" fill="none" stroke="#FFFFFF" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>
  </g>
</svg>`;

writeFileSync(join(out, "icon.svg"), svg(false));
for (const [name, size, maskable] of [["icon-192.png", 192, false], ["icon-512.png", 512, false], ["maskable-512.png", 512, true], ["apple-touch-icon.png", 180, true]]) {
  await sharp(Buffer.from(svg(maskable))).resize(size, size).png().toFile(join(out, name));
}
console.log("icons written to", out);
