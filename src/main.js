import { readLogFile } from "./reader.js";

const filePath = process.argv[2];

if (!filePath) {
    console.error("Usage: node src/main.js <logfile>");
    process.exit(1);
}

const { entries, skipped } = await readLogFile(filePath);

console.log(`Parsed ${entries.length} entries, skipped ${skipped} lines`);
console.log(entries.slice(0, 3));