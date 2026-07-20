"use client";

import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { products } from "@/content/products";

type DropdownName = "products" | "ecosystem" | null;

const ecosystemLinks = [
  { href: "/ecosystem", label: "Ecosystem overview", detail: "How the Glyph product family fits together" },
  { href: "/developers", label: "Developers", detail: "The current integration path and planned stack" },
  { href: "/roadmap", label: "Roadmap", detail: "Available, in-development, and planned work" },
  { href: "/community", label: "Community", detail: "Contribute and follow development" },
];

export function Header() {
  const [open, setOpen] = useState(false);
  const [dropdown, setDropdown] = useState<DropdownName>(null);
  const panel = useRef<HTMLDivElement>(null);
  const header = useRef<HTMLElement>(null);

  useEffect(() => {
    const onPointer = (event: MouseEvent) => {
      if (!header.current?.contains(event.target as Node)) setDropdown(null);
    };
    const onEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setDropdown(null);
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
    return () => { document.removeEventListener("keydown", onKey); previous?.focus(); };
  }, [open]);

  const toggle = (name: Exclude<DropdownName, null>) => setDropdown((current) => current === name ? null : name);

  return <header ref={header} className="site-header"><div className="header-inner">
    <Link className="wordmark" href="/" aria-label="Glyph home"><span>glyph</span><b>.</b></Link>
    <nav className="desktop-nav" aria-label="Primary">
      <div className="nav-dropdown"><button type="button" onClick={() => toggle("products")} aria-expanded={dropdown === "products"} aria-controls="products-menu">Products <ChevronDown aria-hidden="true" /></button>{dropdown === "products" && <div id="products-menu" className="nav-popover">{products.map((product) => <Link key={product.id} href={`/${product.id}`} onClick={() => setDropdown(null)}><span>{product.name}</span><small>{product.status}</small></Link>)}</div>}</div>
      <div className="nav-dropdown"><button type="button" onClick={() => toggle("ecosystem")} aria-expanded={dropdown === "ecosystem"} aria-controls="ecosystem-menu">Ecosystem <ChevronDown aria-hidden="true" /></button>{dropdown === "ecosystem" && <div id="ecosystem-menu" className="nav-popover">{ecosystemLinks.map((item) => <Link key={item.href} href={item.href} onClick={() => setDropdown(null)}><span>{item.label}</span><small>{item.detail}</small></Link>)}</div>}</div>
      <Link href="/developers">Developers</Link><Link href="/open-source">Open source</Link><Link href="/about">About</Link>
    </nav>
    <div className="header-actions"><a className="text-link desktop-only" href="https://github.com/glyphq" target="_blank" rel="noreferrer">GitHub ↗</a><Link className="button button-small desktop-only" href="/download">Get Wallet</Link><button className="menu-button" onClick={() => setOpen(true)} aria-expanded={open} aria-controls="mobile-menu">Menu</button></div>
  </div>{open && <div className="menu-backdrop" onMouseDown={() => setOpen(false)}><div ref={panel} id="mobile-menu" className="mobile-menu" role="dialog" aria-modal="true" aria-label="Navigation" onMouseDown={(event) => event.stopPropagation()}><div className="menu-head"><span>Navigate</span><button onClick={() => setOpen(false)}>Close</button></div><nav aria-label="Mobile"><Link href="/" onClick={() => setOpen(false)}>Home</Link>{products.map((product) => <Link key={product.id} href={`/${product.id}`} onClick={() => setOpen(false)}>{product.name}<span>{product.status}</span></Link>)}{ecosystemLinks.map((item) => <Link key={item.href} href={item.href} onClick={() => setOpen(false)}>{item.label}</Link>)}<Link href="/open-source" onClick={() => setOpen(false)}>Open source</Link><Link href="/about" onClick={() => setOpen(false)}>About</Link></nav></div></div>}</header>;
}
