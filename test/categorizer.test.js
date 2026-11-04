import { describe, it, expect } from "vitest";
import { categorize } from "../src/categorizer";

describe("categorize", () => {
    it("categorizes a database error", () => {
        expect(categorize({ message: "Deadlock detected on transaction 512" })).toBe("database");
    });

    it("does not treat a /login path as auth", () => {
        expect(categorize({ message: "GET /login responded 200 in 12ms" })).toBe("http");
    });

    it("returns uncategorized when nothing matches", () => {
        expect(categorize({ message: "something completely new" })).toBe("uncategorized");
    });

    it("categorizes a payment error", () => {
        expect(categorize({ message: "Payment gateway timeout" })).toBe("payment");
    });
});