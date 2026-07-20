import Link from "next/link";
import { Book2, Chart2, CodeSquare, Command, Database, LinkRoundAngle, Magnifer, Programming, SettingsMinimalistic, Wallet2, type IconProps } from "@solar-icons/react";
import type { ComponentType } from "react";
import type { Product } from "@/content/products";

const productIcons: Record<string, ComponentType<IconProps>> = {
  wallet: Wallet2,
  connect: LinkRoundAngle,
  explorer: Magnifer,
  sdk: Programming,
  cli: Command,
  devkit: SettingsMinimalistic,
  api: Database,
  docs: Book2,
  trade: Chart2,
};

export function Status({ value }: { value: string }) { return <span className={`status status-${value.toLowerCase().replaceAll(" ", "-")}`}><i aria-hidden="true" />{value}</span> }
export function ExternalLink({ href, children, className="" }: { href: string; children: React.ReactNode; className?: string }) { return <a className={className} href={href} target="_blank" rel="noreferrer">{children}<span className="sr-only"> (opens in a new tab)</span></a> }
export function ProductRow({ product }: { product: Product }) { const Icon = productIcons[product.id] ?? CodeSquare; return <Link href={`/${product.id}`} className="product-row" style={{"--accent": `var(--product-${product.accent})`} as React.CSSProperties}><Icon className="product-mask" aria-hidden="true" /><div><span className="product-index">{String(Number(product.id.length) + 3).padStart(2,"0")}</span><h3>{product.name}</h3></div><p>{product.descriptor}</p><Status value={product.status} /></Link> }
export function IndependenceNotice() { return <aside className="independence"><span aria-hidden="true">[ i ]</span><p>Glyph is an independent community project building software for the Qubic network.</p></aside> }
