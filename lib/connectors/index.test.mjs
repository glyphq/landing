import { describe, expect, test } from "bun:test";
import {
  GLYPH_MAINNET,
  GLYPH_TESTNET,
  buildGlyphUrl,
  createConnectRequest,
  relayUrls,
  verifyCallbackEnvelope,
} from "@glyph-oss/connect";
import { createGlyphRelayEnvelope, createGlyphRelaySessionStore, verifyGlyphCallbackSignature } from "./glyph.ts";
import { withExtensionDestination, withWalletConnectSender } from "./index.ts";

const IDENTITY = "A".repeat(60);
const WALLET_RELAY_CALLBACK_URL = "https://relay.glyphq.org/v2/callback/session_1234567890abcdef/callbackCapabilitySecret_1234567890abcdef";
const signedCallbackFixture = JSON.parse(
  await Bun.file(new URL("./fixtures/glyph-signed-callback-v2.json", import.meta.url)).text(),
);

function fixtureRelaySession() {
  return {
    ...relayUrls({
      session: "A".repeat(32),
      callbackCap: `c_${"B".repeat(30)}`,
      readCap: `r_${"C".repeat(30)}`,
    }),
    registered: true,
  };
}

function fixtureVerification(overrides = {}) {
  return {
    expected: {
      nonce: signedCallbackFixture.result.nonce,
      type: signedCallbackFixture.result.type,
    },
    expectedRequestHash: signedCallbackFixture.payload.request_hash,
    expectedNetwork: GLYPH_MAINNET,
    expectedDappOrigin: signedCallbackFixture.payload.dapp_origin,
    expectedExp: signedCallbackFixture.payload.exp,
    expectedCallbackUrl: WALLET_RELAY_CALLBACK_URL,
    requireSigned: true,
    verifySignature: verifyGlyphCallbackSignature,
    ...overrides,
  };
}

function copyFixture() {
  return JSON.parse(JSON.stringify(signedCallbackFixture));
}

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

describe("Glyph Connect v4 request initiation", () => {
  test("deduplicates pointer and keyboard intent while registering a relay session", async () => {
    let prepareCalls = 0;
    let resolvePreparation;
    const prepared = fixtureRelaySession();
    const store = createGlyphRelaySessionStore(() => {
      prepareCalls += 1;
      return new Promise((resolve) => { resolvePreparation = resolve; });
    });

    expect(store.isReady()).toBe(false);
    expect(() => store.consume()).toThrow(/still preparing a secure relay session/);

    const pointerIntent = store.prewarm();
    const keyboardFocusIntent = store.prewarm();
    expect(keyboardFocusIntent).toBe(pointerIntent);
    expect(prepareCalls).toBe(1);
    resolvePreparation(prepared);
    await pointerIntent;

    expect(store.isReady()).toBe(true);
    expect(store.consume()).toBe(prepared);
    expect(store.isReady()).toBe(false);
  });

  test("does not treat a failed registration as ready and allows a secure retry", async () => {
    let prepareCalls = 0;
    const prepared = fixtureRelaySession();
    const store = createGlyphRelaySessionStore(async () => {
      prepareCalls += 1;
      if (prepareCalls === 1) throw new Error("Relay registration returned 503");
      return prepared;
    });

    await expect(store.prewarm()).rejects.toThrow(/503/);
    expect(store.isReady()).toBe(false);

    await store.prewarm();
    expect(prepareCalls).toBe(2);
    expect(store.consume()).toBe(prepared);
  });

  test("builds a glyph v2 request envelope with an explicit mainnet binding and request hash", () => {
    const request = createConnectRequest({
      type: "connect",
      dapp: { name: "Glyph Support", origin: "https://glyphq.org" },
      permissions: ["transfer"],
    });
    const prepared = fixtureRelaySession();

    const envelope = createGlyphRelayEnvelope(request, prepared, GLYPH_MAINNET);
    const url = buildGlyphUrl(envelope);
    const encodedEnvelope = new URL(url).searchParams.get("d");
    const decodedEnvelope = JSON.parse(Buffer.from(encodedEnvelope, "base64url").toString("utf8"));

    expect(url).toStartWith("glyph://v2/request?d=");
    expect(envelope.network).toEqual({ id: "qubic:mainnet" });
    expect(envelope.request_hash).toMatch(/^sha256:[A-Za-z0-9_-]{43}$/);
    expect(decodedEnvelope.protocol).toBe("glyph-connect-request/2");
    expect(decodedEnvelope.network).toEqual({ id: "qubic:mainnet" });
    expect(decodedEnvelope.request_hash).toBe(envelope.request_hash);
    expect(decodedEnvelope.callback).toBe(prepared.callbackUrl);
  });
});

describe("Glyph Connect v4 signed relay callbacks", () => {
  test("accepts Wallet's capability-safe official Relay v2 binding from the raw prepared callback URL", async () => {
    await expect(
      verifyCallbackEnvelope(signedCallbackFixture, fixtureVerification()),
    ).resolves.toEqual(signedCallbackFixture.result);
  });

  test("keeps expectedCallbackUrl strict for the raw Relay v2 session and callback capability", async () => {
    const cases = [
      "https://relay.glyphq.org/v2/callback/other_session_1234567890/callbackCapabilitySecret_1234567890abcdef",
      "https://relay.glyphq.org/v2/callback/session_1234567890abcdef/otherCallbackCapabilitySecret_1234567890",
    ];

    for (const expectedCallbackUrl of cases) {
      await expect(
        verifyCallbackEnvelope(copyFixture(), fixtureVerification({ expectedCallbackUrl })),
      ).rejects.toThrow(/callback_url does not match expected callback URL/);
    }
  });

  test("rejects mismatched request hash, network, dapp origin, expiry, and callback URL", async () => {
    const cases = [
      { expectedRequestHash: "sha256:AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA" },
      { expectedNetwork: GLYPH_TESTNET },
      { expectedDappOrigin: "https://evil.example" },
      { expectedExp: signedCallbackFixture.payload.exp + 1 },
      { expectedCallbackUrl: "https://relay.glyphq.org/v2/callback/other" },
    ];

    for (const overrides of cases) {
      await expect(
        verifyCallbackEnvelope(copyFixture(), fixtureVerification(overrides)),
      ).rejects.toThrow();
    }
  });

  test("rejects a signed callback fixture with a tampered SchnorrQ proof", async () => {
    const callback = copyFixture();
    callback.proof.signature = "A".repeat(86) + "==";

    await expect(
      verifyCallbackEnvelope(callback, fixtureVerification()),
    ).rejects.toThrow(/signature/);
  });
});
