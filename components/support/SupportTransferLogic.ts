const usdPriceFormatter = new Intl.NumberFormat("en-US", {
  currency: "USD",
  maximumSignificantDigits: 4,
  notation: "standard",
  style: "currency",
  useGrouping: true,
});

const usdValueFormatter = new Intl.NumberFormat("en-US", {
  maximumSignificantDigits: 4,
  notation: "standard",
  useGrouping: true,
});

const SMALLEST_READABLE_USD = 0.00000001;

export function normalizeQubicAmount(value: string): string | null {
  const trimmed = value.trim();
  if (!/^\d+$/.test(trimmed) || BigInt(trimmed) <= BigInt(0)) return null;
  return BigInt(trimmed).toString();
}

export function amountValidationMessage(value: string, shouldValidate: boolean): string | null {
  if (!shouldValidate) return null;
  const trimmed = value.trim();
  if (!trimmed || !/^\d+$/.test(trimmed)) return "Enter a whole-number QUBIC amount.";
  if (BigInt(trimmed) <= BigInt(0)) return "Enter an amount greater than 0 QUBIC.";
  return null;
}

function formatSmallUsd(withCurrency: boolean) {
  const prefix = withCurrency ? "$" : "";
  return `${prefix}${SMALLEST_READABLE_USD.toFixed(8)}`;
}

export function formatUsdPrice(value: number): string {
  if (!Number.isFinite(value) || value <= 0) return "Unavailable";
  if (value < SMALLEST_READABLE_USD) return `<$${SMALLEST_READABLE_USD.toFixed(8)}`;
  return usdPriceFormatter.format(value);
}

export function formatUsdAmount(value: number): string {
  if (!Number.isFinite(value) || value < 0) return "";
  if (value === 0) return "0.00";
  if (value < SMALLEST_READABLE_USD) return formatSmallUsd(false);
  return usdValueFormatter.format(value);
}
