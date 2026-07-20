import { ConnectFlow, StackDiagram } from "@/components/Diagrams";
import { PageHero, SectionHeading } from "@/components/layout/PageElements";
import { IndependenceNotice, ProductRow } from "@/components/UI";
import { products } from "@/content/products";

export function EcosystemPage() {
  return (
    <main id="main">
      <PageHero>
        <p className="kicker">Glyph ecosystem</p>
        <h1>Software organized by responsibility.</h1>
        <p className="lead">The product family connects application intent, developer workflows, infrastructure, and user-controlled approval.</p>
      </PageHero>
      <section className="section section-dark"><StackDiagram /></section>
      <section className="section">
        <SectionHeading title="How a dApp reaches Wallet" />
        <ConnectFlow />
      </section>
      <section className="section">
        <SectionHeading title="Current and future architecture">
          <p>Available products work today. In-development and planned products describe the intended system without implying availability.</p>
        </SectionHeading>
        <div className="product-list" data-reveal-group="products">{products.map((product) => <ProductRow key={product.id} product={product} />)}</div>
      </section>
      <IndependenceNotice />
    </main>
  );
}
