import type { CSSProperties } from "react";
import type { Supporter } from "@/content/supporters";
import { IdentityAvatar } from "@/components/support/IdentityAvatar";

const amountFormatter = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });

function shortIdentity(identity: string) {
  return `${identity.slice(0, 8)}…${identity.slice(-8)}`;
}

function amountLabel(amount: string) {
  return `${amountFormatter.format(BigInt(amount))} QUBIC`;
}

export function SupporterField({ supporters }: { supporters: Supporter[] }) {
  const previewing = supporters.some((supporter) => supporter.preview);
  const onChainCount = supporters.filter((supporter) => !supporter.preview).length;
  const sortedSupporters = [...supporters].sort((a, b) => {
    const left = BigInt(a.amount);
    const right = BigInt(b.amount);
    return right > left ? 1 : right < left ? -1 : a.identity.localeCompare(b.identity);
  });
  const largestAmount = sortedSupporters.reduce((largest, supporter) => {
    const amount = BigInt(supporter.amount);
    return amount > largest ? amount : largest;
  }, BigInt(1));
  const listedSupporters = previewing ? supporters.filter((supporter) => !supporter.preview) : supporters;

  return (
    <section className="supporter-section section-dark" aria-labelledby="supporters-title">
      <div className="supporter-heading">
        <div>
          <p className="kicker">Public recognition</p>
          <h2 id="supporters-title">The people keeping the work moving.</h2>
        </div>
        <p>Each square represents one source identity. Its footprint reflects the total QUBIC received from that identity.</p>
      </div>

      <div className="supporter-volume-head">
        <div><strong>{previewing ? supporters.length : onChainCount}</strong><span>{previewing ? "identities in preview" : `on-chain supporter${onChainCount === 1 ? "" : "s"}`}</span></div>
        <p>Square area is proportional to QUBIC received.</p>
      </div>

      {sortedSupporters.length === 0 ? (
        <p className="supporter-empty">No confirmed incoming support transfers were found in the indexed Qubic archive.</p>
      ) : (
        <div className="supporter-volume-grid" data-reveal="diagram">
          {sortedSupporters.map((supporter) => {
            const areaRatio = Number((BigInt(supporter.amount) * BigInt(1_000_000)) / largestAmount) / 1_000_000;
            const tileSpan = Math.max(1, Math.round(Math.sqrt(areaRatio) * 12));
            const tileStyle = { "--tile-span": tileSpan } as CSSProperties;
            const contents = <span className="supporter-tooltip"><strong>{supporter.preview ? "Preview identity" : supporter.name}</strong><em>{amountLabel(supporter.amount)}</em><small>{shortIdentity(supporter.identity)}</small></span>;
            const label = `${supporter.preview ? "Preview identity" : supporter.name}, ${amountLabel(supporter.amount)}, identity ${supporter.identity}`;
            const className = `supporter-volume-tile${supporter.preview ? " supporter-volume-preview" : ""}`;
            return supporter.url ? (
              <a className={className} style={tileStyle} href={supporter.url} aria-label={label} target="_blank" rel="noreferrer" key={supporter.identity}>
                <IdentityAvatar identity={supporter.identity} size={256} square />{contents}
              </a>
            ) : (
              <button className={className} style={tileStyle} type="button" aria-label={label} key={supporter.identity}>
                <IdentityAvatar identity={supporter.identity} size={256} square />{contents}
              </button>
            );
          })}
        </div>
      )}

      {listedSupporters.length > 0 && (
        <ul className="supporter-list">
          {listedSupporters.map((supporter) => <li key={supporter.identity}><div><IdentityAvatar identity={supporter.identity} size={32} /><strong>{supporter.name}</strong></div><span>{amountLabel(supporter.amount)} · {shortIdentity(supporter.identity)} · since {supporter.since}</span></li>)}
        </ul>
      )}
    </section>
  );
}
