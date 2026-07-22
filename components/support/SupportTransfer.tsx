"use client";

import { CheckCircle, Copy, Wallet } from "@solar-icons/react";
import { useEffect, useState } from "react";
import { SupportWalletProvider } from "@/components/support/SupportWalletProvider";
import { WalletDonation } from "@/components/support/WalletDonation";

export function SupportTransfer({ identity }: { identity: string }) {
  const [amount, setAmount] = useState("");
  const [usdAmount, setUsdAmount] = useState("");
  const [usdPrice, setUsdPrice] = useState<number | null>(null);
  const [priceUpdatedAt, setPriceUpdatedAt] = useState<string | null>(null);
  const [copied, setCopied] = useState<"identity" | null>(null);
  const configured = identity.length > 0;

  useEffect(() => {
    const controller = new AbortController();
    fetch("https://api.coingecko.com/api/v3/simple/price?ids=qubic-network&vs_currencies=usd", { signal: controller.signal })
      .then((response) => response.ok ? response.json() : Promise.reject(new Error("Price unavailable")))
      .then((data: { "qubic-network"?: { usd?: number } }) => {
        const price = data["qubic-network"]?.usd;
        if (typeof price !== "number" || !Number.isFinite(price) || price <= 0) return;
        setUsdPrice(price);
        setPriceUpdatedAt(new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit" }).format(new Date()));
      })
      .catch(() => undefined);
    return () => controller.abort();
  }, []);

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

  const cleanAmount = amount.replace(/\D/g, "");
  const updateQubic = (value: string) => {
    const clean = value.replace(/\D/g, "");
    setAmount(clean);
    setUsdAmount(usdPrice && clean ? (Number(clean) * usdPrice).toFixed(2) : "");
  };
  const updateUsd = (value: string) => {
    const clean = value.replace(/[^\d.]/g, "").replace(/(\..*)\./g, "$1");
    setUsdAmount(clean);
    const dollars = Number(clean);
    setAmount(usdPrice && Number.isFinite(dollars) && dollars > 0 ? String(Math.max(1, Math.round(dollars / usdPrice))) : "");
  };
  const transferDetails = configured
    ? `Recipient: ${identity}\nAmount: ${cleanAmount || "Choose an amount"} QUBIC\nNetwork: Qubic mainnet`
    : "";

  return (
    <section className="support-transfer" aria-labelledby="support-transfer-title" data-reveal="fade-up">
      <div className="support-transfer-intro">
        <p className="kicker">Direct Qubic transfer</p>
        <h2 id="support-transfer-title">Send support without an intermediary.</h2>
        <p>Send a standard Qubic transaction directly to the published identity from any Qubic wallet. The connectors below are optional shortcuts.</p>
      </div>

      <div className="transfer-console">
        <div className="transfer-step">
          <span>01</span>
          <div>
            <div className="amount-converter">
              <div><label htmlFor="support-amount">Amount in QUBIC</label><div className="amount-input-wrap"><input id="support-amount" inputMode="numeric" pattern="[0-9]*" value={amount} onChange={(event) => updateQubic(event.target.value)} aria-describedby="amount-help" /><b>QUBIC</b></div></div>
              <span aria-hidden="true">≈</span>
              <div><label htmlFor="support-usd">Approximate value</label><div className="amount-input-wrap amount-input-usd"><b>$</b><input id="support-usd" inputMode="decimal" value={usdAmount} onChange={(event) => updateUsd(event.target.value)} disabled={!usdPrice} aria-describedby="price-help" /><b>USD</b></div></div>
            </div>
            <p id="amount-help">Transfers use a whole-number QUBIC amount and are final.</p>
            <p id="price-help" className="price-help">{usdPrice ? `Indicative market price: $${usdPrice.toPrecision(4)} per QUBIC${priceUpdatedAt ? ` · updated ${priceUpdatedAt}` : ""}.` : "Loading an indicative QUBIC/USD market price…"} USD values are estimates and may change before signing.</p>
          </div>
        </div>

        <div className="transfer-step">
          <span>02</span>
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
          <span>03</span>
          <div>
            <p className="transfer-label">Optional wallet shortcut</p>
            <p>Use a connector to prefill the recipient and amount, or send directly from your wallet using the identity above. Always compare the details before signing.</p>
            {configured && cleanAmount ? (
              <SupportWalletProvider><WalletDonation identity={identity} amount={cleanAmount} transferDetails={transferDetails} /></SupportWalletProvider>
            ) : (
              <button className="button" type="button" disabled><Wallet aria-hidden="true" />Choose a wallet</button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
