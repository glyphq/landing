# Content audit

Audit date: 2026-08-13. Only Glyph-owned repositories, releases, package metadata, and public product endpoints were used.

| Product | Status on site | Repository | Package / download | License status |
|---|---|---|---|---|
| Glyph Wallet | Available | https://github.com/glyphq/wallet | Current GitHub release | MIT, open source |
| Glyph Connect | Available | https://github.com/glyphq/connect | `@glyph-oss/connect` v4.1.0 on npm | MIT, open source |
| Glyph Explorer | Available | https://github.com/glyphq/explorer | https://explorer.glyphq.org | Public repository, no license published |
| Glyph SDK | In development | None verified | None verified | Not published |
| Glyph CLI | Planned | None verified | None verified | Not published |
| Glyph Devkit | Planned | None verified | None verified | Not published |
| Glyph API | Planned | None verified | None verified | Not published |
| Glyph Docs | Available | Public documentation site | https://docs.glyphq.org | No repository license asserted |
| Glyph Trade | Planned | None verified | None verified | Not published |

## Verified Wallet facts

- Tauri v2 desktop application for Windows, universal macOS, and Linux.
- Current releases provide Windows, universal macOS, AppImage, deb, and rpm packages.
- Repository documents AES-256-GCM vault encryption, Argon2 KDF, auto-lock, biometric integrations, signing logs, deep links, replay protection, and updater signatures.
- The published security policy supports only the latest release and accepts private GitHub Security Advisories or email to `security@glyph.app`.
- No third-party audit or reproducible-build claim was found.

## Verified Connect facts

- npm package `@glyph-oss/connect`, version 4.1.0 at audit time. Its request contract uses `glyph://v2/request`, `glyph-connect-request/2` envelopes, typed network binding, and a SHA-256 request hash.
- MIT license, framework-agnostic, fully typed, zero runtime dependencies.
- Current builders: transfer, smart-contract call, sign message, verify message, and connect.
- Results support callback POST, redirect, browser promise, and official relay flows. Signed callback envelopes bind the request hash, network, dApp origin, expiry, callback URL, and result before Qubic SchnorrQ verification.
- HTTPS dApp origins are required. Delivery URLs must target global HTTPS origins, match the dApp origin, or use the official relay callback exception. Localhost and private-address callbacks are not accepted by the hardened SDK protocol.

## Unresolved or intentionally omitted

- The former external branding destination did not resolve. The public `/brand/` page now keeps the verified identity guidance and repository-supplied masters as the available source.
- Explorer and Docs are publicly available. SDK, CLI, Devkit, API, and Trade remain unavailable or not publicly released.
- No verified funding, sponsorship, CCF proposal, team roster, governance timetable, user count, performance claim, security audit, partnership, or Qubic affiliation exists in the audited sources.
- The Wallet README contains older `glyph-ecosystem` links alongside the current `glyphq` repository location. Public site links use the current `glyphq` URLs.
