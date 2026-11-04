// Order matters: the first rule that matches wins
const RULES = [
    {categoty: "payment", pattern: /payment|refund|card declined|duplicate transaction/i },
    {categoty: "network", pattern: /timeout|failed to connect|upstream/i },
    {categoty: "database", pattern: /query|deadlock|migration|connection|database/i },
    {categoty: "cache", pattern: /cache/i },
    {categoty: "performance", pattern: /memory usage|queue length|slow|eviction/i },
    {categoty: "http", pattern: /responded|endpoint|webhook|rate limit|\brequest\b/i },
    {categoty: "auth", pattern: /login|logged|token|session|password|account locked/i },
    {categoty: "system", pattern: /server|health check|shutdown|configuration|worker|exception|port/i },
];

export function categorize(entry) {
    const rule = RULES.find(r => r.pattern.test(entry.message));
    return rule ? rule.categoty : "uncategorized";
}

// Why the order:

// 1. /login is also a URL path. With auth above http, a line like 'GET /login responded 200'
// landed in auth because it contains “login”. The fix was to put http before auth.

// 2. “request” is also inside “requested”. 'Password reset requested for user 42' matched the http rule.
// The \b word boundaries in \brequest\b make it match “Request received” but not “requested”.

// 3. `payment` is above `network`, so "Payment gateway timeout" counts as payment, not network.
// 4. `network` is above `database`, so "Connection timeout after 4423ms" counts as network.
// 5. `performance` is above `http`, so "Request queue length reached 55" counts as performance.