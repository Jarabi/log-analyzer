import { Command } from "commander";
import chalk from "chalk";
import { readLogFile } from "./reader.js";
import { openDb, clearLogs, insertEntries } from "./db.js";
import { countAll, countByLevel, countByCategory, findLogs } from "./queries.js";

const LEVEL_COLORS = {
    ERROR: chalk.red,
    WARN: chalk.yellow,
    INFO: chalk.green,
    DEBUG: chalk.gray,
}

function formatRow(row) {
    const paint = LEVEL_COLORS[row.level] ?? ((text) => text);
    const level = paint(row.level.padEnd(5));
    return `${chalk.dim(row.timestamp)} ${level} ${chalk.cyan(`[${row.source}]`)} ${row.message}`;
}

const program = new Command();

program
    .name("analyzer")
    .description("Parse, categorize and search application log files")
    .version("0.1.0");

program
    .command("import <file>")
    .description("parse a log file and load it into the database (replaces existing data)")
    .action(async(file) => {
        const { entries, skipped } = await readLogFile(file);
        const db = openDb();
        clearLogs(db);
        insertEntries(db, entries);
        console.log(`Imported ${countAll(db)} entries (${skipped} lines skipped)`);
        db.close();
    });

program
    .command("stats")
    .description("show entry counts by level and by category")
    .action(() => {
        const db = openDb();
        console.log(chalk.bold(`\nTotal entries: ${countAll(db)}`));
        console.log(chalk.bold("\nBy level"));
        console.table(countByLevel(db));
        console.log(chalk.bold("\nBy category"));
        console.table(countByCategory(db));
        db.close();
    });

program
    .command("search [term]")
    .description("search messages, optionally filtered by level, source or category")
    .option("-l, --level <level>", "DEBUG, INFO, WARN, ERROR")
    .option("-s, --source <source>", "e.g. auth, db, api")
    .option("-c, --category <category>", "e.g. network, database")
    .option("-d, --since <date>", "e.g. 2026-11-02 or '2026-11-02 14:30'")
    .option("-u, --until <date>", "e.g. 2026-11-02 or '2026-11-02 14:30'")
    .option("-n, --limit <number>", "maximum rows to show", "20")
    .action((term, options) => {
        const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}( \d{2}:\d{2}(:\d{2})?)?$/;
        const limit = Number(options.limit);

        if (!Number.isInteger(limit) || limit <= 0) {
            console.error("--limit must be a positive whole number");
            process.exit(1);
        }

        if (options.since && !DATE_PATTERN.test(options.since)) {
            console.error('--since must look like 2026-11-02 or "2026-11-02 14:30"');
            process.exit(1);
        }

        if (options.until && !DATE_PATTERN.test(options.until)) {
            console.error('--until must look like 2026-11-02 or "2026-11-02 14:30"');
            process.exit(1);
        }

        const db = openDb();
        const rows = findLogs(db, {
            term,
            level: options.level?.toUpperCase(),
            source: options.source,
            category: options.category,
            since: options.since,
            until: options.until,
            limit,
        });

        if (rows.length === 0) {
            console.log("No matching entries.")
        } else {
            rows.forEach(row => console.log(formatRow(row)));
            console.log(chalk.dim(`\n${rows.length} shown (limit ${limit})`));
        }
        db.close();
    });

await program.parseAsync();