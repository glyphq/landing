# Site design system

## Tokens

`app/globals.css` defines the base semantic system. `app/warm.css` applies the production Glyph palette: true OLED black, three neutral near-black surfaces, white-to-gray text hierarchy, monochrome product tones, spacing, layout widths, radii, and motion easing.

## Typography

Geist and Geist Mono are installed packages and bundled locally. Display type is capped at 6rem with a `-0.04em` tracking floor. Body copy is constrained through section grids and maximum widths.

## Themes

The public site intentionally uses one monochrome OLED identity in both system preference modes. True black provides the canvas, neutral near-black surfaces establish depth, and white plus calibrated grays carry hierarchy. This avoids a theme flash and keeps the Glyph identity consistent across screenshots, documentation, and product pages.

## Surfaces and shape

- Controls: 8px radius
- Content modules and diagrams: 12px radius
- Major chapters and product compositions: 16px radius
- Shadows: reserved for the Wallet application frame
- Borders: used inside technical data only, not as the primary layout language

## Motion

GSAP ScrollTrigger adds a scrubbed emphasis to section headings and a short resolving motion to architecture nodes. Internal navigation fades and lightly blurs only the main content while the header and footer remain stable. Smooth scrolling is native CSS. Content remains visible by default, animations never block interaction, and reduced-motion mode bypasses every transition.

## Navigation and visual masks

The desktop header provides separate Products and Ecosystem disclosure menus. Both are button-operated, keyboard reachable, Escape-dismissible, and mirrored as direct links in the focus-trapped mobile menu. Selected product cards use low-opacity Lucide SVG line icons as structural watermarks rather than colorful illustrations.

## Download experience

The Download hero progressively detects Windows, macOS, or Linux and selects the matching verified v0.14.3 asset. Manual platform cards remain visible. Their OS symbols are low-contrast SVG masks embedded into each surface rather than separate decorative icons.

## Accessibility

The system includes visible focus, a skip link, semantic landmarks, status text plus color, external-link announcements, keyboard-trapped mobile navigation, Escape close behavior, source-order-preserving responsive layouts, and textual figure captions.
