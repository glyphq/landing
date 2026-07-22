import {
  createWalletConnectConnector,
  extensionConnector,
  type WalletConnector,
} from "@qubic.org/react";
import { glyphConnector } from "./glyph";

const walletConnectProjectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? "95b68d7bcc2f7307785f3869d0ec4733";
const appOrigin = process.env.NEXT_PUBLIC_APP_ORIGIN?.trim() || "https://glyphq.org";

const walletConnectConnector = createWalletConnectConnector({
  createClient: async () => {
    if (!walletConnectProjectId) {
      throw new Error("WalletConnect is not configured yet.");
    }
    const { default: SignClient } = await import("@walletconnect/sign-client");
    return SignClient.init({
      projectId: walletConnectProjectId,
      telemetryEnabled: false,
      metadata: {
        name: "Glyph Support",
        description: "Support independent software built for Qubic.",
        url: appOrigin,
        icons: [`${appOrigin}/favicon/icon.png`],
      },
    });
  },
});

export const connectors: WalletConnector[] = [glyphConnector, extensionConnector, walletConnectConnector];
export const hasWalletConnectProjectId = Boolean(walletConnectProjectId);
