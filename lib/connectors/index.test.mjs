import { describe, expect, test } from "bun:test";
import { createConnectRequest, parseCallbackResponse, relayUrls } from "@glyph-oss/connect";
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
  test("binds the prepared relay v2 callback to the request envelope", () => {
    const request = createConnectRequest({
      type: "connect",
      dapp: { name: "Glyph Support", origin: "https://glyphq.org" },
      permissions: ["transfer"],
    });
    const prepared = { ...relayUrls({
      session: "A".repeat(32),
      callbackCap: `c_${"B".repeat(30)}`,
      readCap: `r_${"C".repeat(30)}`,
    }), registered: true };

    const envelope = createGlyphRelayEnvelope(request, prepared);

    expect(envelope.request.nonce).toBe(request.nonce);
    expect(envelope.callback).toBe(prepared.callbackUrl);
    expect(envelope.callback).toContain("/v2/callback/");
    expect(envelope.callback).not.toContain(request.nonce);
  });

  test("creates separate relay v2 callback and read capabilities", () => {
    const urls = relayUrls({
      session: "A".repeat(32),
      callbackCap: `c_${"B".repeat(30)}`,
      readCap: `r_${"C".repeat(30)}`,
    });

    expect(urls.callbackUrl).toBe("https://relay.glyphq.org/v2/callback/AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/c_BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB");
    expect(urls.streamUrl).toBe("https://relay.glyphq.org/v2/stream/AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/r_CCCCCCCCCCCCCCCCCCCCCCCCCCCCCC");
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
