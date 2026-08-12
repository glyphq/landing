"use client";

import { Download, ShieldCheck } from "@solar-icons/react";
import type { ReactNode } from "react";
import { DetectedDownload } from "@/components/DetectedDownload";
import { DownloadReleaseProvider, useDownloadRelease } from "@/components/DownloadReleaseProvider";
import type { DownloadTarget } from "@/components/downloads";
import { PageHero } from "@/components/layout/PageElements";
import { ExternalLink, IndependenceNotice } from "@/components/UI";
import styles from "./DownloadPage.module.css";

function PackageCard({
  name,
  description,
  target,
  releasePage,
  children,
}: {
  name: string;
  description: string;
  target: DownloadTarget | null;
  releasePage: string;
  children?: ReactNode;
}) {
  return (
    <article className={styles.packageCard}>
      <div>
        <h3>{name}</h3>
        <p>{description}</p>
      </div>
      <div className={styles.packageActions}>
        {children ?? (
          <a
            className="button button-secondary"
            href={target?.href ?? releasePage}
            target={target ? undefined : "_blank"}
            rel={target ? undefined : "noreferrer"}
          >
            <Download aria-hidden="true" />
            {target ? `Download ${target.assetLabel}` : "Open latest release assets"}
          </a>
        )}
        <ExternalLink
          className={styles.checksumLink}
          href={target?.checksumHref ?? releasePage}
        >
          {target ? "View SHA-256 checksum" : "View release assets"}
        </ExternalLink>
      </div>
    </article>
  );
}

function DownloadPageContent() {
  const { release, state } = useDownloadRelease();
  const releaseLabel = release.tag ? `stable ${release.tag}` : "latest stable release";
  const releaseLinkLabel = release.tag ? `Open ${release.tag} release` : "Open latest release";
  const verificationItems = [
    {
      title: "Stable release",
      body: release.tag
        ? `${release.tag} is the stable release linked here. Prereleases are not selected automatically.`
        : "The latest stable release is linked here. Prereleases are not selected automatically.",
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

  return (
    <main id="main" className={styles.downloadPage}>
      <PageHero className={styles.hero}>
        <h1>Download the verified Wallet release.</h1>
        <p className="lead">Start with the {releaseLabel}. We detect your desktop platform when we can, or you can choose a package yourself.</p>
        <DetectedDownload release={release} />
        <p className={styles.heroNote}>
          {state === "fallback"
            ? "The live release manifest is unavailable right now. Open the verified GitHub release page to choose an asset."
            : "Every primary download below points to a Glyph Wallet asset on GitHub. Prereleases and third-party mirrors are never selected."}
        </p>
      </PageHero>

      <section className={`section ${styles.packageSection}`} aria-labelledby="package-options-title">
        <header className={styles.sectionHeader}>
          <div>
            <h2 id="package-options-title">Choose a package.</h2>
          </div>
          <p>Automatic detection is only a convenience. These links make every supported desktop choice visible before you install.</p>
        </header>
        <div className={styles.packageGrid}>
          <PackageCard name="Windows" description="64-bit installer for Windows desktop." target={release.targets.windows} releasePage={release.pageUrl} />
          <PackageCard name="macOS" description="Universal disk image for Intel and Apple silicon Macs." target={release.targets.macos} releasePage={release.pageUrl} />
          <PackageCard name="Linux" description="Choose the package format that matches your distribution." target={release.targets.linux} releasePage={release.pageUrl}>
            {release.linuxPackages.appImage ? (
              <div className={styles.linuxActions}>
                <a className="button" href={release.linuxPackages.appImage}><Download aria-hidden="true" />AppImage</a>
                <a className="button button-secondary" href={release.linuxPackages.deb ?? release.pageUrl}>.deb</a>
                <a className="button button-secondary" href={release.linuxPackages.rpm ?? release.pageUrl}>.rpm</a>
              </div>
            ) : (
              <a className="button button-secondary" href={release.pageUrl} target="_blank" rel="noreferrer">
                <Download aria-hidden="true" />Open latest release assets
              </a>
            )}
          </PackageCard>
        </div>
        <div className={styles.releaseCta}>
          <p>Need another asset or want to inspect the complete release?</p>
          <ExternalLink className="button button-secondary" href={release.pageUrl}>{releaseLinkLabel}</ExternalLink>
        </div>
      </section>

      <section className={`section ${styles.verificationSection}`} aria-labelledby="release-verification-title">
        <div className={styles.verificationPanel}>
          <div className={styles.verificationIntro}>
            <h2 id="release-verification-title">Verify the release.</h2>
            <p>GitHub is the source of truth for this release. If a checksum does not match, stop and do not install the file.</p>
            <ExternalLink className="button button-secondary" href={release.pageUrl}>Review release assets</ExternalLink>
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

export function DownloadPage() {
  return (
    <DownloadReleaseProvider>
      <DownloadPageContent />
    </DownloadReleaseProvider>
  );
}
