"use client";

import {
  CopilotChat,
  CopilotChatConfigurationProvider,
  CopilotThreadsDrawer,
} from "@copilotkit/react-core/v2";

const AGENT_ID = "default";

export default function Page() {
  return (
    <CopilotChatConfigurationProvider agentId={AGENT_ID}>
      <div className="flex h-dvh">
        {/* [1] drawer: shared chat config */}
        <CopilotThreadsDrawer agentId={AGENT_ID} /> {/* [!code highlight] */}
        <main className="min-w-0 flex-1 overflow-hidden">
          {/* [2] drawer: shared provider */}
          <CopilotChat className="h-full w-full" /> {/* [!code highlight] */}
        </main>
      </div>
    </CopilotChatConfigurationProvider>
  );
}
