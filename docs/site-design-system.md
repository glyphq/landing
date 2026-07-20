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

GSAP ScrollTrigger adds a scrubbed emphasis to section headings and a short resolving motion to architecture nodes. Route changes are intentionally immediate and do not animate the page. Smooth scrolling is native CSS. Content remains visible by default, animations never block interaction, and reduced-motion mode disables spatial effects.

## Navigation and visual masks

The desktop header combines the ecosystem overview and full product family in one Products disclosure menu. It is button-operated, keyboard reachable, Escape-dismissible, and mirrored as direct links in the focus-trapped mobile menu. Dropdown entries and selected product cards use low-opacity Lucide SVG line icons as structural watermarks rather than colorful illustrations.

## Responsive architecture

The ecosystem overview uses a data-driven four-layer diagram with layer responsibilities, product availability, directional connectors, and a separate Qubic integration boundary. It changes from a split layer layout on desktop to two-column product cells on phones, then one-column cells at 360px and below. The mobile navigation is grouped into Products and Organization sections, uses a sticky header, preserves 44px minimum targets, and remains independently scrollable.

At small widths, page heroes use a reduced type ceiling, actions become full-width, section spacing contracts, flow diagrams become vertical, code remains horizontally scrollable, and major content modules use narrower internal padding without removing information.

## Download experience

The Download hero progressively detects Windows, macOS, or Linux and selects the matching verified v0.14.3 asset. Manual platform cards remain visible. Their OS symbols are low-contrast SVG masks embedded into each surface rather than separate decorative icons.

## Accessibility

The system includes visible focus, a skip link, semantic landmarks, status text plus color, external-link announcements, keyboard-trapped mobile navigation, Escape close behavior, source-order-preserving responsive layouts, and textual figure captions.
