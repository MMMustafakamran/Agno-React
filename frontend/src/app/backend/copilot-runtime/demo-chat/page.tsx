"use client";

import { CopilotChat } from "@copilotkit/react-core/v2";
import { useEffect, useState } from "react";

import { DemoFrame } from "@/components/demo-frame";

/**
 * Agent routing: two registered ids that resolve to the same Agno process,
 * plus one the runtime never registered.
 *
 * The frontend only ever names an id — it never learns where the agent lives.
 * Each id carries its own message list, so switching starts a fresh
 * conversation.
 *
 * `my_agent` is here because of the page's "Which name identifies an agent"
 * section (2026-09-21): the name the frontend asks for has to equal a key of
 * the runtime's `agents` map, and asking for anything else "resolves no agent,
 * and the frontend raises CopilotKitAgentDiscoveryError". `my_agent` is the
 * page's own example key and is not registered in
 * `api/copilotkit/[[...slug]]/route.ts`, so this button is that claim under
 * test rather than a second working id.
 *
 * The page's provider snippet binds the name once, on the provider:
 *
 *   <CopilotKit runtimeUrl="/api/copilotkit" agent="my_agent" useSingleEndpoint={false}>
 *     <YourApp />
 *   </CopilotKit>
 *
 * This harness has one app-wide provider and switches ids per chat instead, so
 * the id travels as `agentId` on the chat. Same binding, one level down.
 */

const REGISTERED = ["default", "agno_agent"] as const;
const UNREGISTERED = "my_agent" as const;
const AGENT_IDS = [...REGISTERED, UNREGISTERED] as const;
type AgentId = (typeof AGENT_IDS)[number];

/**
 * The page: "To read the registered keys directly, hit `GET {runtimeUrl}/info`.
 * It returns the agents the runtime advertises, under exactly the names the
 * frontend must use."
 */
function RuntimeInfo() {
  const [keys, setKeys] = useState<string[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const response = await fetch("/api/copilotkit/info");
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const body: unknown = await response.json();
        const agents = (body as { agents?: unknown })?.agents;
        const names = Array.isArray(agents)
          ? agents.map((a) => String((a as { name?: unknown })?.name ?? a))
          : agents && typeof agents === "object"
            ? Object.keys(agents as Record<string, unknown>)
            : [];
        if (!cancelled) setKeys(names);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : String(e));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <p data-testid="runtime-info-keys" className="font-mono text-xs text-slate-500">
      GET /api/copilotkit/info →{" "}
      {error ? `failed: ${error}` : keys ? keys.join(" · ") || "(no agents)" : "reading…"}
    </p>
  );
}

export default function Page() {
  const [agentId, setAgentId] = useState<AgentId>("default");

  return (
    <DemoFrame
      parentPath="/backend/copilot-runtime"
      subtitle={`routing to "${agentId}"`}
    >
      <div className="flex h-full flex-col">
        <div className="flex shrink-0 flex-wrap items-center gap-2 border-b border-slate-200 p-3 dark:border-slate-800">
          {AGENT_IDS.map((id) => (
            <button
              key={id}
              type="button"
              data-testid={`runtime-agent-${id}`}
              onClick={() => setAgentId(id)}
              className={`rounded-md border px-3 py-1.5 font-mono text-sm transition-colors ${
                agentId === id
                  ? "border-[var(--accent)] text-[var(--accent)]"
                  : "border-slate-300 text-slate-600 dark:border-slate-600 dark:text-slate-300"
              }`}
            >
              {id}
              {id === UNREGISTERED && " (not registered)"}
            </button>
          ))}
          <p className="text-xs text-slate-500">
            {agentId === "default"
              ? 'Prebuilt components pick "default" up with no agentId prop.'
              : agentId === UNREGISTERED
                ? "Not a key of the runtime's agents map. Expect CopilotKitAgentDiscoveryError."
                : "A non-default id has to be named explicitly, as this chat does."}
          </p>
          <RuntimeInfo />
        </div>

        <div className="min-h-0 flex-1">
          <CopilotChat key={agentId} agentId={agentId} />
        </div>
      </div>
    </DemoFrame>
  );
}
