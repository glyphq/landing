import { describe, expect, test } from "bun:test";
import {
  fallbackRelease,
  fetchLatestRelease,
  isTrustedReleaseUrl,
  latestReleaseApiUrl,
  latestReleaseManifestUrl,
  latestReleasePageUrl,
  parseGithubLatestRelease,
  parseLatestReleaseManifest,
  detectDownloadPlatform,
} from "./downloads.ts";

const latestManifest = {
  version: "0.16.5",
  pub_date: "2026-08-10T16:18:15Z",
  platforms: {
    "windows-x86_64": {
      url: "https://github.com/glyphq/wallet/releases/download/v0.16.5/Glyph_0.16.5_x64-setup.exe",
    },
    "darwin-x86_64": {
      url: "https://github.com/glyphq/wallet/releases/download/v0.16.5/Glyph_0.16.5_universal.app.tar.gz",
    },
    "darwin-aarch64": {
      url: "https://github.com/glyphq/wallet/releases/download/v0.16.5/Glyph_0.16.5_universal.app.tar.gz",
    },
    "linux-x86_64": {
      url: "https://github.com/glyphq/wallet/releases/download/v0.16.5/Glyph_0.16.5_amd64.AppImage",
    },
  },
};

describe("download platform detection", () => {
  test("selects verified desktop targets from modern and legacy browser signals", () => {
    expect(detectDownloadPlatform({ userAgentDataPlatform: "Windows", architecture: "x86" })).toBe("windows");
    expect(detectDownloadPlatform({ userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0)" })).toBe("macos");
    expect(detectDownloadPlatform({ platform: "Linux x86_64", userAgent: "Mozilla/5.0 X11; Linux x86_64" })).toBe("linux");
  });

  test("does not guess a desktop asset for mobile, touch Mac, ARM, or unknown platforms", () => {
    expect(detectDownloadPlatform({ userAgent: "Mozilla/5.0 (Linux; Android 14)" })).toBe("unknown");
    expect(detectDownloadPlatform({ platform: "MacIntel", userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X)", maxTouchPoints: 5 })).toBe("unknown");
    expect(detectDownloadPlatform({ platform: "Linux armv8l", architecture: "arm" })).toBe("unknown");
    expect(detectDownloadPlatform({ platform: "CrOS x86_64" })).toBe("unknown");
  });
});

describe("authoritative latest release parsing", () => {
  test("maps the trusted latest.json 0.16.5 response to verified assets", () => {
    const release = parseLatestReleaseManifest(latestManifest);

    expect(release?.source).toBe("latest.json");
    expect(release?.version).toBe("0.16.5");
    expect(release?.tag).toBe("v0.16.5");
    expect(release?.pageUrl).toBe("https://github.com/glyphq/wallet/releases/tag/v0.16.5");
    expect(release?.targets.windows?.href).toContain("Glyph_0.16.5_x64-setup.exe");
    expect(release?.targets.macos?.href).toContain("Glyph_0.16.5_universal.app.tar.gz");
    expect(release?.targets.linux?.href).toContain("Glyph_0.16.5_amd64.AppImage");
    expect(release?.linuxPackages.deb).toContain("Glyph_0.16.5_amd64.deb");
    expect(release?.linuxPackages.rpm).toContain("Glyph-0.16.5-1.x86_64.rpm");
  });

  test("fetches latest.json live with cache disabled", async () => {
    const calls = [];
    const release = await fetchLatestRelease(async (url, init) => {
      calls.push({ url: String(url), init });
      return new Response(JSON.stringify(latestManifest), { status: 200 });
    });

    expect(release.version).toBe("0.16.5");
    expect(calls[0].url).toBe(latestReleaseManifestUrl);
    expect(calls[0].init.cache).toBe("no-store");
  });

  test("uses the live GitHub API only when the release asset manifest cannot be read", async () => {
    const apiRelease = {
      tag_name: "v0.16.5",
      assets: [
        "Glyph_0.16.5_x64-setup.exe",
        "Glyph_0.16.5_universal.dmg",
        "Glyph_0.16.5_amd64.AppImage",
      ].map((name) => ({
        name,
        browser_download_url: `https://github.com/glyphq/wallet/releases/download/v0.16.5/${name}`,
      })),
    };
    const calls = [];
    const release = await fetchLatestRelease(async (url, init) => {
      calls.push({ url: String(url), init });
      if (String(url) === latestReleaseManifestUrl) throw new TypeError("CORS");
      return new Response(JSON.stringify(apiRelease), { status: 200 });
    });

    expect(release.source).toBe("github-api");
    expect(release.version).toBe("0.16.5");
    expect(calls.map((call) => call.url)).toEqual([latestReleaseManifestUrl, latestReleaseApiUrl]);
  });

  test("falls back to the unversioned latest release page after invalid responses", async () => {
    const release = await fetchLatestRelease(async () => new Response("not json", { status: 503 }));

    expect(release).toEqual(fallbackRelease);
    expect(release.pageUrl).toBe(latestReleasePageUrl);
    expect(release.version).toBeNull();
    expect(release.targets.windows).toBeNull();
  });

  test("rejects malformed manifest asset URLs instead of constructing untrusted links", () => {
    const invalid = structuredClone(latestManifest);
    invalid.platforms["windows-x86_64"].url = "https://evil.example/Glyph_0.16.5_x64-setup.exe";

    expect(parseLatestReleaseManifest(invalid)).toBeNull();
    expect(parseGithubLatestRelease({ tag_name: "v0.16.5", assets: [] })).toBeNull();
  });
});

describe("release URL validation", () => {
  test("accepts only versioned GitHub wallet release assets", () => {
    expect(isTrustedReleaseUrl("https://github.com/glyphq/wallet/releases/download/v0.16.5/Glyph_0.16.5_x64-setup.exe", "0.16.5")).toBe(true);
    expect(isTrustedReleaseUrl("https://github.com/glyphq/wallet/releases/download/v0.16.5/SHA256SUMS-windows.txt", "0.16.5")).toBe(true);
  });

  test("rejects other origins, protocols, versions, query strings, and path traversal", () => {
    expect(isTrustedReleaseUrl("http://github.com/glyphq/wallet/releases/download/v0.16.5/file.exe", "0.16.5")).toBe(false);
    expect(isTrustedReleaseUrl("https://evil.example/glyphq/wallet/releases/download/v0.16.5/file.exe", "0.16.5")).toBe(false);
    expect(isTrustedReleaseUrl("https://github.com/glyphq/wallet/releases/download/v0.14.3/file.exe", "0.16.5")).toBe(false);
    expect(isTrustedReleaseUrl("https://github.com/glyphq/wallet/releases/download/v0.16.5/file.exe?download=1", "0.16.5")).toBe(false);
    expect(isTrustedReleaseUrl("https://github.com/glyphq/wallet/releases/download/v0.16.5/../file.exe", "0.16.5")).toBe(false);
  });
});
