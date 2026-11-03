import fs from "node:fs";
import { dirname } from 'node:path';

// ------- CLI -------

const count = Number(process.argv[2]);
const outputPath = process.argv[3] ?? 'sample/system.log';

if (!Number.isInteger(count) || count <= 0) {
    console.error('Usage: node src/generateLogs.js <number>');
    process.exit(1);
}

// ------- Data -------
// Placeholders look like {name} or {name:min-max}

const MESSAGES = {
    server: {
        DEBUG: [
            'Request received: {method} {path}',
            'Worker {id} picked up job in {ms}ms',
        ],
        INFO: [
            'Server started on port {port}',
            'Health check passed',
            'Graceful shutdown initiated',
            'Configuration reloaded',
        ],
        WARN: [
            'Memory usage at {percent}%',
            'Request queue length reached {count}',
        ],
        ERROR: [
            'Unhandled exception in worker {id}',
            'Failed to bind to port {port}',
        ],
    },

    auth: {
        DEBUG: ['Token validated for user {id}', 'Session lookup took {ms}ms'],
        INFO: [
            'User {id} logged in',
            'User {id} logged out',
            'Password reset requested for user {id}',
            'New session created for user {id}',
        ],
        WARN: [
            'Multiple failed login attempts for user {id}',
            'Session expired for user {id}',
            'Login from new IP {ip} for user {id}',
        ],
        ERROR: [
            'Login failed for user {id}',
            'Invalid token signature from {ip}',
            'Account locked for user {id}',
        ],
    },

    db: {
        DEBUG: ['Query executed in {ms}ms', 'Connection {id} returned to pool'],
        INFO: [
            'Connected to database',
            'Migration {id} applied',
            'Connection pool size set to {count}',
        ],
        WARN: [
            'Slow query took {ms}ms',
            'Connection pool nearly exhausted ({count} in use)',
        ],
        ERROR: [
            'Connection timeout after {ms}ms',
            'Deadlock detected on transaction {id}',
            'Query failed: relation does not exist',
        ],
    },

    cache: {
        DEBUG: ['Cache miss for key {key}', 'Cache hit for key {key}'],
        INFO: ['Cache warmed with {count} entries', 'Cache cleared'],
        WARN: [
            'Eviction rate high: {count} keys evicted in last minute',
            'Cache hit ratio dropped to {percent}%',
        ],
        ERROR: [
            'Failed to connect to cache server at {ip}',
            'Cache write failed for key {key}',
        ],
    },

    api: {
        DEBUG: [
            'Parsed request body in {ms}ms',
            'Rate limit counter for {ip}: {count}',
        ],
        INFO: [
            'GET {path} responded 200 in {ms}ms',
            'POST {path} responded 201 in {ms}ms',
            'Webhook delivered to endpoint {id}',
        ],
        WARN: [
            'Rate limit exceeded for {ip}',
            'Deprecated endpoint {path} called',
            'GET {path} responded 404',
        ],
        ERROR: [
            'GET {path} responded 500 in {ms}ms',
            'Upstream service timeout after {ms}ms',
            'Webhook delivery failed for endpoint {id}',
        ],
    },

    payment: {
        INFO: [
            'Payment {id} processed successfully',
            'Refund issued for order {id}',
        ],
        WARN: [
            'Payment {id} retry attempt {count}',
            'Card declined for order {id}',
        ],
        ERROR: [
            'Payment gateway timeout after {ms}ms',
            'Payment {id} failed: insufficient funds',
            'Duplicate transaction detected for order {id}',
        ],
    },
};

// How often each level is picked. INFO is common, ERROR is rare
const LEVEL_WEIGHTS = { DEBUG: 1, INFO: 4, WARN: 1, ERROR: 1 };

const METHODS = ["GET", "POST", "PUT", "DELETE"];
const PATHS = ["/users", "/orders", "/login"];

// ------- Random helpers -------

function generateRandom(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pickRandom(array) {
    return array[Math.floor(Math.random() * array.length)];
}

// ------- Placeholder generators -------

const GENERATORS = {
    method: () => pickRandom(METHODS),
    path: () => pickRandom(PATHS),
    id: (min = 100, max = 999) => generateRandom(min, max),
    ms: (min = 2, max = 30) => generateRandom(min, max),
    port: (min = 1024, max = 999) => generateRandom(min, max),
    percent: (min = 20, max = 60) => generateRandom(min, max),
    count: (min = 20, max = 100) => generateRandom(min, max),
    key: () => `order:${generateRandom(1000, 9999)}`,
    ip: () =>
        [
            generateRandom(1, 126),
            generateRandom(0, 255),
            generateRandom(0, 255),
            generateRandom(1, 254),
        ].join('.'),
};

// Matches {name} and {name:min-max}
const PLACEHOLDER = /\{(\w+)(?::(\d+)-(\d+))?\}/g;

function fillTemplate(template) {
    return template.replace(PLACEHOLDER, (_, name, min, max) => {
        const generate = GENERATORS[name];
        if (!generate) {
            throw new Error(`Unknown placeholder: {${name}}`);
        }
        const range = min === undefined ? [] : [Number(min), Number(max)];
        return String(generate(...range));
    });
}

// ------- Log line pieces -------

function formatTimestamp(ms) {
    // "2026-11-02T14:03:21.000Z" -> "2026-11-02 14:03:21" (UTC)
    return new Date(ms).toISOString().replace('T', ' ').slice(0, 19);
}

function generateSource() {
    return pickRandom(Object.keys(MESSAGES));
}

function generateLevel(source) {
    // Only choose from levels this source actually has, weighted
    const weighted = Object.keys(MESSAGES[source]).flatMap((level) =>
        Array(LEVEL_WEIGHTS[level]).fill(level),
    );
    return pickRandom(weighted);
}

function generateMessage(source, level) {
    return fillTemplate(pickRandom(MESSAGES[source][level]));
}

// ------- Main -------

function main() {
    const DAY_MS = 24 * 60 * 60 * 1000;
    let time = Date.now() - 3 * DAY_MS;
    const lines = [];

    for (let i = 0; i < count; i++) {
        time += generateRandom(0, 25) * 1000;

        const source = generateSource();
        const level = generateLevel(source);
        const message = generateMessage(source, level);

        lines.push(`${formatTimestamp(time)} ${level} [${source}] ${message}`);
    }

    fs.mkdirSync(dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, lines.join('\n') + '\n', 'utf-8');
    console.log(`Wrote ${count} log lines to ${outputPath}`);
}

try {
    main();
} catch (err) {
    console.error('Error writing to file:', err);
    process.exit(1);
}
