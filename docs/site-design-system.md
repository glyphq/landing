# Site design system

## Tokens

`app/globals.css` defines semantic OKLCH tokens for canvas, three surfaces, primary/secondary/tertiary text, borders, focus, semantic status colors, nine product accents, spacing, layout width, gutters, header height, and motion easing.

## Typography

Geist and Geist Mono are installed packages and bundled locally. Display type is capped at 6rem with a `-0.04em` tracking floor. Body copy is constrained through section grids and maximum widths.

## Themes

Light uses pure white and neutral grays. Dark uses true neutral near-black surfaces. `prefers-color-scheme` selects the default without client-side theme flash.

## Motion

The site uses restrained hover transitions and static system diagrams. Hover motion is limited to 2px translation or subtle inset changes. `prefers-reduced-motion` collapses durations and preserves every diagram statically.

## Accessibility

The system includes visible focus, a skip link, semantic landmarks, status text plus color, external-link announcements, keyboard-trapped mobile navigation, Escape close behavior, source-order-preserving responsive layouts, and textual figure captions.
