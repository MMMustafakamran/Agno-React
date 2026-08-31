"use client";

import { useAgent, useCopilotKit } from "@copilotkit/react-core/v2";
import { useCallback, useState } from "react";

import { DemoFrame } from "@/components/demo-frame";

/**
 * A chat interface with no CopilotKit chrome at all.
 *
 * Every element here is hand-written. CopilotKit supplies only the message
 * list, the streaming, and tool-call rendering — `useAgent` for state and
 * `useCopilotKit` for the run lifecycle.
 */
export default function Page() {
  // [8] headless UI: access the agent and run lifecycle
  const { agent } = useAgent({ agentId: "default" });
  const { copilotkit } = useCopilotKit();
  const [input, setInput] = useState("");

  // [9] headless UI: send message
  const sendMessage = useCallback(async () => {
    if (!input.trim()) return;

    agent.addMessage({
      id:
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : String(Date.now()),
      role: "user",
      content: input,
    });

    setInput("");

    await copilotkit.runAgent({ agent });
  }, [input, agent, copilotkit]);

  const stopAgent = useCallback(() => {
    copilotkit.stopAgent({ agent });
  }, [agent, copilotkit]);

  return (
    <DemoFrame
      parentPath="/custom-look-and-feel/headless-ui"
      subtitle="hand-built chat over useAgent + useCopilotKit"
    >
      <div className="mx-auto mt-[4%] flex h-[65%] w-full max-w-3xl flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
        {/* [10] headless UI: render messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {agent.messages.map((msg) => (
            <div
              key={msg.id}
              className={
                msg.role === "user"
                  ? "ml-auto bg-blue-100 dark:bg-blue-950 text-slate-900 dark:text-slate-100 rounded-lg p-3 max-w-md shadow-sm"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-lg p-3 max-w-md shadow-sm border border-slate-200 dark:border-slate-700"
              }
            >
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1">
                {msg.role}
              </p>
              <p className="whitespace-pre-wrap text-sm">
                {typeof msg.content === "string"
                  ? msg.content
                  : Array.isArray(msg.content)
                  ? (msg.content as any[])
                      .map((c) => (typeof c === "string" ? c : c.text || ""))
                      .join("")
                  : JSON.stringify(msg.content)}
              </p>
            </div>
          ))}
          {agent.isRunning && (
            <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400 text-sm">
              <span className="animate-pulse">Thinking...</span>
              <button
                type="button"
                onClick={stopAgent}
                className="text-red-500 hover:text-red-600 text-xs font-medium cursor-pointer"
              >
                Stop
              </button>
            </div>
          )}
        </div>
        <form
          className="border-t border-slate-200 dark:border-slate-800 p-4 flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            void sendMessage();
          }}
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
          <button
            type="submit"
            disabled={agent.isRunning || !input.trim()}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg px-4 py-2 transition-colors cursor-pointer"
          >
            Send
          </button>
        </form>
      </div>
    </DemoFrame>
  );
}
