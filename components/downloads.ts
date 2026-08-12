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
  assetLabel: string;
  href: string;
  checksumHref: string;
};

export type ReleaseSource = "latest.json" | "github-api" | "fallback";

export type DownloadRelease = {
  version: string | null;
  tag: string | null;
  pageUrl: string;
  source: ReleaseSource;
  targets: Record<Exclude<DownloadPlatform, "unknown">, DownloadTarget | null>;
  linuxPackages: {
    appImage: string | null;
    deb: string | null;
    rpm: string | null;
  };
};

type LatestReleaseManifest = {
  version?: unknown;
  platforms?: unknown;
};

type GithubRelease = {
  tag_name?: unknown;
  html_url?: unknown;
  assets?: unknown;
};

type GithubReleaseAsset = {
  name?: unknown;
  browser_download_url?: unknown;
};

export const latestReleaseManifestUrl = "https://github.com/glyphq/wallet/releases/latest/download/latest.json";
export const latestReleaseApiUrl = "https://api.github.com/repos/glyphq/wallet/releases/latest";
export const latestReleasePageUrl = "https://github.com/glyphq/wallet/releases/latest";

const trustedReleaseOrigin = "https://github.com";
const trustedReleasePath = "/glyphq/wallet/releases/download/";
const versionPattern = /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/;
const assetNamePattern = /^[A-Za-z0-9][A-Za-z0-9._-]*$/;

const platformKeys = {
  windows: "windows-x86_64",
  macos: "darwin-x86_64",
  linux: "linux-x86_64",
} as const;

const assetNames = {
  windows: (version: string) => `Glyph_${version}_x64-setup.exe`,
  macosDmg: (version: string) => `Glyph_${version}_universal.dmg`,
  macosArchive: (version: string) => `Glyph_${version}_universal.app.tar.gz`,
  linux: (version: string) => `Glyph_${version}_amd64.AppImage`,
  deb: (version: string) => `Glyph_${version}_amd64.deb`,
  rpm: (version: string) => `Glyph-${version}-1.x86_64.rpm`,
  checksum: (platform: Exclude<DownloadPlatform, "unknown">) => `SHA256SUMS-${platform}.txt`,
} as const;

function normalizeVersion(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const version = value.trim().replace(/^v/, "");
  return versionPattern.test(version) ? version : null;
}

function releaseUrlParts(value: unknown): { version: string; assetName: string } | null {
  if (typeof value !== "string") return null;

  try {
    const url = new URL(value);
    if (
      url.origin !== trustedReleaseOrigin ||
      url.pathname.startsWith(`${trustedReleasePath}v`) === false ||
      url.search ||
      url.hash ||
      url.username ||
      url.password
    ) {
      return null;
    }

    const relativePath = url.pathname.slice(trustedReleasePath.length);
    const separator = relativePath.indexOf("/");
    if (separator < 1 || separator === relativePath.length - 1) return null;

    const version = normalizeVersion(relativePath.slice(0, separator).replace(/^v/, ""));
    const assetName = relativePath.slice(separator + 1);
    if (!version || !assetNamePattern.test(assetName) || assetName.includes("%")) return null;

    return { version, assetName };
  } catch {
    return null;
  }
}

export function isTrustedReleaseUrl(value: unknown, version?: string): boolean {
  const parts = releaseUrlParts(value);
  const expectedVersion = version ? normalizeVersion(version) : null;
  return Boolean(parts && (!version || expectedVersion === parts.version));
}

function trustedAssetUrl(version: string, assetName: string): string {
  return `${trustedReleaseOrigin}${trustedReleasePath}v${version}/${assetName}`;
}

function validAssetUrl(value: unknown, version: string, expectedName: string | RegExp): string | null {
  const parts = releaseUrlParts(value);
  if (!parts || parts.version !== version) return null;
  if (typeof expectedName === "string" ? parts.assetName !== expectedName : !expectedName.test(parts.assetName)) return null;
  return `${trustedReleaseOrigin}${trustedReleasePath}v${version}/${parts.assetName}`;
}

function createTarget(
  platform: Exclude<DownloadPlatform, "unknown">,
  version: string,
  href: string,
  assetLabel: string,
): DownloadTarget {
  const detail = platform === "windows"
    ? "64-bit installer · .exe"
    : platform === "macos"
      ? `Universal installer · ${assetLabel}`
      : "64-bit AppImage · portable";

  return {
    platform,
    label: `Download for ${platform === "macos" ? "macOS" : platform[0].toUpperCase() + platform.slice(1)}`,
    detail,
    assetLabel,
    href,
    checksumHref: trustedAssetUrl(version, assetNames.checksum(platform)),
  };
}

function releaseFromTargets({
  version,
  source,
  windowsHref,
  macosHref,
  linuxHref,
  macosAssetLabel,
  debHref,
  rpmHref,
  checksumHrefs,
}: {
  version: string;
  source: Exclude<ReleaseSource, "fallback">;
  windowsHref: string;
  macosHref: string;
  linuxHref: string;
  macosAssetLabel: string;
  debHref?: string;
  rpmHref?: string;
  checksumHrefs?: Partial<Record<Exclude<DownloadPlatform, "unknown">, string>>;
}): DownloadRelease {
  const windows = createTarget("windows", version, windowsHref, ".exe");
  const macos = createTarget("macos", version, macosHref, macosAssetLabel);
  const linux = createTarget("linux", version, linuxHref, ".AppImage");

  return {
    version,
    tag: `v${version}`,
    pageUrl: `https://github.com/glyphq/wallet/releases/tag/v${version}`,
    source,
    targets: {
      windows: { ...windows, checksumHref: checksumHrefs?.windows ?? windows.checksumHref },
      macos: { ...macos, checksumHref: checksumHrefs?.macos ?? macos.checksumHref },
      linux: { ...linux, checksumHref: checksumHrefs?.linux ?? linux.checksumHref },
    },
    linuxPackages: {
      appImage: linux.href,
      deb: debHref ?? trustedAssetUrl(version, assetNames.deb(version)),
      rpm: rpmHref ?? trustedAssetUrl(version, assetNames.rpm(version)),
    },
  };
}

