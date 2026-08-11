import { describe, expect, test } from "bun:test";
import {
  detectDownloadPlatform,
  downloadTargets,
  linuxPackages,
  releasePage,
  releaseTag,
} from "./downloads.ts";

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

describe("verified release asset map", () => {
  test("keeps manual and detected links pinned to the stable release", () => {
    expect(releaseTag).toBe("v0.14.3");
    expect(releasePage).toBe("https://github.com/glyphq/wallet/releases/tag/v0.14.3");
    expect(downloadTargets.windows.href).toContain("Glyph_0.14.3_x64-setup.exe");
    expect(downloadTargets.macos.href).toContain("Glyph_0.14.3_universal.dmg");
    expect(downloadTargets.linux.href).toContain("Glyph_0.14.3_amd64.AppImage");
    expect(linuxPackages.deb).toContain("Glyph_0.14.3_amd64.deb");
    expect(linuxPackages.rpm).toContain("Glyph-0.14.3-1.x86_64.rpm");
    expect(downloadTargets.windows.checksumHref).toContain("SHA256SUMS-windows.txt");
    expect(downloadTargets.macos.checksumHref).toContain("SHA256SUMS-macos.txt");
    expect(downloadTargets.linux.checksumHref).toContain("SHA256SUMS-linux.txt");
  });
});
