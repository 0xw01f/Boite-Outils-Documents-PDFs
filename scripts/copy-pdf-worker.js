const fs = require("fs");
const path = require("path");

const src = path.join(__dirname, "..", "node_modules", "pdfjs-dist", "build", "pdf.worker.min.mjs");
const dest = path.join(__dirname, "..", "public", "pdf.worker.min.mjs");

if (fs.existsSync(src)) {
  fs.copyFileSync(src, dest);
  console.log("pdf.worker.min.mjs copied to public/");
} else {
  console.error("pdf.worker.min.mjs not found in node_modules/pdfjs-dist/build/");
  process.exit(1);
}
