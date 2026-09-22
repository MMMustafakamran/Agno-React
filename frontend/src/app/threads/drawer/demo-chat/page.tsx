"use client";

import {
  CopilotChat,
  CopilotChatConfigurationProvider,
  CopilotSidebar,
  CopilotThreadsDrawer,
} from "@copilotkit/react-core/v2";
import { useState } from "react";

import { DemoFrame } from "@/components/demo-frame";

/**
 * The prebuilt drawer beside a chat, in the two hosts the doc page publishes.
 *
 * Both sit inside one `CopilotChatConfigurationProvider` — that shared
 * configuration is what lets the drawer drive the chat with no active-thread
 * state of your own. The drawer resolves its entitlement through the Runtime,
 * not a provider prop: when the Runtime reports no active entitlement it
 * renders a locked view with an Upgrade link in place of the list and issues no
 * thread requests, which is the expected unlicensed result.
 *
 * Both snippets open with `<CopilotKitProvider runtimeUrl="/api/copilotkit">`.
 * This app mounts exactly that provider once at the root
 * (`frontend/src/components/providers.tsx`), so the demo starts one level in.
 * The sidebar snippet's `height: "100dvh"` is `100%` here, because the demo
 * lives under this app's demo bar rather than filling the viewport.
 */

type Host = "chat" | "sidebar";

const HOSTS: { id: Host; label: string; blurb: string }[] = [
  {
    id: "chat",
    label: "CopilotChat",
    blurb: "CopilotThreadsDrawer + CopilotChat, zero wiring",
  },
  {
    id: "sidebar",
    label: "CopilotSidebar",
    blurb: "Use the Drawer with a sidebar chat",
  },
];

/**
 * NOT FROM THE PAGE. The sidebar snippet renders `<YourMainContent />` and
 * never defines it; this stands in so the published tree can mount.
 */
function YourMainContent() {
  return (
    <div className="p-6 text-sm text-slate-600 dark:text-slate-400">
      Main content. The sidebar chat on the right shares the drawer&apos;s chat
      configuration.
    </div>
  );
}

export default function Page() {
  const [host, setHost] = useState<Host>("chat");
  const active = HOSTS.find((h) => h.id === host)!;

  return (
    <DemoFrame parentPath="/threads/drawer" subtitle={active.blurb}>
      <div className="flex h-full flex-col">
        <div className="flex shrink-0 flex-wrap gap-2 border-b border-slate-200 p-3 dark:border-slate-800">
          {HOSTS.map((h) => (
            <button
              key={h.id}
              type="button"
              data-testid={`drawer-host-${h.id}`}
              onClick={() => setHost(h.id)}
              className={`rounded-md border px-3 py-1.5 text-sm font-medium transition-colors ${
                host === h.id
                  ? "border-[var(--accent)] text-[var(--accent)]"
                  : "border-slate-300 text-slate-600 hover:border-slate-400 dark:border-slate-600 dark:text-slate-300"
              }`}
            >
              {h.label}
            </button>
          ))}
        </div>

        {/* Remounted per host so the drawer re-registers with a fresh
            configuration instead of inheriting the previous one's state. */}
        <div className="min-h-0 flex-1" key={host}>
          {host === "chat" ? (
            <CopilotChatConfigurationProvider>
              <div className="flex h-full">
                <CopilotThreadsDrawer />
                <div className="min-w-0 flex-1">
                  <CopilotChat />
                </div>
              </div>
            </CopilotChatConfigurationProvider>
          ) : (
            <CopilotChatConfigurationProvider>
              <div style={{ display: "flex", height: "100%" }}>
                <CopilotThreadsDrawer />
                <main style={{ flex: 1 }}>
                  <YourMainContent />
                  <CopilotSidebar defaultOpen={true} />
                </main>
              </div>
            </CopilotChatConfigurationProvider>
          )}
        </div>
      </div>
    </DemoFrame>
  );
}
