"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { usePathname } from "next/navigation";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export function WarmMotion() {
  const pathname = usePathname();

  useGSAP(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const reveal = (element: HTMLElement, delay = 0) => {
      gsap.fromTo(
        element,
        { y: 20, opacity: 0.68, filter: "blur(3px)" },
        {
          y: 0,
          opacity: 1,
          filter: "blur(0px)",
          duration: 0.58,
          delay,
          ease: "power3.out",
          scrollTrigger: { trigger: element, start: "top 88%", once: true },
        },
      );
    };

    const hero = document.querySelector<HTMLElement>('main [data-reveal="hero"]');
    if (hero) {
      const heroContent = hero.firstElementChild;
      const heroTargets = heroContent?.children.length ? heroContent.children : hero.children;
      gsap.fromTo(heroTargets, { y: 12, opacity: 0.72 }, { y: 0, opacity: 1, duration: 0.52, stagger: 0.06, ease: "power3.out" });
    }

    gsap.utils.toArray<HTMLElement>("main [data-reveal]:not([data-reveal='hero']), main .section-heading").forEach((element) => reveal(element));

    gsap.utils.toArray<HTMLElement>("main [data-reveal-group]").forEach((group) => {
      [...group.children].forEach((child, index) => reveal(child as HTMLElement, Math.min(index * 0.055, 0.22)));
    });

    gsap.utils.toArray<HTMLElement>("main .approval-steps, main .architecture-track").forEach((group) => {
      [...group.children].forEach((child, index) => reveal(child as HTMLElement, Math.min(index * 0.06, 0.18)));
    });

    ScrollTrigger.refresh();
  }, { dependencies: [pathname], revertOnUpdate: true });

  return null;
}
