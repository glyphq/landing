# Content audit

Audit date: 2026-07-20. Only Glyph-owned repositories, releases, package metadata, and the supplied organizational brief were used.

| Product | Status on site | Repository | Package / download | License status |
|---|---|---|---|---|
| Glyph Wallet | Available | https://github.com/glyphq/wallet | Stable v0.14.3 GitHub release | Source available. The repository does not expose an OSI-approved license through GitHub. |
| Glyph Connect | Available | https://github.com/glyphq/connect | `@glyph-oss/connect` v2.0.0 on npm | MIT, open source |
| Glyph Explorer | In development | None verified | None verified | Not published |
| Glyph SDK | In development | None verified | None verified | Not published |
| Glyph CLI | Planned | None verified | None verified | Not published |
| Glyph Devkit | Planned | None verified | None verified | Not published |
| Glyph API | Planned | None verified | None verified | Not published |
| Glyph Docs | In development | No standalone repository verified | Connect README is the current integration reference | Not published |
| Glyph Trade | Planned | None verified | None verified | Not published |

## Verified Wallet facts

- Tauri v2 desktop application for Windows, universal macOS, and Linux.
- Stable v0.14.3 assets include Windows x64 installer, universal macOS DMG, AppImage, deb, and rpm.
- Repository documents AES-256-GCM vault encryption, Argon2 KDF, auto-lock, biometric integrations, signing logs, deep links, replay protection, and updater signatures.
- The published security policy supports only the latest release and accepts private GitHub Security Advisories or email to `security@glyph.app`.
- No third-party audit or reproducible-build claim was found.

## Verified Connect facts

- npm package `@glyph-oss/connect`, version 2.0.0 at audit time.
- MIT license, framework-agnostic, fully typed, zero runtime dependencies.
- Current builders: transfer, smart-contract call, sign message, verify message, and connect.
- Results support callback POST, redirect, and a browser promise flow.
- HTTPS dApp origins are required. Callback exceptions exist for localhost loopback addresses.

## Unresolved or intentionally omitted

- `branding.glyphq.org` was not reachable from the audit environment. The site links to it because it is the destination specified by the organization brief.
- No public Explorer, SDK, CLI, Devkit, API, Docs, or Trade implementation was found in the `glyphq` GitHub organization.
- No verified funding, sponsorship, CCF proposal, team roster, governance timetable, user count, performance claim, security audit, partnership, or Qubic affiliation exists in the audited sources.
- The Wallet README contains older `glyph-ecosystem` links alongside the current `glyphq` repository location. Public site links use the current `glyphq` URLs.

