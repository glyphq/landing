import {
  createWalletConnectConnector,
  extensionConnector,
  type WalletConnector,
} from "@qubic.org/react";
import { glyphConnector } from "./glyph";

const walletConnectProjectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? "95b68d7bcc2f7307785f3869d0ec4733";
const appOrigin = process.env.NEXT_PUBLIC_APP_ORIGIN?.trim() || "https://glyphq.org";

type WalletConnectTransaction = Parameters<WalletConnector["sendTransaction"]>[0] & {
  from: string;
};
type ExtensionTransaction = Parameters<WalletConnector["sendTransaction"]>[0] & {
  toIdentity: string;
};

export function withWalletConnectSender(connector: WalletConnector): WalletConnector {
  let connectedIdentity: string | null = null;

  const senderIdentity = async () => {
    const account = await connector.getAccount();
    connectedIdentity = account?.identity ?? connectedIdentity;
    if (!connectedIdentity) {
      throw new Error("WalletConnect did not provide a sender identity. Reconnect the wallet and try again.");
    }
    return connectedIdentity;
  };

  return {
    ...connector,
    async connect(options) {
      const account = await connector.connect(options);
      connectedIdentity = account.identity;
      return account;
    },
    async getAccount() {
      const account = await connector.getAccount();
      connectedIdentity = account?.identity ?? null;
      return account;
    },
    async disconnect() {
      connectedIdentity = null;
      await connector.disconnect();
    },
    async sendTransaction(transaction) {
      const from = await senderIdentity();
      return connector.sendTransaction({ ...transaction, from } as WalletConnectTransaction);
    },
    async signTransaction(transaction) {
      const from = await senderIdentity();
      return connector.signTransaction({ ...transaction, from } as WalletConnectTransaction);
    },
  };
}

export function withExtensionDestination(connector: WalletConnector): WalletConnector {
  const extensionTransaction = (transaction: Parameters<WalletConnector["sendTransaction"]>[0]) => ({
    ...transaction,
    toIdentity: transaction.destination,
  }) as ExtensionTransaction;

  return {
    ...connector,
    sendTransaction(transaction) {
      return connector.sendTransaction(extensionTransaction(transaction));
    },
    signTransaction(transaction) {
      return connector.signTransaction(extensionTransaction(transaction));
    },
  };
}

const walletConnectConnector = withWalletConnectSender(createWalletConnectConnector({
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
}));

export const connectors: WalletConnector[] = [glyphConnector, withExtensionDestination(extensionConnector), walletConnectConnector];
export const hasWalletConnectProjectId = Boolean(walletConnectProjectId);
