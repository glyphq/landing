import { PageHero } from "@/components/layout/PageElements";
import { ExternalLink, IndependenceNotice } from "@/components/UI";
import { productById } from "@/content/products";
import styles from "./LicensePage.module.css";

const connect = productById.connect;
const wallet = productById.wallet;

export function LicensePage() {
  return (
    <main id="main">
      <PageHero>
        <h1>Licenses, stated precisely</h1>
        <p className="lead">
          Glyph does not apply one license label to every product. Follow each repository for the terms that actually govern its software.
        </p>
      </PageHero>

      <section className={`section prose-sections ${styles.summary}`} aria-label="Glyph license summary">
        <article>
          <span aria-hidden="true">01</span>
          <div>
            <p className="kicker">Open source</p>
            <h2>{connect.name}</h2>
            <p>
              {connect.name} is released under the MIT License. Its source is public, and the package is available for application integrations.
            </p>
            <nav className="actions" aria-label={`${connect.name} links`}>
              <ExternalLink className="button button-secondary" href={connect.repositoryUrl!}>Repository</ExternalLink>
              <ExternalLink className="quiet-link" href={connect.packageUrl!}>npm package</ExternalLink>
            </nav>
          </div>
        </article>

        <article>
          <span aria-hidden="true">02</span>
          <div>
            <p className="kicker">Open source · MIT License</p>
            <h2>{wallet.name}</h2>
            <p>
              {wallet.name} is released under the MIT License. Its repository is public, and its source and terms are available there.
            </p>
            <nav className="actions" aria-label={`${wallet.name} links`}>
              <ExternalLink className="button button-secondary" href={wallet.repositoryUrl!}>Repository</ExternalLink>
            </nav>
          </div>
        </article>

        <article>
          <span aria-hidden="true">03</span>
          <div>
            <p className="kicker">Website code and content</p>
            <h2>Glyph Landing</h2>
            <p>
              The landing repository does not currently include a published license file. Do not assume that this website&apos;s code or content is open source.
            </p>
            <nav className="actions" aria-label="Glyph Landing links">
              <ExternalLink className="button button-secondary" href="https://github.com/glyphq/landing">Repository</ExternalLink>
            </nav>
          </div>
        </article>

        <article>
          <span aria-hidden="true">04</span>
          <div>
            <p className="kicker">Not yet published</p>
            <h2>Planned software</h2>
            <p>
              Unpublished products do not have a public license yet. Their terms will be stated when a repository or service is released.
            </p>
          </div>
        </article>
      </section>

      <IndependenceNotice />
    </main>
  );
}
