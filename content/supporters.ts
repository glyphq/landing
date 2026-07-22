import { createQueryClient } from "@qubic.org/rpc";

export type Supporter = {
  name: string;
  identity: string;
  amount: string;
  amountBand: "supporter" | "builder" | "sustainer" | "anchor";
  since: string;
  url?: string;
  preview?: boolean;
};

/**
 * Recognition is opt-in. Add a supporter only after the transfer and the
 * requested public name have both been verified.
 */
export const recognizedSupporters: Supporter[] = [];

export const supportConfig = {
  identity: "GLYPHZNLNDWPQDQOAXNPXSEHAWTCHUVRBKJTUKIIXGGVBAYFMKDYZXBHEQBA",
};

type AggregatedSupport = { identity: string; total: bigint; since: number };

const previewSupporters: Supporter[] = Array.from({ length: 50 }, (_, index) => {
  const seed = `PREVIEW${String(index + 1).padStart(2, "0")}`;
  const amount = index === 47
    ? "1250000000"
    : index === 48
      ? "2400000000"
      : String(((index * 37) % 320 + 1) * 1_000_000 + (index % 4) * 250_000);
  const total = BigInt(amount);
  return {
    name: `Preview identity ${String(index + 1).padStart(2, "0")}`,
    identity: `${seed}NODE`.repeat(12).slice(0, 60),
    amount,
    amountBand: bandFor(total),
    since: new Intl.DateTimeFormat("en-US", { month: "short", year: "numeric", timeZone: "UTC" }).format(Date.UTC(2026, 5 - (index % 18), 1)),
    preview: true,
  };
});

function bandFor(total: bigint): Supporter["amountBand"] {
  if (total >= BigInt(1_000_000_000)) return "anchor";
  if (total >= BigInt(100_000_000)) return "sustainer";
  if (total >= BigInt(10_000_000)) return "builder";
  return "supporter";
}

function dateLabel(timestamp: number) {
  return new Intl.DateTimeFormat("en-US", { month: "short", year: "numeric", timeZone: "UTC" }).format(timestamp);
}

export async function getSupporters(): Promise<Supporter[]> {
  const query = createQueryClient();
  const result = await query.getTransactionsForIdentity({
    identity: supportConfig.identity,
    filters: { destination: supportConfig.identity },
    ranges: { amount: { gt: "0" } },
    pagination: { offset: 0, size: 1_000 },
  });

  if (!result.ok) return recognizedSupporters;

  const byIdentity = new Map<string, AggregatedSupport>();
  for (const transaction of result.value.transactions) {
    if (!transaction.source || !transaction.amount || transaction.moneyFlew === false) continue;
    const timestamp = Number(transaction.timestamp ?? 0);
    const existing = byIdentity.get(transaction.source);
    byIdentity.set(transaction.source, {
      identity: transaction.source,
      total: (existing?.total ?? BigInt(0)) + BigInt(transaction.amount),
      since: existing ? Math.min(existing.since, timestamp || existing.since) : timestamp,
    });
  }

  const recognizedByIdentity = new Map(recognizedSupporters.map((supporter) => [supporter.identity, supporter]));
  const onChain = [...byIdentity.values()]
    .sort((a, b) => b.total > a.total ? 1 : b.total < a.total ? -1 : 0)
    .map((supporter) => {
      const recognized = recognizedByIdentity.get(supporter.identity);
      return recognized ?? {
        name: "Anonymous supporter",
        identity: supporter.identity,
        amount: supporter.total.toString(),
        amountBand: bandFor(supporter.total),
        since: supporter.since ? dateLabel(supporter.since) : "recently",
      };
    });

  return process.env.SUPPORTER_PREVIEW === "true"
    ? [...onChain, ...previewSupporters.slice(0, Math.max(0, 50 - onChain.length))]
    : onChain;
}
