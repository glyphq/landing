import { DetectedDownload } from "@/components/DetectedDownload";
import { PageHero } from "@/components/layout/PageElements";
import { ExternalLink, IndependenceNotice, Status } from "@/components/UI";

export function DownloadPage() {
  return (
    <main id="main">
      <PageHero className="download-hero">
        <Status value="Available" />
        <p className="kicker">Glyph Wallet v0.14.3</p>
        <h1>Choose your platform.</h1>
        <p className="lead">Verified stable release assets are published on GitHub. Prereleases are not selected automatically.</p>
        <DetectedDownload />
      </PageHero>
      <section className="section downloads" data-reveal-group="downloads">
        <a className="download-windows" href="https://github.com/glyphq/wallet/releases/download/v0.14.3/Glyph_0.14.3_x64-setup.exe"><b>Windows</b><span>64-bit installer · .exe</span><i>Download</i></a>
        <a className="download-macos" href="https://github.com/glyphq/wallet/releases/download/v0.14.3/Glyph_0.14.3_universal.dmg"><b>macOS</b><span>Universal · .dmg</span><i>Download</i></a>
        <a className="download-linux" href="https://github.com/glyphq/wallet/releases/tag/v0.14.3"><b>Linux</b><span>AppImage · deb · rpm</span><i>Choose package</i></a>
      </section>
      <section className="section split" data-reveal="split">
        <h2>Release verification</h2>
        <div><p>The release includes platform checksum files and updater signatures. Use the GitHub release page to review every asset before installation.</p><ExternalLink className="quiet-link" href="https://github.com/glyphq/wallet/releases/tag/v0.14.3">View complete release</ExternalLink></div>
      </section>
      <IndependenceNotice />
    </main>
  );
}
