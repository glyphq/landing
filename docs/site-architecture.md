# Site architecture

The Next.js App Router project is statically exported. Product and organization truth is centralized under `content/` and rendered through a shared dynamic route.

## Routes

- Core: `/`, `/ecosystem`, `/developers`, `/community`, `/open-source`, `/roadmap`, `/security`, `/about`
- Products: `/wallet`, `/connect`, `/explorer`, `/sdk`, `/cli`, `/devkit`, `/api`, `/docs`, `/trade`
- Supporting: `/download`, `/support`, `/brand`, `/privacy`, `/terms`, `/trademark`, and designed not-found output

## Rendering model

- `app/page.tsx` delegates the organization homepage to `components/pages/HomePage.tsx`.
- `app/[slug]/page.tsx` is a typed route dispatcher. It statically generates routes and selects reusable page views without owning presentation markup.
- `components/pages/` contains organization, ecosystem, download, and not-found page compositions.
- `components/products/` owns the shared product-page framework and centralized product icon mapping.
- `components/layout/` contains small page-level layout primitives such as heroes, section headings, and action groups.
- `content/products.ts` is the product source of truth, including status and license fields.
- `content/pages.ts` contains non-product page content.
- `content/supporters.ts` contains the support identity configuration and verified, opt-in recognition records.
- `app/sitemap.ts` and `app/robots.ts` generate static crawler files.
- Netlify-style `_redirects` supplies static-host 404 behavior. Each route also emits a physical directory under `out/`.

## Component model

Global shell components provide accessible navigation and disclosures. Page routes delegate to typed compositions rather than duplicating markup. Shared layout primitives render heroes, section headings, and action groups. Product components own status, evidence, ecosystem-role, related-product, and product-icon behavior. Data attributes define motion intent without coupling content components to GSAP.
