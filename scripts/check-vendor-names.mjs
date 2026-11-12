// Decision D-18: the product never names its AI, transcription or media vendors.
// Fails when one appears in user-facing source: pages, components, server actions, UI package, email templates.
// Vendor names may appear in comments, imports, internal docs and non-UI code.
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(fileURLToPath(import.meta.url), "..", "..");
const SCAN = ["apps/web/app", "apps/web/components", "apps/web/lib/actions", "apps/web/emails", "packages/ui/src", "packages/config/src"];
const VENDORS = ["claude", "anthropic", "deepgram", "whisper", "ffmpeg", "remotion", "pyscenedetect", "openai", "chatgpt", "gemini", "langgraph", "langchain", "elevenlabs", "assemblyai"];
const EXT = /\.(tsx?|jsx?|mdx?|json|html|css)$/;
const pattern = new RegExp(`\\b(${VENDORS.join("|")})\\b`, "i");

function* walk(dir) {
  let entries;
  try {
    entries = readdirSync(dir);
  } catch {
    return; // folder not created yet
  }
  for (const name of entries) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) {
      if (name !== "node_modules" && name !== ".next" && name !== "generated") yield* walk(p);
    } else if (EXT.test(name) && !/\.test\./.test(name)) yield p;
  }
}

/** Blanks out comments and import/export-from lines, keeping line numbers. */
function userFacing(source) {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, " "))
    .split("\n")
    .map((line) => (/^\s*(import\s|export\s.*\sfrom\s)/.test(line) ? "" : line.replace(/(^|[^:"'`])\/\/.*$/, "$1")))
    .join("\n");
}

const hits = [];
let files = 0;
for (const dir of SCAN) {
  for (const file of walk(join(root, dir))) {
    files++;
    userFacing(readFileSync(file, "utf8"))
      .split("\n")
      .forEach((line, i) => {
        const m = pattern.exec(line);
        if (m) hits.push(`${relative(root, file).replaceAll("\\", "/")}:${i + 1}  "${m[1]}"  ${line.trim().slice(0, 120)}`);
      });
  }
}

if (hits.length) {
  console.error(`Vendor names found in user-facing source (decision D-18):\n${hits.join("\n")}`);
  process.exit(1);
}
console.log(`check-vendor-names: ${files} files scanned, no vendor names in user-facing source.`);
