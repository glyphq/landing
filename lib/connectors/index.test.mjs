import { describe, expect, test } from "bun:test";
import { createConnectRequest, parseCallbackResponse, relayUrls, verifyCallbackEnvelope } from "@glyph-oss/connect";
import { deriveIdentityFromSeed, k12, publicKeyFromSeed, sign } from "@qubic.org/crypto";
import { toSeed } from "@qubic.org/types";
import { createGlyphRelayEnvelope, verifyGlyphCallbackSignature } from "./glyph.ts";
import { withExtensionDestination, withWalletConnectSender } from "./index.ts";

const IDENTITY = "A".repeat(60);
const CALLBACK_ENVELOPE_VERSION = "glyph-connect-callback-envelope/1";
const CALLBACK_SIGNATURE_ALGORITHM = "qubic-schnorrq-sha256";

function canonicalize(value) {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(canonicalize).join(",")}]`;
  return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${canonicalize(value[key])}`).join(",")}}`;
}

function base64(bytes) {
  return Buffer.from(bytes).toString("base64");
}

function base64Url(bytes) {
  return base64(bytes).replaceAll("+", "-").replaceAll("/", "_").replace(/=+$/, "");
}

async function signedConnectEnvelope({ request, prepared, seed }) {
  const publicKey = publicKeyFromSeed(seed);
  const result = {
    status: "connected",
    type: "connect",
    nonce: request.nonce,
    identity: deriveIdentityFromSeed(seed),
    permissions: ["transfer"],
  };
  const payload = {
    version: CALLBACK_ENVELOPE_VERSION,
    nonce: request.nonce,
    request_type: request.type,
    dapp_origin: request.dapp.origin,
    exp: request.exp ?? null,
    relay: {
      route: "v2_session_callback",
      callback_url: prepared.callbackUrl,
      official_relay: true,
      v1_nonce: null,
      session_id: "A".repeat(32),
      callback_capability_fingerprint: null,
    },
    result_hash: base64Url(new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(canonicalize(result))))),
  };
  const signedPayload = canonicalize(payload);
  const signature = await sign(k12(new TextEncoder().encode(signedPayload), 32), seed);

  return {
    version: CALLBACK_ENVELOPE_VERSION,
    result,
    payload,
    proof: {
      algorithm: CALLBACK_SIGNATURE_ALGORITHM,
      identity: result.identity,
      public_key: base64(publicKey),
      signature: base64(signature),
      signed_payload: signedPayload,
    },
  };
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

  test("accepts signed relay v2 callback envelopes with strict bindings", async () => {
    const seed = toSeed("aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa");
    const request = createConnectRequest({
      type: "connect",
      dapp: { name: "Glyph Support", origin: "https://glyphq.org" },
      permissions: ["transfer"],
      exp: 1_800_000_000,
    });
    const prepared = { ...relayUrls({
      session: "A".repeat(32),
      callbackCap: `c_${"B".repeat(30)}`,
      readCap: `r_${"C".repeat(30)}`,
    }), registered: true };
    const envelope = await signedConnectEnvelope({ request, prepared, seed });

    await expect(verifyCallbackEnvelope(envelope, {
      expected: { nonce: request.nonce, type: request.type },
      expectedDappOrigin: request.dapp.origin,
      expectedExp: request.exp,
      expectedCallbackUrl: prepared.callbackUrl,
      requireSigned: true,
      verifySignature: verifyGlyphCallbackSignature,
    })).resolves.toEqual(envelope.result);
  });

  test("rejects tampered signed callback envelopes", async () => {
    const seed = toSeed("aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa");
    const request = createConnectRequest({
      type: "connect",
      dapp: { name: "Glyph Support", origin: "https://glyphq.org" },
      permissions: ["transfer"],
      exp: 1_800_000_000,
    });
    const prepared = { ...relayUrls({
      session: "A".repeat(32),
      callbackCap: `c_${"B".repeat(30)}`,
      readCap: `r_${"C".repeat(30)}`,
    }), registered: true };
    const envelope = await signedConnectEnvelope({ request, prepared, seed });
    envelope.payload.dapp_origin = "https://evil.example";
    envelope.proof.signed_payload = canonicalize(envelope.payload);

    await expect(verifyCallbackEnvelope(envelope, {
      expected: { nonce: request.nonce, type: request.type },
      expectedDappOrigin: request.dapp.origin,
      expectedExp: request.exp,
      expectedCallbackUrl: prepared.callbackUrl,
      requireSigned: true,
      verifySignature: verifyGlyphCallbackSignature,
    })).rejects.toThrow(/dapp_origin|signature/);
  });
});
