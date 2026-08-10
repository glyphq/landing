"use client";

import { useWallet } from "@qubic.org/react";
import {
  CheckCircle,
  CloseCircle,
  Copy,
  Logout,
  Monitor,
  Smartphone,
  Wallet,
} from "@solar-icons/react";
import { QRCodeSVG } from "qrcode.react";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore, type ComponentType, type SVGProps } from "react";
import { hasWalletConnectProjectId } from "@/lib/connectors";
import {
  GLYPH_REQUEST_STATUS_EVENT,
  prewarmGlyphRelaySession,
  requestGlyphTransfer,
  type GlyphRequestFeedback,
} from "@/lib/connectors/glyph";

type Icon = ComponentType<SVGProps<SVGSVGElement>>;

const connectorDetails: Record<string, { label: string; description: string; Icon: Icon }> = {
  "glyph-wallet": {
    label: "Glyph Wallet",
    description: "Open the desktop wallet and approve locally.",
    Icon: Wallet,
  },
  "qubic-extension": {
    label: "Wallet extension",
    description: "Use the Qubic wallet provider in this browser.",
    Icon: Monitor,
  },
  walletconnect: {
    label: "WalletConnect",
    description: "Pair a compatible Qubic wallet with a QR code.",
    Icon: Smartphone,
  },
};

function shortIdentity(identity: string) {
  return `${identity.slice(0, 10)}…${identity.slice(-10)}`;
}

function feedbackCopy(feedback: GlyphRequestFeedback | null) {
  if (!feedback) return null;
  if (feedback.state === "opening") return "Opening Glyph Wallet…";
  if (feedback.state === "waiting") return "Review and approve the transfer in Glyph Wallet.";
  if (feedback.state === "completed") return "Glyph Wallet completed the request.";
  return "Glyph Wallet could not complete the request.";
}

