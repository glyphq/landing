import { Download, ShieldCheck } from "@solar-icons/react";
import { DetectedDownload } from "@/components/DetectedDownload";
import { downloadTargets, linuxPackages, releasePage, releaseTag, releaseVersion } from "@/components/downloads";
import { PageHero } from "@/components/layout/PageElements";
import { ExternalLink, IndependenceNotice, Status } from "@/components/UI";
import styles from "./DownloadPage.module.css";

const verificationItems = [
  {
    title: "Stable release",
    body: `${releaseTag} is the stable release linked here. Prereleases are not selected automatically.`,
  },
  {
    title: "Checksums are published",
    body: "The release includes SHA-256 checksum files for Windows, macOS, and Linux. Compare the file before opening it.",
  },
  {
    title: "Signed artifacts stay with the release",
    body: "Signed updater artifacts are published alongside supported packages. Use the release page and repository instructions instead of a mirror.",
  },
];

function PackageCard({
  index,
  name,
  description,
  target,
  children,
}: {
  index: string;
  name: string;
  description: string;
  target: (typeof downloadTargets)[keyof typeof downloadTargets];
  children?: React.ReactNode;
}) {
  return (
    <article className={styles.packageCard}>
      <div className={styles.packageMeta}><span>{index}</span><span>{name}</span></div>
      <div>
        <h3>{name}</h3>
        <p>{description}</p>
      </div>
      <div className={styles.packageActions}>
        {children ?? (
          <a className="button button-secondary" href={target.href}>
            <Download aria-hidden="true" />Download {name === "macOS" ? ".dmg" : ".exe"}
          </a>
        )}
        <ExternalLink className={styles.checksumLink} href={target.checksumHref}>View SHA-256 checksum</ExternalLink>
      </div>
    </article>
  );
}

export function DownloadPage() {
  return (
    <main id="main" className={styles.downloadPage}>
      <PageHero className={styles.hero}>
        <Status value="Available" />
        <p className="kicker">Glyph Wallet · stable {releaseVersion}</p>
        <h1>Download the verified Wallet release.</h1>
        <p className="lead">Start with the stable {releaseTag} release. We detect your desktop platform when we can, or you can choose a package yourself.</p>
        <DetectedDownload />
        <p className={styles.heroNote}>Every primary download below points to a Glyph Wallet asset on GitHub. Prereleases and third-party mirrors are never selected.</p>
      </PageHero>

      <section className={`section ${styles.packageSection}`} aria-labelledby="package-options-title">
        <header className={styles.sectionHeader}>
          <div>
            <p className="kicker">Manual choices</p>
            <h2 id="package-options-title">Choose a package.</h2>
          </div>
          <p>Automatic detection is only a convenience. These links make every supported desktop choice visible before you install.</p>
        </header>
        <div className={styles.packageGrid}>
          <PackageCard index="01" name="Windows" description="64-bit installer for Windows desktop." target={downloadTargets.windows} />
          <PackageCard index="02" name="macOS" description="Universal disk image for Intel and Apple silicon Macs." target={downloadTargets.macos} />
          <PackageCard index="03" name="Linux" description="Choose the package format that matches your distribution." target={downloadTargets.linux}>
            <div className={styles.linuxActions}>
              <a className="button" href={linuxPackages.appImage}><Download aria-hidden="true" />AppImage</a>
              <a className="button button-secondary" href={linuxPackages.deb}>.deb</a>
              <a className="button button-secondary" href={linuxPackages.rpm}>.rpm</a>
            </div>
          </PackageCard>
        </div>
        <div className={styles.releaseCta}>
          <p>Need another asset or want to inspect the complete release?</p>
          <ExternalLink className="button button-secondary" href={releasePage}>Open {releaseTag} release</ExternalLink>
        </div>
      </section>

      <section className={`section ${styles.verificationSection}`} aria-labelledby="release-verification-title">
        <div className={styles.verificationPanel}>
          <div className={styles.verificationIntro}>
            <p className="kicker">Before you install</p>
            <h2 id="release-verification-title">Verify the release.</h2>
            <p>GitHub is the source of truth for this release. If a checksum does not match, stop and do not install the file.</p>
            <ExternalLink className="button button-secondary" href={releasePage}>Review release assets</ExternalLink>
          </div>
          <div className={styles.verificationList}>
            {verificationItems.map((item) => (
              <div className={styles.verificationItem} key={item.title}>
                <ShieldCheck className={styles.verificationIcon} aria-hidden="true" />
                <div><h3>{item.title}</h3><p>{item.body}</p></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <IndependenceNotice />
    </main>
  );
}
