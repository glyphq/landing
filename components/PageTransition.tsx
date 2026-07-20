"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

const loadGsap = () => import("gsap").then((module) => module.default);

export function PageTransition() {
  const router = useRouter();
  const pathname = usePathname();
  const overlay = useRef<HTMLDivElement>(null);
  const transitioning = useRef(false);

  useEffect(() => {
    const element = overlay.current;
    if (!element || !transitioning.current) return;
    const panels = element.querySelectorAll("span");
    void loadGsap().then((gsap) => {
      gsap.timeline({
        onComplete: () => {
          transitioning.current = false;
          element.style.pointerEvents = "none";
          gsap.set(panels, { xPercent: -112 });
        },
      }).to(panels, { xPercent: 112, duration: 0.72, stagger: 0.055, ease: "power4.inOut" });
    });
  }, [pathname]);

  useEffect(() => {
    const onClick = async (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      const anchor = (event.target as Element).closest<HTMLAnchorElement>("a[href]");
      if (!anchor || anchor.target || anchor.hasAttribute("download")) return;
      const url = new URL(anchor.href, window.location.href);
      if (url.origin !== window.location.origin || url.pathname === window.location.pathname) return;

      const element = overlay.current;
      if (!element || transitioning.current) return;
      event.preventDefault();
      transitioning.current = true;
      element.style.pointerEvents = "auto";
      const panels = element.querySelectorAll("span");
      const gsap = await loadGsap();
      gsap.set(panels, { xPercent: -112 });
      gsap.to(panels, {
        xPercent: 0,
        duration: 0.62,
        stagger: 0.055,
        ease: "power4.inOut",
        onComplete: () => router.push(`${url.pathname}${url.search}${url.hash}`),
      });
    };

    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [router]);

  return <div ref={overlay} className="page-transition" aria-hidden="true"><span /><span /><span /></div>;
}
