import { describe, it, expect } from "vitest";
import { openDb, insertEntries } from "../src/db";

describe("insertQueries", () => {
    it("stores queries and lets us query them", () => {
        const db = openDb(":memory:");

        insertEntries(db, [
            { timestamp: "2026-11-02 14:03:21", level: "ERROR", source: "auth", category: "auth", message: "Login failed for user 42" },
            { timestamp: "2026-11-02 14:03:25", level: "INFO", source: "auth", category: "auth", message: "User 17 logged in" },
        ]);

        const errors = db.prepare("SELECT * FROM logs WHERE level = ?").all("ERROR");
        expect(errors).toHaveLength(1);
        expect(errors[0].message).toBe("Login failed for user 42");
    });
});