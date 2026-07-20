import { Palette, ShieldWarning } from "@solar-icons/react";
import type { InfoPage as InfoPageContent } from "@/content/pages";
import { products } from "@/content/products";
import { ConnectFlow } from "@/components/Diagrams";
import { PageHero } from "@/components/layout/PageElements";
import { ExternalLink, IndependenceNotice, ProductRow } from "@/components/UI";

function InfoAction({ slug }: { slug: string }) {
  if (slug === "security") return <ExternalLink className="button" href="https://github.com/glyphq/wallet/security/advisories/new"><ShieldWarning aria-hidden="true" />Report a vulnerability</ExternalLink>;
  if (slug === "brand") return <ExternalLink className="button" href="https://branding.glyphq.org"><Palette aria-hidden="true" />Open brand resources</ExternalLink>;
  return null;
}

export function InfoPage({ slug, page }: { slug: string; page: InfoPageContent }) {
  return (
    <main id="main">
      <PageHero>
        <p className="kicker">Glyph / {slug.replace("-", " ")}</p>
        <h1>{page.title}</h1>
        <p className="lead">{page.intro}</p>
        <InfoAction slug={slug} />
      </PageHero>
      <section className="section prose-sections" data-reveal-group="prose">
        {page.sections.map((section, index) => (
          <article key={section.title}>
            <span>{String(index + 1).padStart(2, "0")}</span>
            <div><h2>{section.title}</h2><p>{section.body}</p>{section.items && <ul>{section.items.map((item) => <li key={item}>{item}</li>)}</ul>}</div>
          </article>
        ))}
      </section>
      {slug === "developers" && <section className="section"><ConnectFlow /><pre className="code-block" data-reveal="code"><code>npm install @glyph-oss/connect</code></pre></section>}
      {slug === "roadmap" && <section className="section"><div className="product-list" data-reveal-group="products">{products.map((product) => <ProductRow key={product.id} product={product} />)}</div></section>}
      <IndependenceNotice />
    </main>
  );
}
