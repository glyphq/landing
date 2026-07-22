"use client";

import { CheckCircle, Copy, Wallet } from "@solar-icons/react";
import { useState } from "react";
import { SupportWalletProvider } from "@/components/support/SupportWalletProvider";
import { WalletDonation } from "@/components/support/WalletDonation";

const amountFormatter = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });

export function SupportTransfer({ identity, presets }: { identity: string; presets: number[] }) {
  const [amount, setAmount] = useState(String(presets[0] ?? ""));
  const [copied, setCopied] = useState<"identity" | null>(null);
  const configured = identity.length > 0;

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
  const transferDetails = configured
    ? `Recipient: ${identity}\nAmount: ${cleanAmount || "Choose an amount"} QUBIC\nNetwork: Qubic mainnet`
    : "";

  return (
    <section className="support-transfer" aria-labelledby="support-transfer-title" data-reveal="fade-up">
      <div className="support-transfer-intro">
        <p className="kicker">Direct Qubic transfer</p>
        <h2 id="support-transfer-title">Send support without an intermediary.</h2>
        <p>Choose an amount, then make a standard transfer from Glyph Wallet or another Qubic wallet. Always verify the complete recipient identity before approving.</p>
      </div>

      <div className="transfer-console">
        <div className="transfer-step">
          <span>01</span>
          <div>
            <label htmlFor="support-amount">Amount in QUBIC</label>
            <div className="amount-input-wrap">
              <input
                id="support-amount"
                inputMode="numeric"
                pattern="[0-9]*"
                value={amount}
                onChange={(event) => setAmount(event.target.value.replace(/\D/g, ""))}
                aria-describedby="amount-help"
              />
              <b>QUBIC</b>
            </div>
            <p id="amount-help">Transfers are final. Enter a whole-number amount.</p>
            <div className="amount-presets" aria-label="Suggested amounts">
              {presets.map((preset) => (
                <button key={preset} type="button" onClick={() => setAmount(String(preset))} aria-pressed={cleanAmount === String(preset)}>
                  {amountFormatter.format(preset)}
                </button>
              ))}
            </div>
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
            <p className="transfer-label">Review in your wallet</p>
            <p>Connect a supported wallet, then compare the recipient and amount before signing locally.</p>
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
