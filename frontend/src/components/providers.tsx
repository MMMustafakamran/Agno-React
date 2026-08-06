"use client";

import { CopilotKitProvider } from "@copilotkit/react-core/v2";
import type { ReactNode } from "react";

import { GlobalFrontendTools } from "./global-frontend-tools";
import { HarnessStateProvider, useHarnessState } from "./harness-state";

/**
 * One provider for the whole app, per the app-shell requirement: chat state
 * should survive navigation between test routes. Pages that need an isolated
 * conversation ask for one with a `threadId`, not a second provider.
 *
 * `CopilotKitProvider` rather than `CopilotKit`: both exist in v2 and take the
 * same runtimeUrl/publicLicenseKey, but their `onError` signatures differ.
 * `CopilotKit` hands back the legacy `CopilotErrorEvent` ({type, timestamp,
 * context, error}), while `CopilotKitProvider` gives the {error, code, context}
 * shape the Error Debugging doc actually documents. The error log route needs
 * `code`, so this is the one that matches the docs. See the README's
 * doc-vs-implementation notes.
 */

const RUNTIME_URL = "/api/copilotkit";

// Optional. Threads are a licensed feature; without a key the app still runs
// and those routes render their locked state.
const LICENSE_KEY = process.env.NEXT_PUBLIC_COPILOTKIT_LICENSE_KEY;

function CopilotProviders({ children }: { children: ReactNode }) {
  const { logError } = useHarnessState();

  return (
    <CopilotKitProvider
      runtimeUrl={RUNTIME_URL}
      {...(LICENSE_KEY ? { publicLicenseKey: LICENSE_KEY } : {})}
      // Mounts the inspector, with its core wired up, on localhost only.
      // Required here: `CopilotKitProvider` defaults `showDevConsole` to false,
      // so the inspector is off unless asked for. (`<CopilotKit>` is the one
      // that takes `enableInspector` and defaults to on-for-localhost — the
      // prop the Inspector doc describes. Picking the provider for its error
      // handler means opting back in here.) Never render it by hand: the
      // component takes a `core` prop and passes `core ?? null`, so a bare
      // <CopilotKitInspector /> reports "CopilotKit core not attached".
      showDevConsole="auto"
      // Feeds the live log on /troubleshooting/error-debugging: every runtime,
      // agent, and tool failure in the app lands there.
      onError={(event) => {
        logError({
          code: event.code ?? "unknown",
          message: event.error?.message ?? String(event.error ?? "Unknown error"),
          context: event.context,
        });
        console.error(`[CopilotKit ${event.code}]`, event.error);
      }}
    >
      <GlobalFrontendTools />
      {children}
    </CopilotKitProvider>
  );
}

export function Providers({ children }: { children: ReactNode }) {
  return (
    <HarnessStateProvider>
      <CopilotProviders>{children}</CopilotProviders>
    </HarnessStateProvider>
  );
}
