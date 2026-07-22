import { HandHeart, ShieldCheck } from "@solar-icons/react";
import { ActionGroup, PageHero, SectionHeading } from "@/components/layout/PageElements";
import { IndependenceNotice } from "@/components/UI";
import { SupporterField } from "@/components/support/SupporterField";
import { SupportTransfer } from "@/components/support/SupportTransfer";
import { supportConfig, supporters } from "@/content/supporters";

export function SupportPage() {
  return (
    <main id="main" className="support-page">
      <PageHero className="support-hero">
        <p className="kicker">Support Glyph</p>
        <h1>Keep independent Qubic software moving.</h1>
        <p className="lead">A direct Qubic transfer helps maintain releases, security work, documentation, and the shared foundations behind Glyph products.</p>
        <ActionGroup>
          <a className="button" href="#transfer"><HandHeart aria-hidden="true" />Make a Qubic transfer</a>
          <a className="quiet-link quiet-link-icon" href="#supporters"><ShieldCheck aria-hidden="true" />How recognition works</a>
        </ActionGroup>
      </PageHero>

      <div id="transfer"><SupportTransfer identity={supportConfig.identity} presets={supportConfig.presets} /></div>

      <section className="section support-principles">
        <SectionHeading title="Support with clear boundaries.">
          <p>Transfers support the project. They do not purchase governance rights, product priority, or affiliation with Qubic.</p>
        </SectionHeading>
        <div className="support-principle-grid" data-reveal-group="support-principles">
          <article><span>01</span><h3>Direct</h3><p>Support moves as a standard Qubic transfer to the published Glyph identity.</p></article>
          <article><span>02</span><h3>Voluntary</h3><p>No account, subscription, or public recognition is required.</p></article>
          <article><span>03</span><h3>Verifiable</h3><p>The complete recipient identity is presented for review before you sign.</p></article>
        </div>
      </section>

      <div id="supporters"><SupporterField supporters={supporters} /></div>

      <section className="section split support-transparency" data-reveal="split">
        <div><p className="kicker">Recognition</p><h2>Public only when a supporter asks.</h2></div>
        <div><p>Blockchain transfers are public, but identity is not assumed. Supporters appear here only after asking to be recognized and verifying the relevant transfer. Anonymous transfers remain anonymous on this site.</p><p>Recognition uses broad bands so this page can acknowledge sustained support without publishing exact contribution amounts.</p></div>
      </section>

      <IndependenceNotice />
    </main>
  );
}
