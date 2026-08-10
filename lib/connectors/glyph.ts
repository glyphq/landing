import {
  k12,
  publicKeyToIdentity,
  verify as verifySchnorrQ,
} from "@qubic.org/crypto";
import {
  GLYPH_MAINNET,
  createConnectRequest,
  createEnvelope,
  createTransferRequest,
  launchGlyphRequest,
  prepareRelaySession,
  subscribeViaRelayV2,
  type GlyphCallbackResponse,
  type GlyphSignedCallbackEnvelope,
  type GlyphNetworkBinding,
  type GlyphPermission,
  type GlyphPreparedRelaySession,
  type GlyphRequest,
  type GlyphRequestStatus,
} from "@glyph-oss/connect";
import type {
  SignMessageResult,
  WalletAccount,
  WalletConnector,
  WalletConnectorEvent,
} from "@qubic.org/react";
import type { Identity } from "@qubic.org/types";

const STORAGE_KEY = "glyph-support-account";
export const GLYPH_REQUEST_STATUS_EVENT = "glyph:support-request-status";
const QUBIC_IDENTITY_PATTERN = /^[A-Z]{60}$/;

export type GlyphRequestFeedback =
  | { state: "opening" }
  | { state: "waiting" }
  | { state: "completed" }
  | { state: "failed" };

const permissions: GlyphPermission[] = ["transfer"];
const listeners = new Map<WalletConnectorEvent, Set<(...args: unknown[]) => void>>();

type GlyphRelaySessionPreparer = () => Promise<GlyphPreparedRelaySession>;

export function createGlyphRelaySessionStore(prepare: GlyphRelaySessionPreparer = prepareRelaySession) {
  let prepared: GlyphPreparedRelaySession | null = null;
  let warming: Promise<void> | null = null;

  return {
    isReady: () => prepared !== null,
    prewarm: () => {
      if (prepared) return Promise.resolve();
      if (!warming) {
        warming = prepare()
          .then((session) => { prepared = session; })
          .finally(() => { warming = null; });
      }
      return warming;
    },
    consume: () => {
      const session = prepared;
      prepared = null;
      if (!session) {
        throw new Error("Glyph Wallet is still preparing a secure relay session. Please wait, then try again.");
      }
      return session;
    },
  };
}

const glyphRelaySession = createGlyphRelaySessionStore();

/** Register a one-time, capability-safe Relay v2 session before the user launches Glyph. */
export function prewarmGlyphRelaySession() {
  return glyphRelaySession.prewarm();
}

function dapp() {
  return {
    name: "Glyph Support",
    origin: process.env.NEXT_PUBLIC_APP_ORIGIN?.trim() || "https://glyphq.org",
  };
}

function emit(event: WalletConnectorEvent, ...args: unknown[]) {
  listeners.get(event)?.forEach((listener) => listener(...args));
}

function feedbackFromStatus(status: GlyphRequestStatus): GlyphRequestFeedback {
  switch (status.state) {
    case "opening_wallet": return { state: "opening" };
    case "awaiting_approval": return { state: "waiting" };
    case "completed": return { state: "completed" };
    case "failed": return { state: "failed" };
  }
}

function emitFeedback(detail: GlyphRequestFeedback) {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent<GlyphRequestFeedback>(GLYPH_REQUEST_STATUS_EVENT, { detail }));
  }
}

function isQubicIdentity(value: unknown): value is Identity {
  return typeof value === "string" && QUBIC_IDENTITY_PATTERN.test(value);
}

function assertQubicIdentity(value: unknown, label: string): asserts value is Identity {
  if (!isQubicIdentity(value)) throw new Error(`${label} is not a valid Qubic identity.`);
}

function assertGrantedPermissions(granted: GlyphPermission[], required: GlyphPermission[]) {
  const missing = required.filter((permission) => !granted.includes(permission));
  if (missing.length > 0) {
    throw new Error(`Glyph Wallet did not grant required permission: ${missing.join(", ")}.`);
  }
}

function assertSubmittedTransfer(txHash: string, targetTick: number) {
  if (!txHash.trim()) throw new Error("Glyph Wallet returned an empty transaction hash.");
  if (!Number.isSafeInteger(targetTick) || targetTick <= 0) {
    throw new Error("Glyph Wallet returned an invalid target tick.");
  }
}

export function verifyGlyphCallbackSignature({ payload, signature, publicKey, envelope }: {
  payload: Uint8Array;
  signature: Uint8Array;
  publicKey: Uint8Array;
  envelope: GlyphSignedCallbackEnvelope;
}) {
  if (publicKeyToIdentity(publicKey) !== envelope.proof.identity) return false;
  if ("identity" in envelope.result && envelope.result.identity !== envelope.proof.identity) return false;
  return verifySchnorrQ(k12(payload, 32), signature, publicKey);
}

