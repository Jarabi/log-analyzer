import { readLogFile } from "./reader.js";

const filePath = process.argv[2];

if (!filePath) {
    console.error("Usage: node src/main.js <logfile>");
    process.exit(1);
}

const { entries, skipped } = await readLogFile(filePath);
const counts = {};

for (const entry of entries) {
    counts[entry.category] = (counts[entry.category] ?? 0) + 1;
}

console.log(`Parsed ${entries.length} entries, skipped ${skipped} lines`);
console.table(counts);