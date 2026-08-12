"use client";

import Link from "next/link";
import { Download, Moon, Sun2, Widget } from "@solar-icons/react";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { BrandMark } from "@/components/BrandMark";
import { ProductIcon } from "@/components/products/ProductIcon";
import { products } from "@/content/products";

type ThemeMode = "system" | "light" | "dark";

const THEME_STORAGE_KEY = "glyph-theme";
const THEME_CHANGE_EVENT = "glyph-theme-change";
const themeOrder: ThemeMode[] = ["system", "light", "dark"];

function isThemeMode(value: string | null): value is ThemeMode {
  return value === "system" || value === "light" || value === "dark";
}

function nextTheme(theme: ThemeMode) {
  return themeOrder[(themeOrder.indexOf(theme) + 1) % themeOrder.length];
}

function readStoredTheme(): ThemeMode {
  try {
    const saved = window.localStorage.getItem(THEME_STORAGE_KEY);
    return isThemeMode(saved) ? saved : "system";
  } catch {
    return "system";
  }
}

function subscribeToTheme(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener(THEME_CHANGE_EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(THEME_CHANGE_EVENT, onChange);
  };
}

function getServerTheme(): ThemeMode {
  return "system";
}

function applyTheme(theme: ThemeMode) {
  const root = document.documentElement;
  if (theme === "system") root.removeAttribute("data-theme");
  else root.dataset.theme = theme;
}

export function Header() {
  const [open, setOpen] = useState(false);
  const [productsOpen, setProductsOpen] = useState(false);
  const theme = useSyncExternalStore(subscribeToTheme, readStoredTheme, getServerTheme);
  const panel = useRef<HTMLDivElement>(null);
  const header = useRef<HTMLElement>(null);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

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
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
      previous?.focus();
    };
  }, [open]);

  const switchTheme = () => {
    const upcoming = nextTheme(theme);
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, upcoming);
    } catch {
      // The active theme still applies for this session when storage is unavailable.
    }
    window.dispatchEvent(new Event(THEME_CHANGE_EVENT));
  };
  const upcomingTheme = nextTheme(theme);
  const themeLabel = theme === "system" ? "system" : theme;
  const themeIcon = theme === "dark" ? <Moon aria-hidden="true" /> : <Sun2 aria-hidden="true" />;
  const themeButton = (
    <button
      className="theme-toggle"
      type="button"
      onClick={switchTheme}
      aria-label={`Theme is ${themeLabel}. Switch to ${upcomingTheme}.`}
      title={`Theme: ${themeLabel}. Switch to ${upcomingTheme}.`}
    >
      {themeIcon}
      <span className="sr-only">Theme: {themeLabel}. Switch to {upcomingTheme}.</span>
    </button>
  );

  const mobileMenu = open ? createPortal(
    <div className="menu-backdrop" onMouseDown={() => setOpen(false)}>
      <div ref={panel} id="mobile-menu" className="mobile-menu" role="dialog" aria-modal="true" aria-label="Navigation" onMouseDown={(event) => event.stopPropagation()}>
        <div className="menu-head">
          <Link className="wordmark" href="/" onClick={() => setOpen(false)} aria-label="Glyph home"><BrandMark /><span>glyph</span><b>.</b></Link>
          <button type="button" onClick={() => setOpen(false)}>Close</button>
        </div>
        <nav aria-label="Mobile">
          <div className="mobile-menu-group">
            <p>Products</p>
            <Link className="mobile-menu-featured" href="/ecosystem" onClick={() => setOpen(false)}>Ecosystem overview<span>All products</span></Link>
            {products.map((product) => <Link key={product.id} href={`/${product.id}`} onClick={() => setOpen(false)}>{product.name}<span>{product.status}</span></Link>)}
          </div>
          <div className="mobile-menu-group">
            <p>Organization</p>
            <a href="https://docs.glyphq.org" target="_blank" rel="noreferrer" onClick={() => setOpen(false)}>Docs<span>Documentation site</span><span className="sr-only"> (opens in a new tab)</span></a>
            <Link href="/roadmap" onClick={() => setOpen(false)}>Roadmap</Link>
            <Link href="/community" onClick={() => setOpen(false)}>Community</Link>
            <Link href="/open-source" onClick={() => setOpen(false)}>Open source</Link>
            <Link href="/security" onClick={() => setOpen(false)}>Security</Link>
            <Link href="/support" onClick={() => setOpen(false)}>Support Glyph</Link>
            <Link href="/about" onClick={() => setOpen(false)}>About</Link>
          </div>
        </nav>
        <div className="mobile-menu-theme">{themeButton}</div>
      </div>
    </div>,
    document.body,
  ) : null;

  return (
    <header ref={header} className="site-header">
      <div className="header-inner">
        <Link className="wordmark" href="/" aria-label="Glyph home"><BrandMark /><span>glyph</span><b>.</b></Link>
        <nav className="desktop-nav" aria-label="Primary">
          <div className="nav-dropdown">
            <button type="button" onClick={() => setProductsOpen((value) => !value)} aria-expanded={productsOpen} aria-controls="products-menu"><Widget aria-hidden="true" />Products</button>
            {productsOpen && <div id="products-menu" className="nav-popover"><Link className="nav-entry nav-entry-featured" href="/ecosystem" onClick={() => setProductsOpen(false)}><Widget className="nav-entry-icon" aria-hidden="true" /><span>Ecosystem overview</span><small>See how every Glyph product fits together</small></Link>{products.map((product) => <Link className="nav-entry" key={product.id} href={`/${product.id}`} onClick={() => setProductsOpen(false)}><ProductIcon productId={product.id} className="nav-entry-icon" aria-hidden="true" /><span>{product.name}</span><small>{product.status}</small></Link>)}</div>}
          </div>
          <a href="https://docs.glyphq.org" target="_blank" rel="noreferrer">Docs<span className="sr-only"> (opens in a new tab)</span></a>
          <Link href="/open-source">Open source</Link>
          <Link href="/support">Support</Link>
          <Link href="/about">About</Link>
        </nav>
        <div className="header-actions">
          {themeButton}
          <Link className="button button-small desktop-only" href="/download"><Download aria-hidden="true" />Get Wallet</Link>
          <button className="menu-button" type="button" onClick={() => setOpen(true)} aria-expanded={open} aria-controls="mobile-menu">Menu</button>
        </div>
      </div>
      {mobileMenu}
    </header>
  );
}
