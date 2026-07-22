import type { Supporter } from "@/content/supporters";

const positions = [
  [16, 31], [28, 17], [47, 12], [68, 18], [84, 34], [87, 58],
  [73, 78], [51, 86], [29, 79], [13, 61], [34, 42], [67, 44],
];

const nodeSize = { supporter: 10, builder: 14, sustainer: 18 } as const;

export function SupporterField({ supporters }: { supporters: Supporter[] }) {
  return (
    <section className="supporter-section section-dark" aria-labelledby="supporters-title">
      <div className="supporter-heading">
        <div>
          <p className="kicker">Public recognition</p>
          <h2 id="supporters-title">The people keeping the work moving.</h2>
        </div>
        <p>Recognition is optional and records broad support bands, never exact transfer amounts.</p>
      </div>

      <div className="supporter-field" data-reveal="diagram">
        <div className="supporter-orbit supporter-orbit-outer" aria-hidden="true" />
        <div className="supporter-orbit supporter-orbit-inner" aria-hidden="true" />
        <div className="supporter-core" aria-hidden="true"><span>glyph</span><b>.</b><small>supported in public</small></div>
        {positions.map(([left, top], index) => {
          const supporter = supporters[index];
          if (!supporter) return <i key={`${left}-${top}`} className="supporter-node supporter-node-open" style={{ left: `${left}%`, top: `${top}%` }} aria-hidden="true" />;
          const contents = (
            <span><strong>{supporter.name}</strong><small>{supporter.amountBand} · since {supporter.since}</small></span>
          );
          const style = { left: `${left}%`, top: `${top}%`, width: nodeSize[supporter.amountBand], height: nodeSize[supporter.amountBand] };
          const label = `${supporter.name}, ${supporter.amountBand} supporter since ${supporter.since}`;

          return supporter.url ? (
            <a
              key={`${supporter.name}-${supporter.since}`}
              className={`supporter-node supporter-node-${supporter.amountBand}`}
              style={style}
              href={supporter.url}
              aria-label={label}
              target="_blank"
              rel="noreferrer"
            >
              {contents}
            </a>
          ) : (
            <button key={`${supporter.name}-${supporter.since}`} className={`supporter-node supporter-node-${supporter.amountBand}`} style={style} type="button" aria-label={label}>
              {contents}
            </button>
          );
        })}
        <div className="supporter-count"><strong>{supporters.length}</strong><span>recognized supporter{supporters.length === 1 ? "" : "s"}</span></div>
      </div>

      {supporters.length === 0 ? (
        <p className="supporter-empty">The recognition field is ready for the first verified, opt-in supporter.</p>
      ) : (
        <ul className="supporter-list">
          {supporters.map((supporter) => <li key={`${supporter.name}-${supporter.since}`}><strong>{supporter.name}</strong><span>{supporter.amountBand} · since {supporter.since}</span></li>)}
        </ul>
      )}
    </section>
  );
}
