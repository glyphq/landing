export type ProductStatus = "Available" | "In development" | "Planned" | "Research";
export type LicenseStatus = "Open source" | "Source available" | "Planned";

export type Product = {
  id: string;
  name: string;
  descriptor: string;
  summary: string;
  status: ProductStatus;
  licenseStatus: LicenseStatus;
  licenseName: string;
  accent: string;
  repositoryUrl?: string;
  documentationUrl?: string;
  packageUrl?: string;
  downloadUrl?: string;
  capabilities: string[];
  principles: string[];
  related: string[];
};

export const products: Product[] = [
  {
    id: "wallet", name: "Glyph Wallet", descriptor: "Self-custodial Qubic desktop wallet",
    summary: "A desktop wallet that keeps encrypted vault data on your device and reviews every signing request before approval.",
    status: "Available", licenseStatus: "Source available", licenseName: "Custom source-available license", accent: "wallet",
    repositoryUrl: "https://github.com/glyphq/wallet", downloadUrl: "https://github.com/glyphq/wallet/releases/tag/v0.14.3",
    capabilities: ["Send, receive, burn, and stake", "Encrypted vaults with AES-256-GCM and Argon2", "Local signing boundary in the native application", "Native glyph:// deep-link requests", "Windows, universal macOS, and Linux packages", "Signed update payload verification"],
    principles: ["Keys remain under local control", "Requests are reviewed before signing", "Release artifacts are signed and validated"], related: ["connect"],
  },
  {
    id: "connect", name: "Glyph Connect", descriptor: "Typed deep-link SDK for Glyph Wallet",
    summary: "A framework-agnostic TypeScript package for creating Glyph Wallet requests and handling approval, rejection, callback, and redirect results.",
    status: "Available", licenseStatus: "Open source", licenseName: "MIT", accent: "connect",
    repositoryUrl: "https://github.com/glyphq/connect", packageUrl: "https://www.npmjs.com/package/@glyph-oss/connect", documentationUrl: "https://github.com/glyphq/connect#readme",
    capabilities: ["Transfer requests", "Smart-contract call requests", "Message signing and verification", "Connection requests with permissions", "Callback and redirect delivery", "Fully typed API with zero runtime dependencies"],
    principles: ["Explicit request envelopes", "HTTPS origins and constrained callbacks", "Typed results for approval and rejection"], related: ["wallet", "sdk"],
  },
  { id: "explorer", name: "Glyph Explorer", descriptor: "A legible view of Qubic network activity", summary: "A planned interface for understanding identities, transactions, contracts, and network activity without decorative market noise.", status: "In development", licenseStatus: "Planned", licenseName: "Not yet published", accent: "explorer", capabilities: [], principles: ["Trace data to its source", "Make state and uncertainty visible", "Prefer readable relationships over dense dashboards"], related: ["api", "docs"] },
  { id: "sdk", name: "Glyph SDK", descriptor: "Coherent libraries for Qubic applications", summary: "A planned set of maintained libraries that reduces repeated protocol and application integration work.", status: "In development", licenseStatus: "Planned", licenseName: "Not yet published", accent: "sdk", capabilities: [], principles: ["Consistent concepts across packages", "Explicit versioning and migration notes", "No language support claims before release"], related: ["connect", "cli", "devkit"] },
  { id: "cli", name: "Glyph CLI", descriptor: "Repeatable Qubic development workflows", summary: "Planned command-line tooling for operations that benefit from scripts, automation, and reproducible local workflows.", status: "Planned", licenseStatus: "Planned", licenseName: "Not yet published", accent: "cli", capabilities: [], principles: ["Scriptable output", "Safe defaults", "Commands documented only when implemented"], related: ["sdk", "devkit"] },
  { id: "devkit", name: "Glyph Devkit", descriptor: "Examples, templates, and development workflows", summary: "A planned collection of tools and reference projects that helps teams start from maintained foundations.", status: "Planned", licenseStatus: "Planned", licenseName: "Not yet published", accent: "devkit", capabilities: [], principles: ["Working examples over fragments", "Small composable templates", "Document assumptions and boundaries"], related: ["sdk", "cli", "docs"] },
  { id: "api", name: "Glyph API", descriptor: "Consistent access to Qubic data", summary: "A planned infrastructure layer for applications that need stable, documented access to Qubic data and Glyph services.", status: "Planned", licenseStatus: "Planned", licenseName: "Not yet published", accent: "api", capabilities: [], principles: ["Publish contracts before promises", "Expose provenance and freshness", "No reliability claims before operation"], related: ["explorer", "sdk"] },
  { id: "docs", name: "Glyph Docs", descriptor: "One documentation system for Glyph products", summary: "A planned shared documentation experience for concepts, integration guides, API references, and operational notes.", status: "In development", licenseStatus: "Planned", licenseName: "Not yet published", accent: "docs", documentationUrl: "https://github.com/glyphq/connect#readme", capabilities: [], principles: ["Examples must run", "Status belongs beside documentation", "Concepts connect across products"], related: ["connect", "sdk", "devkit"] },
  { id: "trade", name: "Glyph Trade", descriptor: "Transparent market interaction", summary: "A future interface for market interaction that prioritizes clear intent, reviewable actions, and risk-aware information.", status: "Planned", licenseStatus: "Planned", licenseName: "Not yet published", accent: "trade", capabilities: [], principles: ["No urgency mechanics", "Show costs and consequences before action", "Avoid speculation-led design"], related: ["wallet", "api"] },
];

export const productById = Object.fromEntries(products.map((product) => [product.id, product]));

