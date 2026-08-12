"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { fallbackRelease, fetchLatestRelease, type DownloadRelease } from "@/components/downloads";

export type ReleaseLoadState = "loading" | "ready" | "fallback";

type DownloadReleaseContextValue = {
  release: DownloadRelease;
  state: ReleaseLoadState;
};

const DownloadReleaseContext = createContext<DownloadReleaseContextValue | null>(null);

export function DownloadReleaseProvider({ children }: { children: ReactNode }) {
  const [value, setValue] = useState<DownloadReleaseContextValue>({ release: fallbackRelease, state: "loading" });

  useEffect(() => {
    let active = true;

    void fetchLatestRelease().then((release) => {
      if (!active) return;
      setValue({ release, state: release.source === "fallback" ? "fallback" : "ready" });
    });

    return () => {
      active = false;
    };
  }, []);

  return <DownloadReleaseContext.Provider value={value}>{children}</DownloadReleaseContext.Provider>;
}

export function useDownloadRelease(): DownloadReleaseContextValue {
  const value = useContext(DownloadReleaseContext);
  if (!value) throw new Error("useDownloadRelease must be used inside DownloadReleaseProvider");
  return value;
}
