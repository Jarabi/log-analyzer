import { readLogFile } from "./reader.js";
import { openDb, clearLogs, insertEntries } from "./db.js";

const filePath = process.argv[2];
if (!filePath) {
    console.error("Usage: node src/import.js <logfile>");
    process.exit(1);
}

const { entries, skipped } = await readLogFile(filePath);

const db = openDb();
clearLogs(db);
insertEntries(db, entries);

// --- total imported queries
const { total } = db.prepare("SELECT COUNT(*) AS total FROM logs").get();
console.log(`Imported ${total} entries (${skipped} lines skipped)`);
db.close();