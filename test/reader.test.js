import { describe, it, expect } from "vitest";
import { readLogFile } from "../src/reader";

describe("readLogFile", () => {
    it("parses valid lines and counts malformed ones", async () => {
        const { entries, skipped } = await readLogFile("sample/messy.log");
        expect(entries).toHaveLength(2);
        expect(skipped).toBe(1);
    });
});