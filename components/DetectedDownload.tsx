"use client";

import { useSyncExternalStore } from "react";

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
  const platformText = useSyncExternalStore(
    () => () => undefined,
    () => `${navigator.platform} ${navigator.userAgent}`,
    () => "",
  );
  const target = detectDownloadTarget(platformText);

  return (
    <div className="detected-download">
      <a className="button detected-download-button" href={target.href}>
        <span>{target.label}</span>
        <span aria-hidden="true">↓</span>
      </a>
      <span className="detected-download-detail" aria-live="polite">
        {target.detail}
      </span>
    </div>
  );
}
