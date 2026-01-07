import fs from "node:fs";
import path from "node:path";

const rootDir = path.resolve(process.cwd());
const srcDistDir = path.join(rootDir, "node_modules", "avc-script-template", "dist");
const srcCss = path.join(srcDistDir, "avc-script-template.css");
const srcEs = path.join(srcDistDir, "avc-script-template.es.js");
const outDir = path.join(rootDir, "src", "template-assets");
const outCss = path.join(outDir, "avc-script-template.css");
const outEs = path.join(outDir, "avc-script-template.es.js");

fs.mkdirSync(outDir, { recursive: true });

if (!fs.existsSync(srcCss)) {
  console.error(`[template:assets] Missing ${srcCss}`);
  process.exit(1);
}
if (!fs.existsSync(srcEs)) {
  console.error(`[template:assets] Missing ${srcEs}`);
  process.exit(1);
}

fs.copyFileSync(srcCss, outCss);
fs.copyFileSync(srcEs, outEs);
console.log(`[template:assets] Copied ${srcCss} -> ${outCss}`);
console.log(`[template:assets] Copied ${srcEs} -> ${outEs}`);
