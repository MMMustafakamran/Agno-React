"use client";

import { useAgent, useCopilotKit } from "@copilotkit/react-core/v2";
import { randomUUID } from "@copilotkit/shared";
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
  const { agent } = useAgent();
  const { copilotkit } = useCopilotKit();
  const [input, setInput] = useState("");
  const sendMessage = useCallback(async () => {
    if (!input.trim()) return;
    agent.addMessage({
      id: randomUUID(),
      role: "user",
      content: input,
    });
    setInput("");
    await copilotkit.runAgent({ agent });
  }, [input, agent, copilotkit]);

  return (
    <DemoFrame
      parentPath="/custom-look-and-feel/headless-ui"
      subtitle="hand-built chat over useAgent + useCopilotKit"
    >
      <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-4 text-black">
        {agent.messages.map((msg) => (
          <div
            key={msg.id}
            className={
              msg.role === "user"
                ? "ml-auto bg-blue-100 rounded-lg p-3 max-w-md"
                : "bg-gray-100 rounded-lg p-3 max-w-md"
            }
          >
            <p>{!msg.content}</p>
          </div>
        ))}
        {agent.isRunning && <div className="text-gray-400">Thinking...</div>}
      </div>
      <form
        className="border-t p-4 flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          sendMessage();
        }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 border rounded-lg px-3 py-2"
        />
        <button type="submit" disabled={agent.isRunning}>
          Send
        </button>
      </form>
    </div>
    </DemoFrame>
  );
}
