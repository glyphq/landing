export type Supporter = {
  name: string;
  amountBand: "supporter" | "builder" | "sustainer";
  since: string;
  url?: string;
};

/**
 * Recognition is opt-in. Add a supporter only after the transfer and the
 * requested public name have both been verified.
 */
export const supporters: Supporter[] = [];

export const supportConfig = {
  identity: process.env.NEXT_PUBLIC_QUBIC_SUPPORT_IDENTITY?.trim() ?? "",
  presets: [1_000_000, 10_000_000, 100_000_000],
};
