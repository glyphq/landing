import { Box, BranchingPathsUp, Download } from "@solar-icons/react";
import type { Product } from "@/content/products";
import { productById } from "@/content/products";
import { ConnectFlow } from "@/components/Diagrams";
import { ActionGroup, PageHero, SectionHeading } from "@/components/layout/PageElements";
import { ExternalLink, IndependenceNotice, ProductRow, Status } from "@/components/UI";

const connectExample = `import { createConnectRequest, glyphRequest } from "@glyph-oss/connect";

try {
  const result = await glyphRequest(createConnectRequest({
    type: "connect",
    dapp: { name: "My App", origin: "https://my.app" },
    permissions: ["transfer", "sign_message"],
  }));

  if (result.status === "rejected") {
    console.info(result.reason);
  }
} catch (error) {
  console.error("Glyph Wallet could not be opened", error);
}`;

function ProductActions({ product }: { product: Product }) {
  return (
    <ActionGroup>
      {product.downloadUrl && (
        <ExternalLink className="button" href={product.downloadUrl}>
          <Download aria-hidden="true" />
          Download v0.14.3
        </ExternalLink>
      )}
      {product.packageUrl && (
        <ExternalLink className="button" href={product.packageUrl}>
          <Box aria-hidden="true" />
          View package
        </ExternalLink>
      )}
      {product.repositoryUrl && (
        <ExternalLink className="button button-secondary" href={product.repositoryUrl}>
          <BranchingPathsUp aria-hidden="true" />
          Repository
        </ExternalLink>
      )}
    </ActionGroup>
  );
}

function WalletProof({ product }: { product: Product }) {
  return (
    <section className="section wallet-proof" data-reveal="fade-up">
      <div>
        <h2>Vaults and signing stay on your device.</h2>
        <p>Glyph Wallet encrypts vault data before storing it locally. Signing runs inside the native desktop application, with replay protection and a constrained boundary between the interface and its Rust core.</p>
        <ul className="check-list">{product.capabilities.map((capability) => <li key={capability}>{capability}</li>)}</ul>
      </div>
    </section>
  );
}

function ConnectProof() {
  return (
    <>
      <section className="section">
        <SectionHeading title="A request you can inspect">
          <p>The example follows the published v2.0.0 API and includes a rejection path.</p>
        </SectionHeading>
        <pre className="code-block" data-reveal="code"><code>{connectExample}</code></pre>
      </section>
      <section className="section"><ConnectFlow /></section>
    </>
  );
}

function Availability({ product }: { product: Product }) {
  return (
    <section className="section availability" data-reveal-group="availability">
      <div><h2>What exists today</h2><p>The product direction and ecosystem role are defined. No public release, package, endpoint, command syntax, or complete documentation is available yet.</p></div>
      <div><h2>What will guide the work</h2><ul>{product.principles.map((principle) => <li key={principle}>{principle}</li>)}</ul></div>
    </section>
  );
}

function EcosystemRole({ product, current }: { product: Product; current: boolean }) {
  return (
    <section className="section split" data-reveal="split">
      <div><p className="kicker">Ecosystem role</p><h2>{current ? "A working part of the system." : "A stated part of the future system."}</h2></div>
      <div>
        <p>{product.principles.join(". ")}.</p>
        <dl className="metadata-list">
          <div><dt>Status</dt><dd>{product.status}</dd></div>
          <div><dt>License</dt><dd>{product.licenseStatus} · {product.licenseName}</dd></div>
          <div><dt>Public availability</dt><dd>{current ? "Available now" : "Not available yet"}</dd></div>
        </dl>
      </div>
    </section>
  );
}

function RelatedProducts({ product }: { product: Product }) {
  return (
    <section className="section">
      <SectionHeading title="Related products" />
      <div className="product-list" data-reveal-group="products">
        {product.related.map((id) => <ProductRow key={id} product={productById[id]} />)}
      </div>
    </section>
  );
}

export function ProductPageView({ product }: { product: Product }) {
  const current = product.status === "Available";

  return (
    <main id="main" className={`product-page accent-${product.accent}`}>
      <PageHero>
        <Status value={product.status} />
        <p className="kicker">{product.descriptor}</p>
        <h1>{product.name}</h1>
        <p className="lead">{product.summary}</p>
        <ProductActions product={product} />
      </PageHero>
      {product.id === "wallet" && <WalletProof product={product} />}
      {product.id === "connect" && <ConnectProof />}
      {!current && <Availability product={product} />}
      <EcosystemRole product={product} current={current} />
      <RelatedProducts product={product} />
      <IndependenceNotice />
    </main>
  );
}
