# Site architecture

The Next.js App Router project is statically exported. Product and organization truth is centralized under `content/` and rendered through a shared dynamic route.

## Routes

- Core: `/`, `/ecosystem`, `/developers`, `/community`, `/open-source`, `/roadmap`, `/security`, `/about`
- Products: `/wallet`, `/connect`, `/explorer`, `/sdk`, `/cli`, `/devkit`, `/api`, `/docs`, `/trade`
- Supporting: `/download`, `/brand`, `/privacy`, `/terms`, `/trademark`, and designed not-found output

## Rendering model

- `app/page.tsx` provides the organization homepage.
- `app/[slug]/page.tsx` statically generates product, ecosystem, download, organizational, and legal routes.
- `content/products.ts` is the product source of truth, including status and license fields.
- `content/pages.ts` contains non-product page content.
- `app/sitemap.ts` and `app/robots.ts` generate static crawler files.
- Netlify-style `_redirects` supplies static-host 404 behavior. Each route also emits a physical directory under `out/`.

## Component model

Global shell components provide accessible navigation and disclosures. Shared UI components render status, licensing links, external-link semantics, product rows, diagrams, and independence notices. Product pages share one framework while Wallet and Connect receive current-product evidence sections.

