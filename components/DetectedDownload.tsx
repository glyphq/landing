"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Download, RefreshCircle } from "@solar-icons/react";

type DownloadTarget = {
  platform: string;
  label: string;
  detail: string;
  href: string;
};

const releaseBase = "https://github.com/glyphq/wallet/releases/download/v0.14.3";
const releasePage = "https://github.com/glyphq/wallet/releases/tag/v0.14.3";

export function detectDownloadTarget(platformText: string): DownloadTarget {
  const platform = platformText.toLowerCase();

  if (platform.includes("win")) {
    return { platform: "Windows", label: "Download for Windows", detail: "64-bit installer · .exe", href: `${releaseBase}/Glyph_0.14.3_x64-setup.exe` };
  }

  if (platform.includes("mac") || platform.includes("iphone") || platform.includes("ipad")) {
    return { platform: "macOS", label: "Download for macOS", detail: "Universal · .dmg", href: `${releaseBase}/Glyph_0.14.3_universal.dmg` };
  }

  if (platform.includes("linux") || platform.includes("x11")) {
    return { platform: "Linux", label: "Download for Linux", detail: "64-bit · AppImage", href: `${releaseBase}/Glyph_0.14.3_amd64.AppImage` };
  }

  return { platform: "your platform", label: "View all downloads", detail: "Windows · macOS · Linux", href: releasePage };
}

export function DetectedDownload() {
  const [isLoading, setIsLoading] = useState(false);
  const loadingRef = useRef(false);
  const startTimer = useRef<number | null>(null);
  const resetTimer = useRef<number | null>(null);
  const platformText = useSyncExternalStore(
    () => () => undefined,
    () => `${navigator.platform} ${navigator.userAgent}`,
    () => "",
  );
  const target = detectDownloadTarget(platformText);

  useEffect(() => () => {
    if (startTimer.current !== null) window.clearTimeout(startTimer.current);
    if (resetTimer.current !== null) window.clearTimeout(resetTimer.current);
  }, []);

  const startDownload = (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    if (loadingRef.current) return;

    loadingRef.current = true;
    setIsLoading(true);

    startTimer.current = window.setTimeout(() => {
      const link = document.createElement("a");
      link.href = target.href;
      link.style.display = "none";
      document.body.appendChild(link);
      link.click();
      link.remove();
    }, 120);

    resetTimer.current = window.setTimeout(() => {
      loadingRef.current = false;
      setIsLoading(false);
    }, 3000);
  };

  return (
    <div className="detected-download">
      <a
        className="button detected-download-button"
        href={target.href}
        onClick={startDownload}
        aria-disabled={isLoading}
        aria-busy={isLoading}
      >
        {isLoading ? <RefreshCircle className="download-loader" aria-hidden="true" /> : <Download aria-hidden="true" />}
        <span>{isLoading ? "Preparing download" : target.label}</span>
      </a>
      <span className="detected-download-detail" aria-live="polite">
        {isLoading ? "Your verified download is starting." : target.detail}
      </span>
    </div>
  );
}
