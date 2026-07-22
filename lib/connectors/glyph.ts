import {
  createConnectRequest,
  createEnvelope,
  createNonce,
  createTransferRequest,
  launchGlyphRequest,
  relayCallbackUrl,
  subscribeViaRelay,
  type GlyphCallbackResponse,
  type GlyphPermission,
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
    origin: process.env.NEXT_PUBLIC_APP_ORIGIN ?? "https://glyphq.org",
  };
}

function glyphRelayUrl() {
  return process.env.NEXT_PUBLIC_GLYPH_RELAY_URL ?? "https://relay.glyphq.org";
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

async function requestFromGlyph(request: GlyphRequest): Promise<GlyphCallbackResponse> {
  const nonce = createNonce();
  const relayUrl = glyphRelayUrl();
  const envelope = createEnvelope(request, { callback: relayCallbackUrl(nonce, relayUrl) });
  const result = subscribeViaRelay(nonce, {
    relayUrl,
    onStatus(status) {
      emitFeedback(feedbackFromStatus(status));
    },
  });

  launchGlyphRequest(envelope);
  const response = await result;
  window.focus();
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
    return JSON.parse(value) as WalletAccount;
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

function unsupported(): never {
  throw new Error("This action is not used by the Glyph support flow.");
}

export async function requestGlyphTransfer(destination: string, amount: string) {
  const account = readAccount();
  if (!account) throw new Error("Connect Glyph Wallet before requesting a transfer.");
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
  return { txId: result.tx_hash, targetTick: result.target_tick };
}

export const glyphConnector: WalletConnector = {
  id: "glyph-wallet",
  isAvailable: () => typeof window !== "undefined",
  async connect() {
    const result = await requestFromGlyph(createConnectRequest({ type: "connect", dapp: dapp(), permissions }));
    if (result.status === "rejected") throw new Error("Connection request was rejected.");
    if (result.status !== "connected") throw new Error("Glyph Wallet returned an unexpected response.");
    const account: WalletAccount = { identity: result.identity as Identity, name: "Glyph Wallet" };
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
