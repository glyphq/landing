import { describe, expect, test } from "bun:test";
import { withExtensionDestination, withWalletConnectSender } from "./index.ts";

const IDENTITY = "A".repeat(60);

describe("withWalletConnectSender", () => {
  test("adds the connected identity as from when sending", async () => {
    let request = null;
    const connector = withWalletConnectSender({
      id: "walletconnect",
      isAvailable: () => true,
      connect: async () => ({ identity: IDENTITY }),
      getAccount: async () => ({ identity: IDENTITY }),
      disconnect: async () => undefined,
      sendTransaction: async (transaction) => {
        request = transaction;
        return {};
      },
      signTransaction: async () => ({}),
      signMessage: async () => ({}),
      on: () => () => undefined,
    });

    await connector.connect();
    await connector.sendTransaction({ destination: "B".repeat(60), amount: "100000" });

    expect(request).toEqual({ destination: "B".repeat(60), amount: "100000", from: IDENTITY });
  });
});

describe("withExtensionDestination", () => {
  test("maps destination to the extension's toIdentity field", async () => {
    let request = null;
    const connector = withExtensionDestination({
      id: "qubic-extension",
      isAvailable: () => true,
      connect: async () => ({ identity: IDENTITY }),
      getAccount: async () => ({ identity: IDENTITY }),
      disconnect: async () => undefined,
      sendTransaction: async (transaction) => {
        request = transaction;
        return {};
      },
      signTransaction: async () => ({}),
      signMessage: async () => ({}),
      on: () => () => undefined,
    });

    await connector.sendTransaction({ destination: "B".repeat(60), amount: "100000" });

    expect(request).toEqual({
      destination: "B".repeat(60),
      toIdentity: "B".repeat(60),
      amount: "100000",
    });
  });
});
