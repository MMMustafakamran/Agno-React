"use client";

import { CopilotChat, CopilotKit, CopilotKitProvider } from "@copilotkit/react-core/v2";
import { useState } from "react";

import { DemoFrame } from "@/components/demo-frame";

/**
 * Message history, the two trimming placements a reader can try on this stack.
 *
 * - **Runtime middleware** talks to `/api/copilotkit-trimmed`, where the page's
 *   `TrimHistoryMiddleware(lastTurnOnly)` is attached to the agent. Each run
 *   reaches Agno with the final turn only; the transcript here stays whole.
 * - **Browser messageFilter** is the page's first recipe, verbatim, on the main
 *   runtime. No published `@copilotkit/react-core` declares `messageFilter`
 *   (checked on the installed 1.72.0 and the latest, 1.73.0), so it is a type
 *   error and, at runtime, an ignored prop: the full transcript goes out.
 *
 * On this Agno backend the answers do not tell the tabs apart: its AG-UI
 * endpoint answers from the last user message alone, full transcript or not
 * (observed 2026-09-22; see the route page). What differs is what the runtime
 * forwards.
 *
 * The page's `<YourApp />` is the chat. The page's third recipe,
 * `selfManagedAgents`, is quoted on the route page rather than mounted: its
 * agent URL is the placeholder `https://agents.example.com/support`.
 */

type Placement = "runtime" | "browser";

const TABS: { id: Placement; label: string; blurb: string }[] = [
  {
    id: "runtime",
    label: "Runtime middleware",
    blurb: "TrimHistoryMiddleware(lastTurnOnly) on /api/copilotkit-trimmed",
  },
  {
    id: "browser",
    label: "Browser messageFilter",
    blurb: "messageFilter={(messages) => messages.slice(-1)} on /api/copilotkit",
  },
];

function YourApp() {
  return <CopilotChat />;
}

export default function Page() {
  const [placement, setPlacement] = useState<Placement>("runtime");
  const active = TABS.find((t) => t.id === placement)!;

  return (
    <DemoFrame parentPath="/backend/message-history" subtitle={active.blurb}>
      <div className="flex h-full flex-col">
        <div className="flex shrink-0 flex-wrap gap-2 border-b border-slate-200 p-3 dark:border-slate-800">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              data-testid={`message-history-${tab.id}`}
              onClick={() => setPlacement(tab.id)}
              className={`rounded-md border px-3 py-1.5 text-sm font-medium transition-colors ${
                placement === tab.id
                  ? "border-[var(--accent)] text-[var(--accent)]"
                  : "border-slate-300 text-slate-600 hover:border-slate-400 dark:border-slate-600 dark:text-slate-300"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Remounted per placement so each tab starts its own conversation. */}
        <div className="min-h-0 flex-1" key={placement}>
          {placement === "runtime" ? (
            <CopilotKitProvider runtimeUrl="/api/copilotkit-trimmed">
              <YourApp />
            </CopilotKitProvider>
          ) : (
            // [2] message-history: trim from the browser, as published
            // [!code highlight]
            <CopilotKit
              runtimeUrl="/api/copilotkit"
              // @ts-expect-error `messageFilter` is not a prop on any published
              // release (1.72.0 installed, 1.73.0 latest). If one ships it, this
              // suppression goes unused and the typecheck says so.
              messageFilter={(messages) => messages.slice(-1)}
            >
              <YourApp />
            </CopilotKit>
          )}
        </div>
      </div>
    </DemoFrame>
  );
}
