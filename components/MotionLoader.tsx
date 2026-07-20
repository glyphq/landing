"use client";

import dynamic from "next/dynamic";

const WarmMotion = dynamic(() => import("./WarmMotion").then((module) => module.WarmMotion), { ssr: false });

export function MotionLoader() {
  return <WarmMotion />;
}
