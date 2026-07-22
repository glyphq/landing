"use client";

import { QubicProvider, WalletProvider } from "@qubic.org/react";
import { createLiveClient } from "@qubic.org/rpc";
import type { ReactNode } from "react";
import { connectors } from "@/lib/connectors";

const liveClient = createLiveClient();

export function SupportWalletProvider({ children }: { children: ReactNode }) {
  return (
    <QubicProvider liveClient={liveClient}>
      <WalletProvider connectors={connectors} storageKey="glyph-support-connector">
        {children}
      </WalletProvider>
    </QubicProvider>
  );
}
