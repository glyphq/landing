import Link from "next/link";
import { ArrowRight, BranchingPathsUp, Code2, Download, Shield } from "@solar-icons/react";
import { ProductIcon } from "@/components/products/ProductIcon";
import { ConnectFlow, StackDiagram } from "@/components/Diagrams";
import { ActionGroup, SectionHeading } from "@/components/layout/PageElements";
import { SponsorTicker } from "@/components/SponsorTicker";
import { ExternalLink, IndependenceNotice, ProductRow } from "@/components/UI";
import { availableProducts, unavailableProducts } from "@/content/products";

function HomeHero() {
  return (
    <section className="hero section-wide" data-reveal="hero">
      <div className="hero-copy">
        <h1>Build on Qubic without rebuilding the basics.</h1>
        <p className="lead">Glyph creates dependable wallets, libraries, and infrastructure as one coherent system.</p>
        <ActionGroup>
          <Link className="button" href="/download"><Download aria-hidden="true" />Download Glyph Wallet</Link>
          <ExternalLink className="button button-secondary" href="https://docs.glyphq.org"><Code2 aria-hidden="true" />Start building</ExternalLink>
        </ActionGroup>
      </div>
    </section>
  );
}

function CurrentProducts() {
  return (
    <section className="section">
      <SectionHeading title="Available now">
        <p>Wallet, Connect, and Explorer cover local approval, application integration, and readable Qubic network data.</p>
      </SectionHeading>
      <div className="current-products" data-reveal-group="current-products">
        {availableProducts.map((product) => (
          <article key={product.id} className={`current-product accent-${product.accent}`}>
            <ProductIcon productId={product.id} className="current-product-mask" aria-hidden="true" />
            <div><h3>{product.name}</h3><p>{product.summary}</p></div>
            <ul>{product.capabilities.slice(0, 3).map((capability) => <li key={capability}>{capability}</li>)}</ul>
            <Link className="button current-product-action" href={`/${product.id}`}>
              Explore {product.name}<ArrowRight aria-hidden="true" />
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}

export function HomePage() {
  return (
    <main id="main">
      <HomeHero />
      <section className="statement section" data-reveal="statement"><h2>Make Qubic easier to build on<br />and safer to use.</h2></section>
      <CurrentProducts />
      <section className="section section-dark">
        <SectionHeading title="One system. Clear boundaries."><p>Products are organized by the role they play, not presented as an undifferentiated suite.</p></SectionHeading>
        <StackDiagram />
      </section>
      <section className="section">
        <SectionHeading title="From application intent to user approval"><p>Connect creates a typed request. Wallet validates it, displays it, and returns an explicit result.</p></SectionHeading>
        <ConnectFlow />
        <div className="code-line" data-reveal="code"><code>bun add @glyph-oss/connect</code><a href="https://www.npmjs.com/package/@glyph-oss/connect" target="_blank" rel="noreferrer">Package<span className="sr-only"> (opens in a new tab)</span></a></div>
      </section>
      <section className="section split" data-reveal="split">
        <div><h2>The signing boundary stays in the wallet.</h2></div>
        <div><p>Vault data is encrypted before disk storage. Signing requests pass through the desktop application for review. Glyph Connect never receives private keys.</p><Link className="quiet-link quiet-link-icon" href="/security"><Shield aria-hidden="true" />Read the security model</Link></div>
      </section>
      <section className="section">
        <SectionHeading title="What comes next"><p>In-development and planned products are kept separate from the tools that are ready to use today.</p></SectionHeading>
        <div className="product-list" data-reveal-group="products">{unavailableProducts.map((product) => <ProductRow key={product.id} product={product} />)}</div>
      </section>
      <section className="section maintenance" data-reveal="statement">
        <h2>Built in public,<br />ready to use.</h2>
        <div><p>Glyph Wallet, Connect, Docs, and Explorer are public today. Use the product that fits your work, or follow development in the organization repositories.</p><ExternalLink className="quiet-link quiet-link-icon" href="https://github.com/glyphq"><BranchingPathsUp aria-hidden="true" />Visit Glyph on GitHub</ExternalLink></div>
      </section>
      <section className="section final-cta" data-reveal="cta">
        <h2>Choose the path you need.</h2>
        <ActionGroup><ExternalLink className="button" href="https://docs.glyphq.org"><Code2 aria-hidden="true" />Start building</ExternalLink><Link className="button button-secondary" href="/download"><Download aria-hidden="true" />Get Glyph Wallet</Link></ActionGroup>
      </section>
      <SponsorTicker />
      <IndependenceNotice />
    </main>
  );
}
