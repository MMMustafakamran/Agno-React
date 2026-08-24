"use client";

import { CopilotKitProvider } from "@copilotkit/react-core/v2";
import type { ReactNode } from "react";

export function ThreadsProvider({ children }: { children: ReactNode }) {
  return (
    <CopilotKitProvider
      runtimeUrl="/api/copilotkit-threads"
      // Thread routes are dispatched only in multi-route mode, and leaving this
      // on auto-detect races the lazily-compiled API route under `next dev`.
      useSingleEndpoint={false}
      showDevConsole="auto"
      onError={(e) => console.error(`[CopilotKit ${e.code}]`, e.error)}
    >
      {children}
    </CopilotKitProvider>
  );
}
