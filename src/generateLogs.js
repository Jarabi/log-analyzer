import fs from "node:fs";

const logEntries = process.argv[2];

if (!logEntries) {
    console.error("Usage: node src/generateLogs.js <count>");
    process.exit(1);
}

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

function generateRandom(min, max) {
    const minCeil = Math.ceil(min);
    const maxFloor = Math.floor(max);
    return Math.floor(Math.random() * (maxFloor - minCeil + 1)) + minCeil;
}

function pickRandom(array) {
    const index = Math.floor(Math.random() * array.length);
    return array[index];
}

function generateTimestamp() {
    const today = new Date().toISOString().split('T');
    const date = today[0];
    const time = today[1].split('.')[0];

    return `${date} ${time}`;
}

function generateSource() {
    return pickRandom(Object.keys(MESSAGES));
}

function generateLevel(source) {
    let level = pickRandom([
        'INFO',
        'DEBUG',
        'INFO',
        'WARN',
        'INFO',
        'ERROR',
        'INFO',
    ]);

    return MESSAGES[source][level] ? level : 'INFO';
}

function formatMessage(source, level) {
    const paths = ['/users', '/orders', 'login'];
    const methods = ['GET', 'POST', 'PUT', 'DELETE'];
    const pctLimits = source === 'server' ? [60, 99] : [20, 60];
    const msLimits = ['ERROR', 'WARN'].includes(level) ? [100, 500] : [2, 30];

    let message = pickRandom(MESSAGES[source][level]);

    message = message.replace(/\{path\}/g, pickRandom(paths));
    message = message.replace(/\{method\}/g, pickRandom(methods));
    message = message.replace(/\{id\}/g, generateRandom(100, 1000));
    message = message.replace(/\{ms\}/g, generateRandom(msLimits[0], msLimits[1]));
    message = message.replace(/\{port\}/g, generateRandom(100, 10000));
    message = message.replace(/\{percent\}/g, generateRandom(pctLimits[0], pctLimits[1]));
    message = message.replace(/\{count\}/g, generateRandom(20, 100));
    message = message.replace(/\{key\}/g, `order:${generateRandom(1000, 9999)}`);
    if (message.includes("{ip}")) {
        const oct1 = generateRandom(1, 126);
        const oct2 = generateRandom(0, 255);
        const oct3 = generateRandom(0, 255);
        const oct4 = generateRandom(1, 254);
        message = message.replace(/\{ip\}/g, `${oct1}.${oct2}.${oct3}.${oct4}`);
    }
    return message;
}

function main() {
    const logs = [];
    
    for (let i = 0; i < logEntries; i++) {
        const timestamp = generateTimestamp();
        const source = generateSource();
        const level = generateLevel(source);
        const message = formatMessage(source, level);
    
        logs.push(`${timestamp} ${level} [${source}] ${message}`);
    }

    // Write to file
    try {
        const data = logs.join('\n');

        fs.writeFileSync('sample/system.log', data, 'utf-8');
        console.log('Logs written successfully.')
    } catch(err) {
        console.error('Error writing to file:', err);
    }
}

main();