export function createGlyphRelayEnvelope(
  request: GlyphRequest,
  prepared: GlyphPreparedRelaySession,
  network: GlyphNetworkBinding,
) {
  return createEnvelope(request, { callback: prepared.callbackUrl, network });
}

async function requestFromGlyph(
  request: GlyphRequest,
  network: GlyphNetworkBinding,
): Promise<GlyphCallbackResponse> {
  // This must stay synchronous. Awaiting relay registration in a click handler loses
  // Chromium's user activation before launchGlyphRequest() opens the glyph:// URL.
  const prepared = glyphRelaySession.consume();
  const envelope = createGlyphRelayEnvelope(request, prepared, network);
  const result = subscribeViaRelayV2(request, prepared, {
    verification: {
      expected: { nonce: request.nonce, type: request.type },
      expectedRequestHash: envelope.request_hash,
      expectedNetwork: envelope.network,
      expectedDappOrigin: request.dapp.origin,
      expectedExp: request.exp ?? null,
      expectedCallbackUrl: prepared.callbackUrl,
      requireSigned: true,
      verifySignature: verifyGlyphCallbackSignature,
    },
    onStatus(status) {
      emitFeedback(feedbackFromStatus(status));
    },
  });

  try {
    launchGlyphRequest(envelope);
  } catch (launchError) {
    void result.catch(() => undefined);
    emitFeedback({ state: "failed" });
    throw launchError;
  }
  const response = await result;
  if (typeof window !== "undefined") window.focus();
  return response;
}

function saveAccount(account: WalletAccount | null) {
  if (typeof window === "undefined") return;
  if (account) localStorage.setItem(STORAGE_KEY, JSON.stringify(account));
  else localStorage.removeItem(STORAGE_KEY);
}

function readAccount(): WalletAccount | null {
  if (typeof window === "undefined") return null;
  const value = localStorage.getItem(STORAGE_KEY);
  if (!value) return null;
  try {
    const account = JSON.parse(value) as Partial<WalletAccount>;
    if (!isQubicIdentity(account.identity)) throw new Error("Invalid stored Glyph account");
    return { identity: account.identity, name: typeof account.name === "string" ? account.name : "Glyph Wallet" };
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

function unsupported(): never {
  throw new Error("This action is not used by the Glyph support flow.");
}

export async function requestGlyphTransfer(destination: string, amount: string) {
  assertQubicIdentity(destination, "Transfer destination");
  const account = readAccount();
  if (!account) throw new Error("Connect Glyph Wallet before requesting a transfer.");
  assertQubicIdentity(account.identity, "Connected Glyph account");
  const result = await requestFromGlyph(createTransferRequest({
    type: "transfer",
    dapp: dapp(),
    to: destination,
    amount,
    from: account.identity,
  }), GLYPH_MAINNET);

  if (result.status === "rejected") throw new Error("Transfer request was rejected.");
  if (result.status !== "signed" || result.type !== "transfer") {
    throw new Error("Glyph Wallet returned an unexpected response.");
  }
  assertQubicIdentity(result.identity, "Glyph Wallet signing identity");
  if (result.identity !== account.identity) {
    throw new Error("Glyph Wallet signed with a different identity than the connected account.");
  }
  assertSubmittedTransfer(result.tx_hash, result.target_tick);
  return { txId: result.tx_hash, targetTick: result.target_tick };
}

export const glyphConnector: WalletConnector = {
  id: "glyph-wallet",
  isAvailable: () => typeof window !== "undefined",
  async connect() {
    const result = await requestFromGlyph(
      createConnectRequest({ type: "connect", dapp: dapp(), permissions }),
      GLYPH_MAINNET,
    );
    if (result.status === "rejected") throw new Error("Connection request was rejected.");
    if (result.status !== "connected" || result.type !== "connect") throw new Error("Glyph Wallet returned an unexpected response.");
    assertQubicIdentity(result.identity, "Connected Glyph identity");
    assertGrantedPermissions(result.permissions, permissions);
    const account: WalletAccount = { identity: result.identity, name: "Glyph Wallet" };
    saveAccount(account);
    emit("accountChanged", account);
    return account;
  },
  async getAccount() {
    return readAccount();
  },
  async disconnect() {
    saveAccount(null);
    emit("disconnect");
  },
  async sendTransaction() {
    return unsupported();
  },
  async signTransaction() {
    return unsupported();
  },
  async signMessage(): Promise<SignMessageResult> {
    return unsupported();
  },
  on(event, callback) {
    const eventListeners = listeners.get(event) ?? new Set();
    eventListeners.add(callback);
    listeners.set(event, eventListeners);
    return () => eventListeners.delete(callback);
  },
};
