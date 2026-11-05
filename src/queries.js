export function countAll(db) {
    return db.prepare('SELECT COUNT(*) AS total FROM logs').get().total;
}

export function countByLevel(db) {
    return db
        .prepare(
            `
        SELECT level, COUNT(*) AS count
        FROM logs
        GROUP BY level
        ORDER BY count DESC
    `,
        )
        .all();
}

export function countByCategory(db) {
    return db
        .prepare(
            `
        SELECT category, COUNT(*) as entries
        FROM logs
        GROUP BY category
        ORDER BY entries DESC
    `,
        )
        .all();
}

export function recentByLevel(db, level, limit = 5) {
    return db
        .prepare(
            `
        SELECT * FROM logs
        WHERE level = ?
        ORDER BY timestamp DESC
        LIMIT ?
    `,
        )
        .all(level, limit);
}

export function latestErrorByTerm(db, level, term, limit = 5) {
    return db
        .prepare(
            `
        SELECT timestamp, source, message
        FROM logs
        WHERE level = ? AND message LIKE ?
        ORDER BY timestamp DESC
        LIMIT ?
    `,
        )
        .all(level, `%${term}%`, limit);
}

// Every filter is optional. The SQL text only ever contains fixed
// strings; user input travels separately as parameters.
export function findLogs(
    db,
    { term, level, source, category, since, until, limit = 20 } = {},
) {
    const conditions = [];
    const params = [];

    if (term) {
        conditions.push('message LIKE ?');
        params.push(`%${term}%`);
    }
    if (level) {
        conditions.push('level = ?');
        params.push(level);
    }
    if (source) {
        conditions.push('source = ?');
        params.push(source);
    }
    if (category) {
        conditions.push('category = ?');
        params.push(category);
    }
    if (since) {
        conditions.push('timestamp >= ?');
        params.push(since);
    }
    if (until) {
        conditions.push('timestamp < ?'); // exclusive
        params.push(until);
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    return db
        .prepare(
            `
        SELECT timestamp, level, source, category, message
        FROM logs
        ${where}
        ORDER BY timestamp DESC
        LIMIT ?
    `,
        )
        .all(...params, limit);
}
