# Design decisions

## Direction

The site now feels like carefully maintained software used in a calm studio environment: clean daylight, warm materials, precise interfaces, and enough softness to remain approachable. Warmth comes from the oxblood identity color, gently tinted neutral surfaces, rounded composition, and pacing rather than a cream-paper aesthetic.

## Identity

- Typography remains the primary identity carrier, with less monospaced labeling and more human sentence-case hierarchy.
- The header uses a temporary typographic `glyph.` treatment because a canonical vector wordmark was not present. Approved repository raster assets remain under `public/brand/`.
- Product colors identify roles through restrained surface tints and status details rather than hard rules.
- Oxblood remains the anchor, supported by warm charcoal and a muted blue for Connect.

## Composition

The homepage hero remains text-only, now centered with a broad two-line measure and calmer action grouping. Major sections behave as softly inset chapters rather than ruled documents. Current products use an asymmetric two-card composition, planned products use a dense responsive mosaic, architecture diagrams sit inside rounded system surfaces, and content pages use varied two-column editorial modules.

## Motion

GSAP provides two restrained behaviors: section headings gain emphasis as they enter the reading zone, and architecture nodes resolve gently into place. Nothing is hidden before hydration. Reduced-motion mode skips all choreography.

## Warm system

The final system uses 8px controls, 12px modules, and 16px chapter surfaces. Borders are removed from most large compositions and retained only where they clarify internal data. Shadows are limited to the Wallet application frame. Buttons change color without translating on hover.

## Current-product evidence

Wallet uses an abstracted UI composition, explicitly not a fake screenshot, because no repository screenshot or safely runnable test vault was available during implementation. Connect code follows its published v2.0.0 API. Future products use architecture, stated principles, and unavailable-now language instead of invented interfaces.

