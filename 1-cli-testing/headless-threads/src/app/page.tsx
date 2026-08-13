"use client";

import {
  CopilotChat,
  CopilotChatConfigurationProvider,
  useThreads, // [!code highlight]
} from "@copilotkit/react-core/v2";
import { useState } from "react";

const AGENT_ID = "default";

function ThreadSidebar({ onSelectThread }: { onSelectThread: (id: string) => void }) {
  // [1] headless threads: data + actions
  const { // [!code highlight]
    threads,
    isLoading,
    renameThread,
    archiveThread,
    deleteThread,
    hasMoreThreads,
    isFetchingMoreThreads,
    fetchMoreThreads,
  } = useThreads({
    agentId: AGENT_ID,
    limit: 20, // [!code highlight]
  });

  if (isLoading) return <div className="p-4">Loading threads...</div>;

  return (
    <aside className="w-80 shrink-0 border-r p-4">
      <h2 className="mb-3 font-semibold">Conversations</h2>
      <div className="space-y-2">
        {threads.map((thread) => (
          <div key={thread.id} className="rounded border p-2">
            <button className="block w-full text-left" onClick={() => onSelectThread(thread.id)}>
              {thread.name ?? "New conversation"}
            </button>
            <div className="mt-2 flex gap-2 text-xs">
              <button onClick={() => renameThread(thread.id, "Renamed")}>Rename</button>
              <button onClick={() => archiveThread(thread.id)}>Archive</button>
              <button onClick={() => deleteThread(thread.id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
      {hasMoreThreads && (
        <button
          className="mt-3 rounded border px-3 py-2"
          onClick={fetchMoreThreads}
          disabled={isFetchingMoreThreads}
        >
          {isFetchingMoreThreads ? "Loading..." : "Load more"}
        </button>
      )}
    </aside>
  );
}

export default function Page() {
  const [activeThreadId, setActiveThreadId] = useState<string | undefined>();

  return (
    <CopilotChatConfigurationProvider agentId={AGENT_ID}>
      <div className="flex h-dvh">
        <ThreadSidebar onSelectThread={setActiveThreadId} />
        <main className="min-w-0 flex-1">
          {/* [2] headless threads: restore history */}
          <CopilotChat threadId={activeThreadId} /> {/* [!code highlight] */}
        </main>
      </div>
    </CopilotChatConfigurationProvider>
  );
}
