import {
  createWalletConnectConnector,
  extensionConnector,
  type WalletConnector,
} from "@qubic.org/react";
import { glyphConnector } from "./glyph";

const walletConnectProjectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? "95b68d7bcc2f7307785f3869d0ec4733";

const walletConnectConnector = createWalletConnectConnector({
  createClient: async () => {
    if (!walletConnectProjectId) {
      throw new Error("WalletConnect is not configured yet.");
    }
    const { default: SignClient } = await import("@walletconnect/sign-client");
    return SignClient.init({
      projectId: walletConnectProjectId,
      metadata: {
        name: "Glyph Support",
        description: "Support independent software built for Qubic.",
        url: process.env.NEXT_PUBLIC_APP_ORIGIN ?? "https://glyphq.org",
        icons: ["https://glyphq.org/favicon.ico"],
      },
    });
  },
});

export const connectors: WalletConnector[] = [glyphConnector, extensionConnector, walletConnectConnector];
export const hasWalletConnectProjectId = Boolean(walletConnectProjectId);
