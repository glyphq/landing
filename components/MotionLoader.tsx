"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const WarmMotion = dynamic(() => import("./WarmMotion").then((module) => module.WarmMotion), { ssr: false });

export function MotionLoader() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const schedule = window.requestIdleCallback ?? ((callback: IdleRequestCallback) => window.setTimeout(callback, 1200));
    const cancel = window.cancelIdleCallback ?? window.clearTimeout;
    const id = schedule(() => setReady(true));
    return () => cancel(id);
  }, []);

  return ready ? <WarmMotion /> : null;
}
