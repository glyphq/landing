import { Blocks, Code2, Database, UserRound } from "lucide-react";
import { productById } from "@/content/products";

export function ConnectFlow() { return <figure className="flow"><div><span>dApp</span><small>creates request</small></div><b>→</b><div><span>Glyph Connect</span><small>encodes envelope</small></div><b>→</b><div><span>Glyph Wallet</span><small>validates + reviews</small></div><b>→</b><div><span>User</span><small>approves or rejects</small></div><figcaption>A dApp opens a typed glyph:// request. Wallet validates it and keeps approval with the user.</figcaption></figure> }

const layers = [
  { name: "User", description: "Interfaces people use to hold, inspect, and act.", icon: UserRound, products: ["wallet", "explorer", "trade"] },
  { name: "Application", description: "Typed application intent and integration boundaries.", icon: Blocks, products: ["connect", "sdk"] },
  { name: "Developer", description: "Repeatable workflows, references, and maintained foundations.", icon: Code2, products: ["cli", "devkit", "docs"] },
  { name: "Infrastructure", description: "Consistent data access and Qubic network integration.", icon: Database, products: ["api"] },
];

export function StackDiagram() { return <figure className="stack-diagram" aria-labelledby="stack-title"><header><p>System architecture</p><h2 id="stack-title">Four layers. One maintained path.</h2><span>Each layer has a distinct responsibility. Availability remains visible beside every product.</span></header><div className="stack-layers">{layers.map((layer, index) => { const Icon = layer.icon; return <div className="stack-layer" key={layer.name}><div className="stack-layer-heading"><span className="stack-layer-number">0{index + 1}</span><Icon aria-hidden="true" /><div><b>{layer.name}</b><p>{layer.description}</p></div></div><div className="stack-products">{layer.products.map((id) => { const product = productById[id]; return <div className="stack-product" key={id}><span>{product.name.replace("Glyph ", "")}</span><small>{product.status}</small></div>; })}{layer.name === "Infrastructure" && <div className="stack-product stack-product-external"><span>Qubic integrations</span><small>Network boundary</small></div>}</div>{index < layers.length - 1 && <span className="stack-connector" aria-hidden="true">↓</span>}</div>; })}</div><figcaption>The intended Glyph system from user-facing software through infrastructure. Product pages provide current availability and license status.</figcaption></figure> }
