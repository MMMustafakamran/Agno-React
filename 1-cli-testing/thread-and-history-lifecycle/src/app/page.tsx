"use client";

import { CopilotChatConfigurationProvider, CopilotChat } from "@copilotkit/react-core/v2";
import "@copilotkit/react-core/v2/styles.css";

// DOC TEST: rich-threads-thread-and-history-lifecycle.md — START
import { useCopilotChatConfiguration } from "@copilotkit/react-core/v2";

function ThreadControls() {
  const config = useCopilotChatConfiguration();
  const existingId = "9dd4623e-8c84-4fbb-b38b-a1632aca5010"; // [!code highlight]

  return (
    <>
      {/* Restore a known conversation (explicit → replays history) */}
      <button
        onClick={() =>
          config?.setActiveThreadId(existingId, { explicit: true })
        }
      >
        Open conversation
      </button>

      {/* Start a fresh, empty conversation (mints a new non-explicit id) */}
      <button onClick={() => config?.startNewThread()}>New chat</button>
    </>
  );
}
// DOC TEST: rich-threads-thread-and-history-lifecycle.md — END

export default function Page() {
  return (
    <CopilotChatConfigurationProvider agentId="default">
      <div style={{ display: "flex", flexDirection: "column", height: "100dvh" }}>
        <div>
          <ThreadControls />
        </div>
        <div style={{ flex: 1 }}>
          <CopilotChat agentId="default" />
        </div>
      </div>
    </CopilotChatConfigurationProvider>
  );
}
