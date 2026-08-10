import { describe, expect, test } from "bun:test";
import { createConnectRequest, parseCallbackResponse, subscribeViaRelay } from "@glyph-oss/connect";
import { createGlyphRelayEnvelope } from "./glyph.ts";
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

describe("Glyph Connect relay hardening", () => {
  test("binds the official relay callback to the request nonce", () => {
    const request = createConnectRequest({
      type: "connect",
      dapp: { name: "Glyph Support", origin: "https://glyphq.org" },
      permissions: ["transfer"],
    });

    const envelope = createGlyphRelayEnvelope(request);

    expect(envelope.request.nonce).toBe(request.nonce);
    expect(envelope.callback).toBe(`https://relay.glyphq.org/v1/callback/${request.nonce}`);
  });

  test("rejects relay subscriptions without an expected result type", () => {
    const nonce = "A".repeat(16);

    expect(() => subscribeViaRelay(nonce)).toThrow("expectedType is required");
  });

  test("rejects callback results for the wrong request", () => {
    const expected = { nonce: "A".repeat(16), type: "connect" };

    expect(() => parseCallbackResponse({
      status: "connected",
      type: "connect",
      nonce: "B".repeat(16),
      identity: IDENTITY,
      permissions: ["transfer"],
    }, expected)).toThrow("Callback nonce does not match");
  });
});
