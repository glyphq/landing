import Image from "next/image";

export function SponsorTicker() {
  return (
    <section className="sponsor-strip section" aria-label="Backed by MinerLab">
      <p className="sponsor-strip-label">Backed by</p>
      <div className="sponsor-rail" aria-label="MinerLab">
        <div className="sponsor-rail-track">
          <SponsorRailGroup />
          <SponsorRailGroup hidden />
        </div>
      </div>
    </section>
  );
}

function SponsorRailGroup({ hidden = false }: { hidden?: boolean }) {
  return (
    <div className="sponsor-rail-group" aria-hidden={hidden || undefined}>
      <div className="sponsor-rail-slot sponsor-rail-slot-empty" aria-hidden="true"><span>Reserved</span></div>
      <div className="sponsor-rail-slot sponsor-rail-slot-empty" aria-hidden="true"><span>Reserved</span></div>
      <div className="sponsor-rail-slot sponsor-rail-slot-logo">
        <Image className="sponsor-strip-logo" src="/sponsors/minerlab.png" alt={hidden ? "" : "MinerLab"} width={1477} height={368} unoptimized />
      </div>
      <div className="sponsor-rail-slot sponsor-rail-slot-empty" aria-hidden="true"><span>Reserved</span></div>
      <div className="sponsor-rail-slot sponsor-rail-slot-empty" aria-hidden="true"><span>Reserved</span></div>
    </div>
  );
}
