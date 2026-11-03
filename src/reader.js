import fs from "node:fs";
import readline from "node:readline";
import { parseLine } from "./parser.js";

export async function readLogFile(filePath) {
    const entries = [];
    let skipped = 0;

    const rl = readline.createInterface({
        input: fs.createReadStream(filePath),
        crlfDelay: Infinity, // treat \r\n as a single line break
    });

    for await (const line of rl) {
        if (!line.trim()) continue; // ignore blank lines

        const entry = parseLine(line);
        if (entry) {
            entries.push(entry);
        } else {
            skipped++;
        }
    }

    return { entries, skipped };
}