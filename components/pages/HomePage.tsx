import Link from "next/link";
import { BranchingPathsUp, Code2, Download, Layers, Shield } from "@solar-icons/react";
import { ConnectFlow, StackDiagram } from "@/components/Diagrams";
import { ActionGroup, SectionHeading } from "@/components/layout/PageElements";
import { IndependenceNotice, ProductRow } from "@/components/UI";
import { products } from "@/content/products";

function HomeHero() {
  return (
    <section className="hero section-wide" data-reveal="hero">
      <div className="hero-copy">
        <p className="kicker">Independent software built for Qubic.</p>
        <h1>Build on Qubic without rebuilding the basics.</h1>
        <p className="lead">Glyph creates dependable wallets, libraries, and infrastructure as one coherent system.</p>
        <ActionGroup>
          <Link className="button" href="/ecosystem"><Layers aria-hidden="true" />Explore the ecosystem</Link>
          <Link className="button button-secondary" href="/developers"><Code2 aria-hidden="true" />Start building</Link>
          <Link className="quiet-link quiet-link-icon" href="/download"><Download aria-hidden="true" />Get Glyph Wallet</Link>
        </ActionGroup>
      </div>
    </section>
  );
}

function CurrentProducts() {
  return (
    <section className="section">
      <SectionHeading title="Available now">
        <p>Two current products establish the working path between Qubic applications and local user approval.</p>
      </SectionHeading>
      <div className="current-products" data-reveal-group="current-products">
        {products.slice(0, 2).map((product) => (
          <article key={product.id} className={`current-product accent-${product.accent}`}>
            <div><span>{product.status}</span><h3>{product.name}</h3><p>{product.summary}</p></div>
            <ul>{product.capabilities.slice(0, 3).map((capability) => <li key={capability}>{capability}</li>)}</ul>
            <Link href={`/${product.id}`}>Explore {product.name}</Link>
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
      <section className="statement section" data-reveal="statement"><p>Mission</p><h2>Make Qubic easier to build on<br />and safer to use.</h2></section>
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
        <div><p className="kicker">Local control</p><h2>The signing boundary stays in the wallet.</h2></div>
        <div><p>Vault data is encrypted before disk storage. Signing requests pass through the desktop application for review. Glyph Connect never receives private keys.</p><Link className="quiet-link quiet-link-icon" href="/security"><Shield aria-hidden="true" />Read the security model</Link></div>
      </section>
      <section className="section">
        <SectionHeading title="The planned system"><p>Future products are included to show direction. Their status is not hidden behind promotional language.</p></SectionHeading>
        <div className="product-list" data-reveal-group="products">{products.slice(2).map((product) => <ProductRow key={product.id} product={product} />)}</div>
      </section>
      <section className="section maintenance" data-reveal="statement">
        <h2>Maintained in public,<br />licensed product by product.</h2>
        <div><p>Connect is open source under MIT. Wallet is source available. Planned products will publish a license when their implementation is released.</p><Link className="quiet-link quiet-link-icon" href="/open-source"><BranchingPathsUp aria-hidden="true" />Review repositories and licenses</Link></div>
      </section>
      <section className="section final-cta" data-reveal="cta">
        <p>Clear interfaces. Local control. Predictable tools.</p>
        <h2>Choose the path you need.</h2>
        <ActionGroup><Link className="button" href="/developers"><Code2 aria-hidden="true" />Start building</Link><Link className="button button-secondary" href="/download"><Download aria-hidden="true" />Get Glyph Wallet</Link></ActionGroup>
      </section>
      <IndependenceNotice />
    </main>
  );
}
