"use client";

import { CopilotChat } from "@copilotkit/react-core/v2";

import { DemoFrame } from "@/components/demo-frame";

/**
 * The minimal case: one chat, the `default` agent, no extra configuration.
 *
 * No `agentId` prop is needed because the runtime registers this agent under
 * the id `default`, which prebuilt components pick up automatically.
 */
export default function Page() {
  return (
    <DemoFrame parentPath="/quickstart" subtitle="CopilotChat, default agent">
      {/* [22] quickstart: mount the prebuilt chat */}
      {/* [!code highlight] */}
      <CopilotChat
        labels={{
          welcomeMessageText:
            "Minimal quickstart chat. Ask me anything to confirm the stack is connected.",
        }}
      />
    </DemoFrame>
  );
}
