import Database from "better-sqlite3";

export function openDb(filePath = "logs.db") {
    const db = new Database(filePath);

    db.exec(`
        CREATE TABLE IF NOT EXISTS logs (
            id        INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp TEXT NOT NULL,
            level     TEXT NOT NULL,
            source    TEXT NOT NULL,
            category  TEXT NOT NULL,
            message   TEXT NOT NULL
        );
        CREATE INDEX IF NOT EXISTS idx_logs_timestamp ON logs (timestamp);
        CREATE INDEX IF NOT EXISTS idx_logs_level     ON logs (level);
        CREATE INDEX IF NOT EXISTS idx_logs_source    ON logs (source);
        CREATE INDEX IF NOT EXISTS idx_logs_category  ON logs (category);
    `);

    return db;
}

export function clearLogs(db) {
    db.exec("DELETE FROM logs");
}

export function insertEntries(db, entries) {
    const insert = db.prepare(`
        INSERT INTO logs (timestamp, level, source, category, message)
        VALUES (@timestamp, @level, @source, @category, @message)
    `);

    const insertAll = db.transaction(rows => {
        for (const row of rows) insert.run(row);
    });

    insertAll(entries);
}