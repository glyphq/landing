"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

export function PageTransition() {
  const router = useRouter();
  const pathname = usePathname();
  const transitioning = useRef(false);

  useEffect(() => {
    const main = document.querySelector("main");
    if (!main || !transitioning.current) return;
    main.classList.remove("route-leaving");
    main.classList.add("route-entering");
    const frame = requestAnimationFrame(() => main.classList.remove("route-entering"));
    const timer = window.setTimeout(() => { transitioning.current = false; }, 260);
    return () => { cancelAnimationFrame(frame); window.clearTimeout(timer); };
  }, [pathname]);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      const anchor = (event.target as Element).closest<HTMLAnchorElement>("a[href]");
      if (!anchor || anchor.target || anchor.hasAttribute("download")) return;
      const url = new URL(anchor.href, window.location.href);
      if (url.origin !== window.location.origin || url.pathname === window.location.pathname) return;
      const main = document.querySelector("main");
      if (!main || transitioning.current) return;
      event.preventDefault();
      transitioning.current = true;
      main.classList.add("route-leaving");
      window.setTimeout(() => router.push(`${url.pathname}${url.search}${url.hash}`), 170);
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [router]);

  return null;
}