function objectRecord(value: unknown): Record<string, unknown> | null {
  return typeof value === "object" && value !== null ? value as Record<string, unknown> : null;
}

function platformUrl(platforms: Record<string, unknown>, key: string): unknown {
  return objectRecord(platforms[key])?.url;
}

export function parseLatestReleaseManifest(value: unknown): DownloadRelease | null {
  const manifest = objectRecord(value) as LatestReleaseManifest | null;
  const version = normalizeVersion(manifest?.version);
  const platforms = objectRecord(manifest?.platforms);
  if (!version || !platforms) return null;

  const windowsHref = validAssetUrl(platformUrl(platforms, platformKeys.windows), version, assetNames.windows(version));
  const macosHref = validAssetUrl(
    platformUrl(platforms, platformKeys.macos),
    version,
    new RegExp(`^Glyph_${version.replaceAll(".", "\\.")}_universal\\.(?:dmg|app\\.tar\\.gz)$`),
  );
  const linuxHref = validAssetUrl(platformUrl(platforms, platformKeys.linux), version, assetNames.linux(version));
  if (!windowsHref || !macosHref || !linuxHref) return null;

  const macosAssetLabel = macosHref.endsWith(".dmg") ? ".dmg" : ".tar.gz";
  return releaseFromTargets({ version, source: "latest.json", windowsHref, macosHref, linuxHref, macosAssetLabel });
}

function apiAssetMap(value: unknown): Map<string, string> | null {
  if (!Array.isArray(value)) return null;
  const assets = new Map<string, string>();
  for (const entry of value) {
    const asset = objectRecord(entry) as GithubReleaseAsset | null;
    if (typeof asset?.name !== "string" || typeof asset.browser_download_url !== "string") continue;
    assets.set(asset.name, asset.browser_download_url);
  }
  return assets;
}

function apiAssetUrl(assets: Map<string, string>, version: string, name: string): string | null {
  return validAssetUrl(assets.get(name), version, name);
}

export function parseGithubLatestRelease(value: unknown): DownloadRelease | null {
  const release = objectRecord(value) as GithubRelease | null;
  const version = normalizeVersion(release?.tag_name);
  const assets = apiAssetMap(release?.assets);
  if (!version || !assets) return null;

  const windowsHref = apiAssetUrl(assets, version, assetNames.windows(version));
  const macosDmgHref = apiAssetUrl(assets, version, assetNames.macosDmg(version));
  const macosArchiveHref = apiAssetUrl(assets, version, assetNames.macosArchive(version));
  const linuxHref = apiAssetUrl(assets, version, assetNames.linux(version));
  if (!windowsHref || (!macosDmgHref && !macosArchiveHref) || !linuxHref) return null;

  const checksumHrefs = {
    windows: apiAssetUrl(assets, version, assetNames.checksum("windows")) ?? undefined,
    macos: apiAssetUrl(assets, version, assetNames.checksum("macos")) ?? undefined,
    linux: apiAssetUrl(assets, version, assetNames.checksum("linux")) ?? undefined,
  };

  return releaseFromTargets({
    version,
    source: "github-api",
    windowsHref,
    macosHref: macosDmgHref ?? macosArchiveHref!,
    linuxHref,
    macosAssetLabel: macosDmgHref ? ".dmg" : ".tar.gz",
    debHref: apiAssetUrl(assets, version, assetNames.deb(version)) ?? undefined,
    rpmHref: apiAssetUrl(assets, version, assetNames.rpm(version)) ?? undefined,
    checksumHrefs,
  });
}

export const fallbackRelease: DownloadRelease = {
  version: null,
  tag: null,
  pageUrl: latestReleasePageUrl,
  source: "fallback",
  targets: { windows: null, macos: null, linux: null },
  linuxPackages: { appImage: null, deb: null, rpm: null },
};

type ReleaseFetcher = (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;

const liveFetchOptions: RequestInit = {
  cache: "no-store",
  headers: { Accept: "application/json" },
};

async function fetchJson(fetcher: ReleaseFetcher, url: string): Promise<unknown> {
  const response = await fetcher(url, url === latestReleaseManifestUrl
    ? { ...liveFetchOptions, mode: "no-cors" }
    : liveFetchOptions);
  if (!response.ok || response.type === "opaque") throw new Error(`Release request failed with ${response.status}`);
  return response.json();
}

export async function fetchLatestRelease(fetcher: ReleaseFetcher = (input, init) => fetch(input, init)): Promise<DownloadRelease> {
  try {
    const manifest = parseLatestReleaseManifest(await fetchJson(fetcher, latestReleaseManifestUrl));
    if (manifest) return manifest;
  } catch {
    // The release asset endpoint may redirect to a host without CORS headers. The
    // GitHub API fallback remains live and is converted through the same validators.
  }

  try {
    const release = parseGithubLatestRelease(await fetchJson(fetcher, latestReleaseApiUrl));
    if (release) return release;
  } catch {
    // Keep the page usable without inventing a version or an unverified asset URL.
  }

  return fallbackRelease;
}

export function targetForPlatform(
  platform: DownloadPlatform,
  release: DownloadRelease = fallbackRelease,
): DownloadTarget | null {
  return platform === "unknown" ? null : release.targets[platform];
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
