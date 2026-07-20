"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { products } from "@/content/products";

export function Header() {
  const [open, setOpen] = useState(false);
  const panel = useRef<HTMLDivElement>(null);
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
    document.addEventListener("keydown", onKey); return () => { document.removeEventListener("keydown", onKey); previous?.focus(); };
  }, [open]);
  return <header className="site-header"><div className="header-inner">
    <Link className="wordmark" href="/" aria-label="Glyph home"><span>glyph</span><b>.</b></Link>
    <nav className="desktop-nav" aria-label="Primary"><Link href="/ecosystem">Products</Link><Link href="/developers">Developers</Link><Link href="/ecosystem">Ecosystem</Link><Link href="/open-source">Open source</Link><Link href="/about">About</Link></nav>
    <div className="header-actions"><a className="text-link desktop-only" href="https://github.com/glyphq" target="_blank" rel="noreferrer">GitHub ↗</a><Link className="button button-small desktop-only" href="/download">Get Wallet</Link><button className="menu-button" onClick={() => setOpen(true)} aria-expanded={open} aria-controls="mobile-menu">Menu</button></div>
  </div>{open && <div className="menu-backdrop" onMouseDown={() => setOpen(false)}><div ref={panel} id="mobile-menu" className="mobile-menu" role="dialog" aria-modal="true" aria-label="Navigation" onMouseDown={(e) => e.stopPropagation()}><div className="menu-head"><span>Navigate</span><button onClick={() => setOpen(false)}>Close</button></div><nav aria-label="Mobile"><Link href="/" onClick={() => setOpen(false)}>Home</Link>{products.map(p => <Link key={p.id} href={`/${p.id}`} onClick={() => setOpen(false)}>{p.name}<span>{p.status}</span></Link>)}<Link href="/developers" onClick={() => setOpen(false)}>Developers</Link><Link href="/community" onClick={() => setOpen(false)}>Community</Link><Link href="/about" onClick={() => setOpen(false)}>About</Link></nav></div></div>}</header>;
}

