"use client";

import { CheckCircle, Copy, Wallet } from "@solar-icons/react";
import { useEffect, useRef, useState } from "react";
import { SupportWalletProvider } from "@/components/support/SupportWalletProvider";
import { amountValidationMessage, formatUsdAmount, formatUsdPrice, normalizeQubicAmount } from "@/components/support/SupportTransferLogic";
import { WalletDonation } from "@/components/support/WalletDonation";

const PRICE_FETCH_TIMEOUT_MS = 8_000;

type PriceStatus = "loading" | "ready" | "unavailable";

export function SupportTransfer({ identity }: { identity: string }) {
  const [amount, setAmount] = useState("");
  const [usdAmount, setUsdAmount] = useState("");
  const [usdPrice, setUsdPrice] = useState<number | null>(null);
  const [priceStatus, setPriceStatus] = useState<PriceStatus>("loading");
  const [priceUpdatedAt, setPriceUpdatedAt] = useState<string | null>(null);
  const [priceAttempt, setPriceAttempt] = useState(0);
  const [amountTouched, setAmountTouched] = useState(false);
  const [copied, setCopied] = useState<"identity" | null>(null);
  const amountRef = useRef("");
  const configured = identity.length > 0;
  const normalizedAmount = normalizeQubicAmount(amount);
  const amountError = amountValidationMessage(amount, amountTouched || amount.length > 0);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    const timeoutId = window.setTimeout(() => controller.abort(), PRICE_FETCH_TIMEOUT_MS);

    fetch("https://api.coingecko.com/api/v3/simple/price?ids=qubic-network&vs_currencies=usd", { signal: controller.signal })
      .then((response) => response.ok ? response.json() : Promise.reject(new Error("Price unavailable")))
      .then((data: { "qubic-network"?: { usd?: number } }) => {
        const price = data["qubic-network"]?.usd;
        if (typeof price !== "number" || !Number.isFinite(price) || price <= 0) throw new Error("Price unavailable");
        setUsdPrice(price);
        setPriceStatus("ready");
        setPriceUpdatedAt(new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit" }).format(new Date()));
        const currentAmount = normalizeQubicAmount(amountRef.current);
        setUsdAmount(currentAmount ? formatUsdAmount(Number(currentAmount) * price) : "");
      })
      .catch(() => {
        if (!active) return;
        setUsdPrice(null);
        setUsdAmount("");
        setPriceUpdatedAt(null);
        setPriceStatus("unavailable");
      })
      .finally(() => window.clearTimeout(timeoutId));

    return () => {
      active = false;
      window.clearTimeout(timeoutId);
      controller.abort();
    };
  }, [priceAttempt]);

  const copy = async (value: string, type: "identity") => {
    if (!value || !navigator.clipboard) return;
    try {
      await navigator.clipboard.writeText(value);
      setCopied(type);
      window.setTimeout(() => setCopied((current) => current === type ? null : current), 2200);
    } catch {
      setCopied(null);
    }
  };

  const updateQubic = (value: string) => {
    amountRef.current = value;
    setAmount(value);
    const nextAmount = normalizeQubicAmount(value);
    setUsdAmount(usdPrice && nextAmount ? formatUsdAmount(Number(nextAmount) * usdPrice) : "");
  };

  const updateUsd = (value: string) => {
    const clean = value.replace(/[^\d.]/g, "").replace(/(\..*)\./g, "$1");
    setUsdAmount(clean);
    if (!clean) {
      amountRef.current = "";
      setAmount("");
      return;
    }
    const dollars = Number(clean);
    if (!usdPrice || !Number.isFinite(dollars)) {
      amountRef.current = "";
      setAmount("");
      return;
    }
    if (dollars === 0) {
      amountRef.current = "0";
      setAmount("0");
      setAmountTouched(true);
      return;
    }
    const nextAmount = String(Math.max(1, Math.round(dollars / usdPrice)));
    amountRef.current = nextAmount;
    setAmount(nextAmount);
  };

  const retryPrice = () => {
    setPriceStatus("loading");
    setUsdPrice(null);
    setPriceUpdatedAt(null);
    setUsdAmount("");
    setPriceAttempt((attempt) => attempt + 1);
  };

  const transferDetails = configured
    ? `Recipient: ${identity}\nAmount: ${normalizedAmount || "Choose an amount"} QUBIC\nNetwork: Qubic mainnet`
    : "";
  const priceHelp = priceStatus === "loading"
    ? "Loading an indicative QUBIC/USD market price."
    : priceStatus === "unavailable"
      ? "Indicative QUBIC/USD price is unavailable. QUBIC entry, identity copy, and transfer details still work."
      : `Indicative market price: ≈${formatUsdPrice(usdPrice ?? 0)} per QUBIC${priceUpdatedAt ? ` · updated ${priceUpdatedAt}` : ""}.`;

  return (
    <section className="support-transfer" aria-labelledby="support-transfer-title" data-reveal="fade-up">
      <div className="support-transfer-intro">
        <h2 id="support-transfer-title">Send support without an intermediary.</h2>
        <p>Send a standard Qubic transaction directly to the published identity from any Qubic wallet. The connectors below are optional shortcuts.</p>
      </div>

      <div className="transfer-console">
        <div className="transfer-step">
          <div>
            <div className="amount-converter">
              <div>
                <label htmlFor="support-amount">Amount in QUBIC</label>
                <div className="amount-input-wrap">
                  <input
                    id="support-amount"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    required
                    value={amount}
                    onBlur={() => setAmountTouched(true)}
                    onChange={(event) => updateQubic(event.target.value)}
                    aria-describedby={amountError ? "amount-help amount-error" : "amount-help"}
                    aria-invalid={Boolean(amountError)}
                  />
                  <b>QUBIC</b>
                </div>
              </div>
              <span aria-hidden="true">≈</span>
              <div>
                <label htmlFor="support-usd">Approximate value</label>
                <div className="amount-input-wrap amount-input-usd">
                  <b>$</b>
                  <input id="support-usd" inputMode="decimal" value={usdAmount} onChange={(event) => updateUsd(event.target.value)} disabled={!usdPrice} aria-describedby="price-help" />
                  <b>USD</b>
                </div>
              </div>
            </div>
            <p id="amount-help">Use a whole-number QUBIC amount greater than zero. Transfers are final.</p>
            {amountError && <p id="amount-error" role="alert">{amountError}</p>}
            <p id="price-help" className="price-help" aria-live="polite">
              {priceHelp} USD values are estimates and may change before signing.
              {priceStatus === "unavailable" && <>{" "}<button className="quiet-link" type="button" onClick={retryPrice}>Retry price</button></>}
            </p>
          </div>
        </div>

        <div className="transfer-step">
          <div>
            <p className="transfer-label">Recipient identity</p>
            {configured ? (
              <>
                <code className="support-identity">{identity}</code>
                <button className="copy-action" type="button" onClick={() => copy(identity, "identity")}>
                  {copied === "identity" ? <CheckCircle aria-hidden="true" /> : <Copy aria-hidden="true" />}
                  {copied === "identity" ? "Identity copied" : "Copy identity"}
                </button>
                <p className="direct-transfer-note"><strong>No connection required.</strong> Copy this identity into any Qubic wallet and send a normal transfer to it. The transaction will be recognized the same way.</p>
              </>
            ) : (
              <div className="identity-pending" role="status">
                <strong>Recipient identity pending publication</strong>
                <p>The transfer action will activate after Glyph publishes and verifies its support identity.</p>
              </div>
            )}
          </div>
        </div>

        <div className="transfer-step transfer-final">
          <div>
            <p className="transfer-label">Optional wallet shortcut</p>
            <p>Use a connector to prefill the recipient and amount, or send directly from your wallet using the identity above. Always compare the details before signing.</p>
            {configured ? (
              <SupportWalletProvider><WalletDonation identity={identity} amount={normalizedAmount ?? ""} transferDetails={transferDetails} /></SupportWalletProvider>
            ) : (
              <button className="button" type="button" disabled><Wallet aria-hidden="true" />Choose a wallet</button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
