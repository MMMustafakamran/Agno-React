"use client";

import { CopilotChat } from "@copilotkit/react-core/v2";
import { useState } from "react";

import { DemoFrame } from "@/components/demo-frame";

/**
 * Agent routing: two registered ids that resolve to the same Agno process.
 *
 * The frontend only ever names an id — it never learns where the agent lives.
 * Each id carries its own message list, so switching starts a fresh
 * conversation.
 */
export default function Page() {
  const [agentId, setAgentId] = useState<"default" | "agno_agent">("default");

  return (
    <DemoFrame
      parentPath="/backend/copilot-runtime"
      subtitle={`routing to "${agentId}"`}
    >
      <div className="flex h-full flex-col">
        <div className="flex shrink-0 flex-wrap items-center gap-2 border-b border-slate-200 p-3 dark:border-slate-800">
          {(["default", "agno_agent"] as const).map((id) => (
            <button
              key={id}
              type="button"
              onClick={() => setAgentId(id)}
              className={`rounded-md border px-3 py-1.5 font-mono text-sm transition-colors ${
                agentId === id
                  ? "border-[var(--accent)] text-[var(--accent)]"
                  : "border-slate-300 text-slate-600 dark:border-slate-600 dark:text-slate-300"
              }`}
            >
              {id}
            </button>
          ))}
          <p className="text-xs text-slate-500">
            {agentId === "default"
              ? 'Prebuilt components pick "default" up with no agentId prop.'
              : "A non-default id has to be named explicitly, as this chat does."}
          </p>
        </div>

        <div className="min-h-0 flex-1">
          <CopilotChat key={agentId} agentId={agentId} />
        </div>
      </div>
    </DemoFrame>
  );
}
