# Site design system

## Tokens

`app/globals.css` defines semantic OKLCH tokens for canvas, three surfaces, primary/secondary/tertiary text, borders, focus, semantic status colors, nine product accents, spacing, layout width, gutters, header height, and motion easing.

## Typography

Geist and Geist Mono are installed packages and bundled locally. Display type is capped at 6rem with a `-0.04em` tracking floor. Body copy is constrained through section grids and maximum widths.

## Themes

Light mode uses a near-white neutral with a very small oxblood tint, warm charcoal text, and softly differentiated surfaces. Dark mode uses warm near-black and chocolate neutrals rather than pure black. `prefers-color-scheme` selects the default without a client-side flash.

## Surfaces and shape

- Controls: 8px radius
- Content modules and diagrams: 12px radius
- Major chapters and product compositions: 16px radius
- Shadows: reserved for the Wallet application frame
- Borders: used inside technical data only, not as the primary layout language

## Motion

GSAP ScrollTrigger adds a scrubbed emphasis to section headings and a short resolving motion to architecture nodes. Content remains visible by default, animations never block interaction, and reduced-motion mode bypasses the motion layer.

## Accessibility

The system includes visible focus, a skip link, semantic landmarks, status text plus color, external-link announcements, keyboard-trapped mobile navigation, Escape close behavior, source-order-preserving responsive layouts, and textual figure captions.
