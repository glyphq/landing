import Link from "next/link";
import { Blocks, BookOpen, CandlestickChart, Database, Search, Terminal, WalletCards, Waypoints, Wrench, type LucideIcon } from "lucide-react";
import type { Product } from "@/content/products";

const productIcons: Record<string, LucideIcon> = {
  wallet: WalletCards,
  connect: Waypoints,
  explorer: Search,
  sdk: Blocks,
  cli: Terminal,
  devkit: Wrench,
  api: Database,
  docs: BookOpen,
  trade: CandlestickChart,
};

export function Status({ value }: { value: string }) { return <span className={`status status-${value.toLowerCase().replaceAll(" ", "-")}`}><i aria-hidden="true" />{value}</span> }
export function ExternalLink({ href, children, className="" }: { href: string; children: React.ReactNode; className?: string }) { const isButton=className.split(" ").includes("button"); return <a className={className} href={href} target="_blank" rel="noreferrer">{children}{!isButton&&<> <span aria-hidden="true">↗</span></>}<span className="sr-only"> (opens in a new tab)</span></a> }
export function ProductRow({ product }: { product: Product }) { const Icon = productIcons[product.id] ?? Blocks; return <Link href={`/${product.id}`} className="product-row" style={{"--accent": `var(--product-${product.accent})`} as React.CSSProperties}><Icon className="product-mask" aria-hidden="true" /><div><span className="product-index">{String(Number(product.id.length) + 3).padStart(2,"0")}</span><h3>{product.name}</h3></div><p>{product.descriptor}</p><Status value={product.status} /><span aria-hidden="true">→</span></Link> }
export function IndependenceNotice() { return <aside className="independence"><span aria-hidden="true">[ i ]</span><p>Glyph is an independent community project building software for the Qubic network.</p></aside> }
