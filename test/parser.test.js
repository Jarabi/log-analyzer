import { describe, it, expect } from "vitest";
import { parseLine } from "../src/parser";

describe("parseLine", () => {
    it("parses a valid line", () => {
        const result = parseLine("2026-11-02 14:03:21 ERROR [auth] Login failed for user 42");
        expect(result).toEqual({
            timestamp: "2026-11-02 14:03:21",
            level: "ERROR",
            source: "auth",
            message: "Login failed for user 42",
        });
    });

    it("returns null for a malformed line", () => {
        expect(parseLine("this is not a log line")).toBeNull();
        expect(parseLine("2026-11-02 14:03:21 [ERROR] auth [Login failed for user 42]")).toBeNull();
    })
});