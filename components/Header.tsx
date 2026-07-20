"use client";

import Link from "next/link";
import { Blocks, BookOpen, CandlestickChart, ChevronDown, Database, Layers3, Search, Terminal, WalletCards, Waypoints, Wrench, type LucideIcon } from "lucide-react";
import { Download } from "@solar-icons/react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { products } from "@/content/products";

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

export function Header() {
  const [open, setOpen] = useState(false);
  const [productsOpen, setProductsOpen] = useState(false);
  const panel = useRef<HTMLDivElement>(null);
  const header = useRef<HTMLElement>(null);

  useEffect(() => {
    const onPointer = (event: MouseEvent) => {
      if (!header.current?.contains(event.target as Node)) setProductsOpen(false);
    };
    const onEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setProductsOpen(false);
    };
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onEscape);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onEscape);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const focusable = panel.current?.querySelectorAll<HTMLElement>("a,button") ?? [];
    focusable[0]?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
      if (event.key === "Tab" && focusable.length) {
        const first = focusable[0], last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = previousOverflow; previous?.focus(); };
  }, [open]);

  const mobileMenu = open ? createPortal(<div className="menu-backdrop" onMouseDown={() => setOpen(false)}><div ref={panel} id="mobile-menu" className="mobile-menu" role="dialog" aria-modal="true" aria-label="Navigation" onMouseDown={(event) => event.stopPropagation()}><div className="menu-head"><Link className="wordmark" href="/" onClick={() => setOpen(false)} aria-label="Glyph home"><span>glyph</span><b>.</b></Link><button onClick={() => setOpen(false)}>Close</button></div><nav aria-label="Mobile"><div className="mobile-menu-group"><p>Products</p><Link className="mobile-menu-featured" href="/ecosystem" onClick={() => setOpen(false)}>Ecosystem overview<span>All products</span></Link>{products.map((product) => <Link key={product.id} href={`/${product.id}`} onClick={() => setOpen(false)}>{product.name}<span>{product.status}</span></Link>)}</div><div className="mobile-menu-group"><p>Organization</p><Link href="/developers" onClick={() => setOpen(false)}>Developers</Link><a href="https://docs.glyphq.org" target="_blank" rel="noreferrer" onClick={() => setOpen(false)}>Docs<span>External ↗</span></a><Link href="/roadmap" onClick={() => setOpen(false)}>Roadmap</Link><Link href="/community" onClick={() => setOpen(false)}>Community</Link><Link href="/open-source" onClick={() => setOpen(false)}>Open source</Link><Link href="/security" onClick={() => setOpen(false)}>Security</Link><Link href="/about" onClick={() => setOpen(false)}>About</Link></div></nav></div></div>, document.body) : null;

  return <header ref={header} className="site-header"><div className="header-inner">
    <Link className="wordmark" href="/" aria-label="Glyph home"><span>glyph</span><b>.</b></Link>
    <nav className="desktop-nav" aria-label="Primary">
      <div className="nav-dropdown"><button type="button" onClick={() => setProductsOpen((value) => !value)} aria-expanded={productsOpen} aria-controls="products-menu">Products <ChevronDown aria-hidden="true" /></button>{productsOpen && <div id="products-menu" className="nav-popover"><Link className="nav-entry nav-entry-featured" href="/ecosystem" onClick={() => setProductsOpen(false)}><Layers3 className="nav-entry-icon" aria-hidden="true" /><span>Ecosystem overview</span><small>See how every Glyph product fits together</small></Link>{products.map((product) => { const Icon = productIcons[product.id] ?? Blocks; return <Link className="nav-entry" key={product.id} href={`/${product.id}`} onClick={() => setProductsOpen(false)}><Icon className="nav-entry-icon" aria-hidden="true" /><span>{product.name}</span><small>{product.status}</small></Link>; })}</div>}</div>
      <Link href="/developers">Developers</Link><a href="https://docs.glyphq.org" target="_blank" rel="noreferrer">Docs ↗</a><Link href="/open-source">Open source</Link><Link href="/about">About</Link>
    </nav>
    <div className="header-actions"><a className="text-link desktop-only" href="https://github.com/glyphq" target="_blank" rel="noreferrer">GitHub ↗</a><Link className="button button-small desktop-only" href="/download"><Download aria-hidden="true" />Get Wallet</Link><button className="menu-button" onClick={() => setOpen(true)} aria-expanded={open} aria-controls="mobile-menu">Menu</button></div>
  </div>{mobileMenu}</header>;
}
