import { describe, expect, test } from "bun:test";
import {
  amountValidationMessage,
  formatUsdAmount,
  formatUsdPrice,
  normalizeQubicAmount,
} from "./SupportTransferLogic.ts";

describe("support transfer amount helpers", () => {
  test("accepts only positive whole-number QUBIC amounts and normalizes leading zeroes", () => {
    expect(normalizeQubicAmount(" 000120 ")).toBe("120");
    expect(normalizeQubicAmount("0")).toBeNull();
    expect(normalizeQubicAmount("12.5")).toBeNull();
    expect(normalizeQubicAmount("abc")).toBeNull();
  });

  test("returns concise accessible messages for invalid and zero amounts", () => {
    expect(amountValidationMessage("", false)).toBeNull();
    expect(amountValidationMessage("0", true)).toBe("Enter an amount greater than 0 QUBIC.");
    expect(amountValidationMessage("1.5", true)).toBe("Enter a whole-number QUBIC amount.");
    expect(amountValidationMessage("12", true)).toBeNull();
  });
});

describe("support transfer USD formatting", () => {
  test("uses readable bounded decimal output without scientific notation", () => {
    for (const value of [1e-12, 0.0000123456, 0.123456, 123456.789]) {
      expect(formatUsdPrice(value)).not.toMatch(/[eE][+-]?\d+/);
      expect(formatUsdAmount(value)).not.toMatch(/[eE][+-]?\d+/);
    }
    expect(formatUsdPrice(1e-12)).toBe("<$0.00000001");
    expect(formatUsdPrice(0.123456)).toBe("$0.1235");
    expect(formatUsdAmount(123456.789)).toBe("123,500");
  });
});
