import { describe, it, expect } from "vitest";
import { openDb, insertEntries } from "../src/db.js";
import { findLogs } from "../src/queries.js";

const sample = [
    { timestamp: "2026-11-02 14:03:21", level: "ERROR", source: "auth", category: "auth", message: "Login failed for user 42" },
    { timestamp: "2026-11-02 14:03:25", level: "INFO", source: "auth", category: "auth", message: "User 17 logged in" },
    { timestamp: "2026-11-02 14:03:30", level: "ERROR", source: "db", category: "network", message: "Connection timeout after 5000ms" },
];

describe("findLogs", () => {
    it("combines filters", () => {
        const db = openDb(":memory:");
        insertEntries(db, sample);

        const rows = findLogs(db, { level: "ERROR", source: "auth" });
        expect(rows).toHaveLength(1);
        expect(rows[0].message).toBe("Login failed for user 42");
    });

    it("returns newest first and respects limit", () => {
        const db = openDb(":memory:");
        insertEntries(db, sample);

        const rows = findLogs(db, { limit: 2 });
        expect(rows.map(r => r.timestamp)).toEqual(["2026-11-02 14:03:30", "2026-11-02 14:03:25"]);
    });

    it("returns logs after and including timestamp", () => {
        const db = openDb(":memory:");
        insertEntries(db, sample);

        const rows = findLogs(db, {since: "2026-11-02 14:03:25"});
        expect(rows.map(r => r.timestamp)).toEqual(["2026-11-02 14:03:30", "2026-11-02 14:03:25"]);
    });

    it("returns logs between timestamps (excluding end timestamp)", () => {
        const db = openDb(":memory:");
        insertEntries(db, sample);

        const rows = findLogs(db, {since: "2026-11-02 14:03:21", until: "2026-11-02 14:03:25"});
        expect(rows.map(r => r.timestamp)).toEqual(["2026-11-02 14:03:21"]);
    });
});