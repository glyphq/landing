import {
  k12,
  verify as verifySchnorrQ,
} from "@qubic.org/crypto";
import {
  createConnectRequest,
  createEnvelope,
  createTransferRequest,
  launchGlyphRequest,
  prepareRelaySession,
  subscribeViaRelayV2,
  type GlyphCallbackResponse,
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

export function verifyGlyphCallbackSignature({ payload, signature, publicKey }: {
  payload: Uint8Array;
  signature: Uint8Array;
  publicKey: Uint8Array;
}) {
  return verifySchnorrQ(k12(payload, 32), signature, publicKey);
}

export function createGlyphRelayEnvelope(request: GlyphRequest, prepared: GlyphPreparedRelaySession) {
  return createEnvelope(request, { callback: prepared.callbackUrl });
}

async function requestFromGlyph(request: GlyphRequest): Promise<GlyphCallbackResponse> {
  const prepared = await prepareRelaySession();
  const envelope = createGlyphRelayEnvelope(request, prepared);
  const result = subscribeViaRelayV2(request, prepared, {
    verification: {
      expected: { nonce: request.nonce, type: request.type },
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
  }));

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
    const result = await requestFromGlyph(createConnectRequest({ type: "connect", dapp: dapp(), permissions }));
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
