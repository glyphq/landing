import { Blocks, Braces, Code2, Database, Send, ShieldCheck, UserCheck, UserRound } from "lucide-react";
import { productById } from "@/content/products";

const approvalSteps = [
  { title: "Application creates intent", detail: "The dApp defines the requested action and its return path.", meta: "dApp", icon: Send },
  { title: "Connect builds the request", detail: "Glyph Connect encodes a typed envelope for Glyph Wallet.", meta: "Glyph Connect", icon: Braces },
  { title: "Wallet validates and explains", detail: "Wallet checks the request boundary and presents the action for review.", meta: "Glyph Wallet", icon: ShieldCheck },
  { title: "User makes the decision", detail: "Approval signs locally. Rejection returns an explicit result.", meta: "Local approval", icon: UserCheck },
];

export function ConnectFlow() { return <figure className="approval-flow"><div className="approval-steps">{approvalSteps.map((step, index) => { const Icon = step.icon; return <article className="approval-step" key={step.title}><div className="approval-step-top"><span>0{index + 1}</span><Icon aria-hidden="true" /></div><div><small>{step.meta}</small><h3>{step.title}</h3><p>{step.detail}</p></div>{index < approvalSteps.length - 1 && <i className="approval-connector" aria-hidden="true">→</i>}</article>; })}</div><figcaption>A typed request moves from application intent to a decision inside Glyph Wallet. Keys never cross into the application.</figcaption></figure> }

const layers = [
  { name: "User", description: "Hold, inspect, and act through user-controlled interfaces.", icon: UserRound, products: ["wallet", "explorer", "trade"] },
  { name: "Application", description: "Express application intent through typed integration boundaries.", icon: Blocks, products: ["connect", "sdk"] },
  { name: "Developer", description: "Build with repeatable workflows and shared references.", icon: Code2, products: ["cli", "devkit", "docs"] },
  { name: "Infrastructure", description: "Reach Qubic data and network integrations consistently.", icon: Database, products: ["api"] },
];

export function StackDiagram() { return <figure className="architecture"><header className="architecture-header"><p>System architecture</p><h2>Four layers. One maintained path.</h2><span>The product family is arranged by responsibility, from user control to network access.</span></header><div className="architecture-track">{layers.map((layer, index) => { const Icon = layer.icon; return <article className="architecture-stage" key={layer.name}><div className="architecture-stage-top"><span>0{index + 1}</span><Icon aria-hidden="true" /></div><div className="architecture-stage-copy"><h3>{layer.name}</h3><p>{layer.description}</p></div><ul>{layer.products.map((id) => { const product = productById[id]; return <li key={id}><span>{product.name.replace("Glyph ", "")}</span><small>{product.status}</small></li>; })}{layer.name === "Infrastructure" && <li className="architecture-boundary"><span>Qubic integrations</span><small>Network boundary</small></li>}</ul>{index < layers.length - 1 && <i className="architecture-connector" aria-hidden="true">→</i>}</article>; })}</div><figcaption>Availability and license status remain explicit on each product page.</figcaption></figure> }
