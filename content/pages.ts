export type InfoPage = { slug: string; title: string; description: string; intro: string; sections: { title: string; body: string; items?: string[] }[] };

export const infoPages: InfoPage[] = [
  { slug: "developers", title: "Build with a maintained path", description: "Use Glyph Connect today and follow the broader Glyph developer stack as it develops.", intro: "The current integration path is direct: create a typed request, open Glyph Wallet, handle approval or rejection, then continue your application flow.", sections: [
    { title: "Start with Connect", body: "Install the current MIT-licensed package from npm. It is framework-agnostic, fully typed, and has no runtime dependencies.", items: ["bun add @glyph-oss/connect", "Create a request and envelope", "Launch the glyph:// URL", "Handle signed, connected, or rejected results"] },
    { title: "Failures are part of the contract", body: "Applications should treat rejection, expiry, invalid callbacks, and unavailable desktop handling as expected outcomes, not exceptional UI states." },
    { title: "The wider stack", body: "SDK, CLI, Devkit, API, and shared Docs are in development or planned. They are not required to use Connect today." },
  ]},
  { slug: "community", title: "Contribute where the work is visible", description: "How Glyph is maintained, discussed, and improved.", intro: "Glyph is maintainer-led software that accepts focused contributions through its public repositories.", sections: [
    { title: "Ways to contribute", body: "Start with repository issues and documentation. For behavior changes, open an issue before investing in a large implementation.", items: ["Report reproducible defects", "Improve documentation and examples", "Review open issues", "Test releases on supported platforms"] },
    { title: "Maintainer-led today", body: "Public input informs the work, but not every architectural decision is put to a vote. Maintainers remain responsible for coherence, releases, and security boundaries." },
    { title: "Community channel", body: "The Wallet repository currently publishes a Glyph Discord invitation. Repository discussions and issues remain the durable record for technical work." },
  ]},
  { slug: "open-source", title: "Licenses, stated precisely", description: "Repository, license, and maintenance status across Glyph software.", intro: "Glyph does not apply one license label to every product. Each repository is described according to the license it actually publishes.", sections: [
    { title: "Glyph Connect", body: "Open source under the MIT License. The package is published on npm and developed in public." },
    { title: "Glyph Wallet", body: "Source available. Its repository is public, but it does not publish an OSI-approved license and must not be described as open source." },
    { title: "Planned software", body: "Unpublished products have no public license yet. Their future license will be stated when a repository or service is released." },
  ]},
  { slug: "roadmap", title: "Direction without invented dates", description: "A status-based roadmap for the Glyph software suite.", intro: "This roadmap describes current direction, not guaranteed delivery dates. Status changes when public work or a release supports the change.", sections: [
    { title: "Available", body: "Software with a public release or package.", items: ["Glyph Wallet", "Glyph Connect"] },
    { title: "In development", body: "Product direction is defined, but the public experience is incomplete.", items: ["Glyph Explorer", "Glyph SDK", "Glyph Docs"] },
    { title: "Planned", body: "Part of the intended product system, with no available product today.", items: ["Glyph CLI", "Glyph Devkit", "Glyph API", "Glyph Trade"] },
  ]},
  { slug: "security", title: "Security claims require evidence", description: "Glyph security boundaries, release practices, and responsible reporting.", intro: "Report potential Wallet vulnerabilities privately. Do not disclose security issues in a public issue before maintainers can investigate.", sections: [
    { title: "Report privately", body: "Use the Wallet repository’s private GitHub Security Advisory form. The published policy also lists security@glyph.app." },
    { title: "Wallet boundary", body: "Vault data is encrypted before disk storage. The Wallet repository documents AES-256-GCM, Argon2, local signing, memory clearing on lock, and a constrained Tauri IPC surface." },
    { title: "Release practice", body: "The release workflow validates the expected artifact set and updater signatures before publication. Only the latest Wallet release receives security fixes." },
    { title: "Limits", body: "Glyph does not claim perfect security, reproducible builds, or a third-party audit. OS compromise, social engineering, and physical access to an unlocked device remain outside the published scope." },
  ]},
  { slug: "about", title: "Make complexity legible", description: "Why Glyph exists and how it relates to Qubic.", intro: "Glyph is an independent software suite that makes Qubic easier to build on and use.", sections: [
    { title: "Why Glyph", body: "A glyph gives abstract information a clear, usable form. Glyph applies the same idea to Qubic, turning protocols and primitives into interfaces developers can build with and users can trust." },
    { title: "Mission", body: "Make Qubic easier to build on and safer to use." },
    { title: "Long-term view", body: "Developers should spend time building products instead of rebuilding basic infrastructure. Glyph favors clear interfaces, local control, and predictable tools." },
    { title: "Independent by design", body: "Glyph is an independent community project building software for the Qubic network. It is not an official Qubic organization." },
  ]},
  { slug: "brand", title: "Use the Glyph identity carefully", description: "Brand resources and the canonical Glyph identity destination.", intro: "Canonical brand guidance belongs at branding.glyphq.org. Use supplied masters rather than reconstructing or modifying the mark.", sections: [
    { title: "Wordmark", body: "The organization is written Glyph. The visual wordmark may appear as glyph. The period is graphical and is not part of the grammatical name." },
    { title: "Relationship language", body: "Use: “Glyph is an independent community project building software for the Qubic network.” Do not imply endorsement or formal affiliation." },
  ]},
  { slug: "privacy", title: "Privacy", description: "Privacy information for the Glyph public website.", intro: "This static public website is designed to work without accounts, analytics cookies, or behavioral advertising.", sections: [
    { title: "Website data", body: "The site does not intentionally collect personal information through forms. Hosting providers may process standard request logs according to their own infrastructure policies." },
    { title: "External services", body: "Links to GitHub, npm, Discord, and product downloads take you to services with their own privacy terms." },
    { title: "Product privacy", body: "This notice covers glyphq.org only. Product repositories and applications document their own data and security boundaries." },
  ]},
  { slug: "terms", title: "Terms", description: "Terms for using the Glyph public website.", intro: "The website provides project information and links to software distributed under product-specific terms.", sections: [
    { title: "No warranty", body: "Information and software are provided without a promise that they will be uninterrupted, error-free, or suitable for a particular purpose." },
    { title: "Software terms", body: "Each repository or release controls its own license. This website does not replace those terms." },
    { title: "Financial decisions", body: "Nothing on this site is investment, trading, tax, or legal advice." },
  ]},
  { slug: "trademark", title: "Trademark", description: "Guidance for referring to Glyph names and marks.", intro: "You may refer factually to Glyph products. Do not imply sponsorship, endorsement, or an official relationship that does not exist.", sections: [
    { title: "Names", body: "Glyph, Glyph Wallet, Glyph Connect, and other branded-house product names identify software produced by Glyph." },
    { title: "Assets", body: "Do not alter symbol geometry, stretch the wordmark, add visual effects, or use the marks in a way that suggests your project is produced by Glyph." },
  ]},
];

export const pageBySlug = Object.fromEntries(infoPages.map((page) => [page.slug, page]));

