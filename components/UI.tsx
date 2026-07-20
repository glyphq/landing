import Link from "next/link";
import type { ReactNode } from "react";
import { ProductIcon } from "@/components/products/ProductIcon";
import type { Product } from "@/content/products";

export function Status({ value }: { value: string }) {
  return <span className={`status status-${value.toLowerCase().replaceAll(" ", "-")}`}><i aria-hidden="true" />{value}</span>;
}

export function ExternalLink({ href, children, className = "" }: { href: string; children: ReactNode; className?: string }) {
  return <a className={className} href={href} target="_blank" rel="noreferrer">{children}<span className="sr-only"> (opens in a new tab)</span></a>;
}

export function ProductRow({ product }: { product: Product }) {
  return (
    <Link href={`/${product.id}`} className="product-row" style={{ "--accent": `var(--product-${product.accent})` } as React.CSSProperties}>
      <ProductIcon productId={product.id} className="product-mask" aria-hidden="true" />
      <div><span className="product-index">{String(Number(product.id.length) + 3).padStart(2, "0")}</span><h3>{product.name}</h3></div>
      <p>{product.descriptor}</p>
      <Status value={product.status} />
    </Link>
  );
}

export function IndependenceNotice() {
  return <aside className="independence" data-reveal="notice"><span aria-hidden="true">[ i ]</span><p>Glyph is an independent community project building software for the Qubic network.</p></aside>;
}
