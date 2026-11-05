export function countByLevel(db) {
    return db.prepare(`
        SELECT level, COUNT(*) AS count
        FROM logs
        GROUP BY level
        ORDER BY count DESC
    `).all();
}

export function countByCategory(db) {
    return db.prepare(`
        SELECT category, COUNT(*) as entries
        FROM logs
        GROUP BY category
        ORDER BY entries DESC
    `).all();
}

export function recentByLevel(db, level, limit = 5) {
    return db.prepare(`
        SELECT * FROM logs
        WHERE level = ?
        ORDER BY timestamp DESC
        LIMIT ?
    `).all(level, limit);
}

export function latestErrorByTerm(db, level, term, limit = 5) {
    return db.prepare(`
        SELECT timestamp, source, message
        FROM logs
        WHERE level = ? AND message LIKE ?
        ORDER BY timestamp DESC
        LIMIT ?
    `).all(level, `%${term}%`, limit);
}

export function searchMessages(db, term, limit = 10) {
    return db.prepare(`
        SELECT timestamp, level, source, message FROM logs
        WHERE message LIKE ?
        ORDER BY timestamp DESC
        LIMIT ?
    `).all(`%${term}%`, limit);
}