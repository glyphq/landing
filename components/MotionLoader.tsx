"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const WarmMotion = dynamic(() => import("./WarmMotion").then((module) => module.WarmMotion), { ssr: false });

export function MotionLoader() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setTimeout(() => setReady(true), 2400);
    return () => window.clearTimeout(id);
  }, []);

  return ready ? <WarmMotion /> : null;
}