export function WalletDonation({ identity, amount, transferDetails }: { identity: string; amount: string; transferDetails: string }) {
  const wallet = useWallet();
  const mounted = useSyncExternalStore(() => () => undefined, () => true, () => false);
  const dialog = useRef<HTMLDialogElement>(null);
  const connectButton = useRef<HTMLButtonElement>(null);
  const [pendingConnector, setPendingConnector] = useState<string | null>(null);
  const [pairingUri, setPairingUri] = useState<string | null>(null);
  const [isTransferring, setIsTransferring] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [txId, setTxId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [glyphFeedback, setGlyphFeedback] = useState<GlyphRequestFeedback | null>(null);
  const [glyphRelayState, setGlyphRelayState] = useState<"idle" | "preparing" | "ready" | "failed">("idle");

  const warmGlyphRelay = useCallback((clearError = false) => {
    setGlyphRelayState("preparing");
    if (clearError) setError(null);
    void prewarmGlyphRelaySession()
      .then(() => setGlyphRelayState("ready"))
      .catch((relayError) => {
        setGlyphRelayState("failed");
        setError(relayError instanceof Error ? relayError.message : "Could not prepare a secure Glyph Wallet session.");
      });
  }, []);

  useEffect(() => {
    const receiveFeedback = (event: Event) => setGlyphFeedback((event as CustomEvent<GlyphRequestFeedback>).detail);
    window.addEventListener(GLYPH_REQUEST_STATUS_EVENT, receiveFeedback);
    return () => window.removeEventListener(GLYPH_REQUEST_STATUS_EVENT, receiveFeedback);
  }, []);

  useEffect(() => {
    if (wallet.activeConnector?.id !== "glyph-wallet") return;
    const timer = window.setTimeout(warmGlyphRelay, 0);
    return () => window.clearTimeout(timer);
  }, [wallet.activeConnector?.id, warmGlyphRelay]);

  const openConnectors = () => {
    setError(null);
    setPairingUri(null);
    warmGlyphRelay(true);
    dialog.current?.showModal();
  };

  const closeConnectors = () => {
    if (pendingConnector) return;
    dialog.current?.close();
    connectButton.current?.focus();
  };

  const connect = async (connectorId: string) => {
    setPendingConnector(connectorId);
    setPairingUri(null);
    setError(null);
    let glyphConnected = false;
    try {
      await wallet.connect(connectorId, { onUri: setPairingUri });
      glyphConnected = connectorId === "glyph-wallet";
      if (glyphConnected) warmGlyphRelay();
      dialog.current?.close();
    } catch (connectionError) {
      setError(connectionError instanceof Error ? connectionError.message : "Wallet connection failed.");
    } finally {
      setPendingConnector(null);
      if (connectorId === "glyph-wallet" && !glyphConnected) warmGlyphRelay();
    }
  };

  const disconnect = async () => {
    setError(null);
    try {
      await wallet.disconnect();
      setTxId(null);
    } catch (disconnectError) {
      setError(disconnectError instanceof Error ? disconnectError.message : "Wallet could not disconnect.");
    }
  };

  const sendTransfer = async () => {
    if (!wallet.activeConnector || !/^\d+$/.test(amount) || BigInt(amount) <= BigInt(0)) return;
    const isGlyphWallet = wallet.activeConnector.id === "glyph-wallet";
    if (isGlyphWallet && glyphRelayState !== "ready") return;
    setIsTransferring(true);
    setError(null);
    setTxId(null);
    setGlyphFeedback(null);
    try {
      const result = wallet.activeConnector.id === "glyph-wallet"
        ? await requestGlyphTransfer(identity, amount)
        : await wallet.sendTransaction({ destination: identity, amount });
      if (!result || typeof result.txId !== "string" || !result.txId.trim()) {
        throw new Error("Wallet returned an invalid transaction result.");
      }
      setTxId(result.txId);
    } catch (transferError) {
      setError(transferError instanceof Error ? transferError.message : "Transfer request failed.");
      if (isGlyphWallet) warmGlyphRelay();
    } finally {
      setIsTransferring(false);
    }
  };

  const copyDetails = async () => {
    try {
      await navigator.clipboard.writeText(transferDetails);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      setCopied(false);
    }
  };

  const activeDetail = wallet.activeConnector ? connectorDetails[wallet.activeConnector.id] : null;
  const activeConnectorId = wallet.activeConnector?.id;
  const amountValid = /^\d+$/.test(amount) && BigInt(amount) > BigInt(0);

  return (
    <div className="wallet-donation">
      {mounted && wallet.isConnected && wallet.account && activeDetail ? (
        <div className="connected-wallet">
          <div className="connected-wallet-head">
            <div><activeDetail.Icon aria-hidden="true" /><span><strong>{activeDetail.label}</strong><small>{shortIdentity(wallet.account.identity)}</small></span></div>
            <button type="button" onClick={disconnect}><Logout aria-hidden="true" />Disconnect</button>
          </div>
          <button className="button wallet-transfer-button" type="button" disabled={!amountValid || isTransferring || (activeConnectorId === "glyph-wallet" && glyphRelayState !== "ready" && glyphRelayState !== "failed")} onClick={activeConnectorId === "glyph-wallet" && glyphRelayState === "failed" ? () => warmGlyphRelay(true) : sendTransfer}>
            <Wallet aria-hidden="true" />{isTransferring ? "Waiting for wallet" : activeConnectorId === "glyph-wallet" && glyphRelayState === "preparing" ? "Preparing secure transfer" : activeConnectorId === "glyph-wallet" && glyphRelayState === "failed" ? "Retry secure transfer setup" : `Review ${BigInt(amount).toLocaleString("en-US")} QUBIC transfer`}
          </button>
          {feedbackCopy(glyphFeedback) && <p className={`wallet-status wallet-status-${glyphFeedback?.state}`} role="status">{feedbackCopy(glyphFeedback)}</p>}
        </div>
      ) : (
        <button ref={connectButton} className="button wallet-transfer-button" type="button" disabled={!mounted || !amountValid} onClick={openConnectors}>
          <Wallet aria-hidden="true" />Choose a wallet
        </button>
      )}

      <button className="copy-transfer-details" type="button" onClick={copyDetails}>
        {copied ? <CheckCircle aria-hidden="true" /> : <Copy aria-hidden="true" />}{copied ? "Transfer details copied" : "Copy details instead"}
      </button>

      {txId && <p className="wallet-result" role="status"><CheckCircle aria-hidden="true" /><span><strong>Transfer submitted</strong><code>{txId}</code></span></p>}
      {error && <p className="wallet-error" role="alert"><CloseCircle aria-hidden="true" />{error}</p>}

      <dialog ref={dialog} className="connector-dialog" onCancel={(event) => { event.preventDefault(); closeConnectors(); }}>
        <div className="connector-dialog-head"><div><p>Connect a wallet</p><span>Approval always happens in your wallet.</span></div><button type="button" onClick={closeConnectors}>Close</button></div>
        <div className="connector-options">
          {wallet.connectors.map((connector) => {
            const detail = connectorDetails[connector.id];
            if (!detail) return null;
            const glyphRelayFailed = connector.id === "glyph-wallet" && glyphRelayState === "failed";
            const glyphRelayPreparing = connector.id === "glyph-wallet" && glyphRelayState !== "ready" && !glyphRelayFailed;
            const unavailable = connector.id === "walletconnect" ? !hasWalletConnectProjectId : mounted && !connector.isAvailable();
            const disabled = unavailable || Boolean(pendingConnector) || glyphRelayPreparing;
            const status = glyphRelayFailed ? "Could not prepare secure session"
              : glyphRelayPreparing ? "Preparing secure session…"
              : unavailable ? (connector.id === "walletconnect" ? "Requires project configuration" : "Not detected in this browser")
              : detail.description;
            return (
              <button key={connector.id} type="button" disabled={disabled} onClick={glyphRelayFailed ? () => warmGlyphRelay(true) : () => connect(connector.id)}>
                <detail.Icon aria-hidden="true" />
                <span><strong>{detail.label}</strong><small>{status}</small></span>
                <b>{pendingConnector === connector.id ? "Connecting…" : glyphRelayPreparing ? "Preparing…" : glyphRelayFailed ? "Retry" : unavailable ? "Unavailable" : "Connect"}</b>
              </button>
            );
          })}
        </div>
        {pairingUri && <div className="walletconnect-pairing"><QRCodeSVG value={pairingUri} size={190} level="M" /><div><strong>Scan with your wallet</strong><p>Keep this window open while the connection is approved.</p></div></div>}
        {error && <p className="wallet-error" role="alert"><CloseCircle aria-hidden="true" />{error}</p>}
      </dialog>
    </div>
  );
}
