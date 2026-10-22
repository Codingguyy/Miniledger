import { describe, expect, it } from "vitest";
import { checkLoan, checkPhone } from "../src/validate";

describe("checkPhone", () => {
  it("accepts good numbers", () => {
    expect(checkPhone("9876543210")).toBe(true);
    expect(checkPhone("+919876543210")).toBe(true);
  });
  it("rejects bad numbers", () => {
    expect(checkPhone("123")).toBe(false);
    expect(checkPhone("abcdefghij")).toBe(false);
    expect(checkPhone(undefined)).toBe(false);
  });
});

describe("checkLoan", () => {
  const good = { friendName: "Rahul", amount: "500", dueDate: "2026-12-31" };
  it("accepts a good loan", () => {
    expect(checkLoan(good)).toBeNull();
  });
  it("rejects missing name", () => {
    expect(checkLoan({ ...good, friendName: " " })).not.toBeNull();
  });
  it("rejects bad amount", () => {
    expect(checkLoan({ ...good, amount: "0" })).not.toBeNull();
    expect(checkLoan({ ...good, amount: "abc" })).not.toBeNull();
    expect(checkLoan({ ...good, amount: "-5" })).not.toBeNull();
  });
  it("rejects bad date", () => {
    expect(checkLoan({ ...good, dueDate: "31-12-2026" })).not.toBeNull();
    expect(checkLoan({ ...good, dueDate: "" })).not.toBeNull();
  });
});
