export type DownloadPlatform = "windows" | "macos" | "linux" | "unknown";

export type PlatformSignals = {
  userAgent?: string;
  platform?: string;
  userAgentDataPlatform?: string;
  architecture?: string;
  maxTouchPoints?: number;
};

export type DownloadTarget = {
  platform: Exclude<DownloadPlatform, "unknown">;
  label: string;
  detail: string;
  href: string;
  checksumHref: string;
};

export const releaseVersion = "0.14.3";
export const releaseTag = `v${releaseVersion}`;
export const releasePage = `https://github.com/glyphq/wallet/releases/tag/${releaseTag}`;

const releaseBase = `https://github.com/glyphq/wallet/releases/download/${releaseTag}`;

export const downloadTargets: Record<Exclude<DownloadPlatform, "unknown">, DownloadTarget> = {
  windows: {
    platform: "windows",
    label: "Download for Windows",
    detail: "64-bit installer · .exe",
    href: `${releaseBase}/Glyph_${releaseVersion}_x64-setup.exe`,
    checksumHref: `${releaseBase}/SHA256SUMS-windows.txt`,
  },
  macos: {
    platform: "macos",
    label: "Download for macOS",
    detail: "Universal installer · .dmg",
    href: `${releaseBase}/Glyph_${releaseVersion}_universal.dmg`,
    checksumHref: `${releaseBase}/SHA256SUMS-macos.txt`,
  },
  linux: {
    platform: "linux",
    label: "Download for Linux",
    detail: "64-bit AppImage · portable",
    href: `${releaseBase}/Glyph_${releaseVersion}_amd64.AppImage`,
    checksumHref: `${releaseBase}/SHA256SUMS-linux.txt`,
  },
};

export const linuxPackages = {
  appImage: downloadTargets.linux.href,
  deb: `${releaseBase}/Glyph_${releaseVersion}_amd64.deb`,
  rpm: `${releaseBase}/Glyph-${releaseVersion}-1.x86_64.rpm`,
};

export function targetForPlatform(platform: DownloadPlatform): DownloadTarget | null {
  return platform === "unknown" ? null : downloadTargets[platform];
}

function contains(value: string, pattern: RegExp): boolean {
  return pattern.test(value);
}

export function detectDownloadPlatform({
  userAgent = "",
  platform = "",
  userAgentDataPlatform = "",
  architecture = "",
  maxTouchPoints = 0,
}: PlatformSignals): DownloadPlatform {
  const browserText = `${userAgentDataPlatform} ${platform} ${userAgent}`.toLowerCase();
  const architectureText = `${architecture} ${platform} ${userAgent}`.toLowerCase();

  // Mobile operating systems and iPad desktop mode do not have a verified desktop asset.
  if (
    contains(browserText, /android|iphone|ipad|ipod|windows phone/) ||
    (maxTouchPoints > 1 && contains(browserText, /macintosh|macintel|mac os/))
  ) {
    return "unknown";
  }

  // The published Linux and Windows assets are x86_64. Do not silently send ARM devices
  // to an installer whose architecture is not verified here.
  if (contains(architectureText, /arm|aarch/)) return "unknown";

  if (contains(browserText, /windows|win32|win64/)) return "windows";
  if (contains(browserText, /macintosh|macintel|mac os|darwin/)) return "macos";
  if (contains(browserText, /linux|x11/)) return "linux";

  return "unknown";
}
