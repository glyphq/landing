import { createQueryClient } from "@qubic.org/rpc";

export type Supporter = {
  name: string;
  identity: string;
  amountBand: "supporter" | "builder" | "sustainer";
  since: string;
  url?: string;
};

/**
 * Recognition is opt-in. Add a supporter only after the transfer and the
 * requested public name have both been verified.
 */
export const recognizedSupporters: Supporter[] = [];

export const supportConfig = {
  identity: "GLYPHZNLNDWPQDQOAXNPXSEHAWTCHUVRBKJTUKIIXGGVBAYFMKDYZXBHEQBA",
  presets: [1_000_000, 10_000_000, 100_000_000],
};

type AggregatedSupport = { identity: string; total: bigint; since: number };

function bandFor(total: bigint): Supporter["amountBand"] {
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
  return [...byIdentity.values()]
    .sort((a, b) => b.total > a.total ? 1 : b.total < a.total ? -1 : 0)
    .map((supporter) => {
      const recognized = recognizedByIdentity.get(supporter.identity);
      return recognized ?? {
        name: "Anonymous supporter",
        identity: supporter.identity,
        amountBand: bandFor(supporter.total),
        since: supporter.since ? dateLabel(supporter.since) : "recently",
      };
    });
}
