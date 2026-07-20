"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export function WarmMotion() {
  useGSAP(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    gsap.utils.toArray<HTMLElement>(".section-heading").forEach((heading) => {
      gsap.fromTo(
        heading,
        { y: 18, opacity: 0.78 },
        { y: 0, opacity: 1, ease: "none", scrollTrigger: { trigger: heading, start: "top 88%", end: "top 66%", scrub: true } },
      );
    });

    gsap.utils.toArray<HTMLElement>(".flow > div, .stack-diagram > div").forEach((node, index) => {
      gsap.fromTo(
        node,
        { y: 12, opacity: 0.82 },
        { y: 0, opacity: 1, duration: 0.55, delay: Math.min(index * 0.04, 0.16), ease: "power3.out", scrollTrigger: { trigger: node, start: "top 90%", once: true } },
      );
    });
  });

  return null;
}
