import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const requiredFiles = [
  "index.html",
  "src/app.jsx",
  "src/styles.css",
  "data/dashboard-data.json",
  "data/austria-bundeslander.geojson"
];

const forbiddenPatterns = [
  /C:\\Users/i,
  /\/Users\//i,
  /Desktop/i,
  /api[_-]?key\s*[:=]/i,
  /client[_-]?secret\s*[:=]/i,
  /access[_-]?token\s*[:=]/i,
  /\b(sk|pk|ghp|gho|AIza|ya29|xox[baprs])-?[A-Za-z0-9_-]{16,}\b/i
];

for (const file of requiredFiles) {
  const absolute = path.join(root, file);
  if (!fs.existsSync(absolute)) {
    throw new Error(`Missing required static asset: ${file}`);
  }
}

JSON.parse(fs.readFileSync(path.join(root, "data/dashboard-data.json"), "utf8"));
JSON.parse(fs.readFileSync(path.join(root, "data/austria-bundeslander.geojson"), "utf8"));

for (const file of requiredFiles.concat(["package.json", "vercel.json", "README.md"]).filter((file) => fs.existsSync(path.join(root, file)))) {
  const text = fs.readFileSync(path.join(root, file), "utf8");
  const match = forbiddenPatterns.find((pattern) => pattern.test(text));
  if (match) {
    throw new Error(`Static verification failed in ${file}: ${match}`);
  }
}

console.log("Static verification passed. The app can be served from a hosted path with local JSON/assets.");
