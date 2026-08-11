"use client";

import { Download, RefreshCircle } from "@solar-icons/react";
import { useEffect, useRef, useState, useSyncExternalStore, type MouseEvent } from "react";
import {
  detectDownloadPlatform,
  releasePage,
  targetForPlatform,
  type DownloadPlatform,
} from "@/components/downloads";
import styles from "./pages/DownloadPage.module.css";

type DetectionState = "checking" | "detected" | "unknown" | "failed";
type DownloadState = "idle" | "starting" | "timed-out";

type NavigatorWithUserAgentData = Navigator & {
  userAgentData?: {
    platform?: string;
    architecture?: string;
  };
};

function browserSignals() {
  const browserNavigator = navigator as NavigatorWithUserAgentData;

  return {
    userAgent: browserNavigator.userAgent,
    platform: browserNavigator.platform,
    userAgentDataPlatform: browserNavigator.userAgentData?.platform,
    architecture: browserNavigator.userAgentData?.architecture,
    maxTouchPoints: browserNavigator.maxTouchPoints,
  };
}

function platformName(platform: DownloadPlatform): string {
  if (platform === "windows") return "Windows";
  if (platform === "macos") return "macOS";
  if (platform === "linux") return "Linux";
  return "your platform";
}

export function DetectedDownload() {
  const detectedPlatform = useSyncExternalStore(
    () => () => undefined,
    () => {
      try {
        return detectDownloadPlatform(browserSignals());
      } catch {
        return "failed" as const;
      }
    },
    () => "checking" as const,
  );
  const platform: DownloadPlatform = detectedPlatform === "checking" || detectedPlatform === "failed" ? "unknown" : detectedPlatform;
  const detectionState: DetectionState = detectedPlatform === "checking"
    ? "checking"
    : detectedPlatform === "failed"
      ? "failed"
      : detectedPlatform === "unknown"
        ? "unknown"
        : "detected";
  const [downloadState, setDownloadState] = useState<DownloadState>("idle");
  const resetTimer = useRef<number | null>(null);
  const target = targetForPlatform(platform);
  const isStarting = downloadState === "starting";
  const isExternalFallback = !target;

  useEffect(() => () => {
    if (resetTimer.current !== null) window.clearTimeout(resetTimer.current);
  }, []);

  const startDownload = (event: MouseEvent<HTMLAnchorElement>) => {
    if (isExternalFallback) return;

    if (isStarting) {
      event.preventDefault();
      return;
    }

    setDownloadState("starting");
    if (resetTimer.current !== null) window.clearTimeout(resetTimer.current);
    resetTimer.current = window.setTimeout(() => setDownloadState("timed-out"), 4000);
  };

  const actionHref = target?.href ?? releasePage;
  const actionLabel = isStarting
    ? "Starting download"
    : downloadState === "timed-out"
      ? `Try ${target?.platform ?? "the download"} again`
      : target?.label ?? "View verified release assets";
  const platformLabel = detectionState === "checking" ? "Checking your platform" : target ? platformName(platform) : "Choose a package";
  const detail = target?.detail ?? "Windows · macOS · Linux packages";
  const statusMessage = isStarting
    ? "The v0.14.3 release asset is opening."
    : detectionState === "checking"
      ? "You can still choose a package below while we check this device."
      : detectionState === "failed"
        ? "Automatic detection failed. Choose a package below instead."
        : detectionState === "unknown"
          ? "We do not have a verified automatic choice for this device. Choose a package below."
          : `Detected ${platformName(platform)}. This link goes directly to the stable v0.14.3 release asset.`;

  return (
    <div className={styles.detectedDownload} aria-labelledby="recommended-download-title">
      <div className={styles.detectedHeader}>
        <div>
          <span className={styles.detectedEyebrow}>Recommended download</span>
          <h2 id="recommended-download-title">{platformLabel}</h2>
        </div>
        <span className={styles.detectedDetail}>{detail}</span>
      </div>
      <div className={styles.detectedActions}>
        <a
          className={`button ${styles.detectedButton}`}
          href={actionHref}
          onClick={startDownload}
          target={isExternalFallback ? "_blank" : undefined}
          rel={isExternalFallback ? "noreferrer" : undefined}
          aria-disabled={isStarting || undefined}
          aria-busy={isStarting || undefined}
        >
          {isStarting ? <RefreshCircle className={styles.downloadLoader} aria-hidden="true" /> : <Download aria-hidden="true" />}
          <span>{actionLabel}</span>
        </a>
        <a className={styles.releaseLink} href={releasePage} target="_blank" rel="noreferrer">
          Browse all release assets<span className="sr-only"> (opens in a new tab)</span>
        </a>
      </div>
      <p className={styles.detectedStatus} role={isStarting ? "status" : undefined} aria-live="polite">
        {statusMessage}
      </p>
      {downloadState === "timed-out" && target ? (
        <p className={styles.downloadFallback} role="alert">
          If nothing appeared, use the release page to choose the package yourself. <a href={releasePage} target="_blank" rel="noreferrer">Open verified release page<span className="sr-only"> (opens in a new tab)</span></a>.
        </p>
      ) : null}
    </div>
  );
}
