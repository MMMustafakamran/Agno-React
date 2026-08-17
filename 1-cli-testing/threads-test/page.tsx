"use client";

import React, { useState } from "react";
import {
  CopilotChat,
  CopilotThreadsDrawer,
  CopilotChatConfigurationProvider,
  useThreads,
  useAgent,
  useCopilotChatConfiguration,
} from "@copilotkit/react-core/v2";

const AGENT_ID = "default";

/**
 * Unified Test Suite for Rich Threads Documentation:
 * 1. rich-threads-headless-threads.md
 * 2. rich-threads-thread-and-history-lifecycle.md
 * 3. rich-threads-threads-drawer.md
 */
export default function ThreadsTestSuite() {
  const [activeTab, setActiveTab] = useState<"headless" | "lifecycle" | "drawer">("headless");

  return (
    <div className="flex flex-col h-screen w-full bg-white text-zinc-900 font-sans">
      {/* Top Test Navigation Bar */}
      <nav className="flex items-center gap-2 px-4 py-2.5 border-b bg-zinc-50 shrink-0">
        <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 mr-2">
          Threads Tests:
        </span>
        <button
          onClick={() => setActiveTab("headless")}
          className={`px-3 py-1 text-xs font-semibold rounded border transition-colors ${
            activeTab === "headless"
              ? "bg-indigo-600 text-white border-indigo-600 shadow-xs"
              : "bg-white text-zinc-700 border-zinc-300 hover:bg-zinc-100"
          }`}
        >
          1. Headless Threads
        </button>
        <button
          onClick={() => setActiveTab("lifecycle")}
          className={`px-3 py-1 text-xs font-semibold rounded border transition-colors ${
            activeTab === "lifecycle"
              ? "bg-indigo-600 text-white border-indigo-600 shadow-xs"
              : "bg-white text-zinc-700 border-zinc-300 hover:bg-zinc-100"
          }`}
        >
          2. Thread Lifecycle
        </button>
        <button
          onClick={() => setActiveTab("drawer")}
          className={`px-3 py-1 text-xs font-semibold rounded border transition-colors ${
            activeTab === "drawer"
              ? "bg-indigo-600 text-white border-indigo-600 shadow-xs"
              : "bg-white text-zinc-700 border-zinc-300 hover:bg-zinc-100"
          }`}
        >
          3. Threads Drawer
        </button>
      </nav>

      {/* Main Testing View */}
      <main className="flex-1 min-h-0 overflow-hidden">
        {activeTab === "headless" && <HeadlessThreadsDemo />}
        {activeTab === "lifecycle" && <ThreadLifecycleDemo />}
        {activeTab === "drawer" && <ThreadsDrawerDemo />}
      </main>
    </div>
  );
}

// ============================================================================
// 1. Headless Threads
// Doc: rich-threads-headless-threads.md
// ============================================================================
function HeadlessThreadsDemo() {
  const [activeThreadId, setActiveThreadId] = useState<string | undefined>();
  const [includeArchived, setIncludeArchived] = useState(false);

  // [doc: rich-threads-headless-threads.md # Step 2: List and manage threads with useThreads]
  // [doc: rich-threads-headless-threads.md # Step 4: Add pagination for large thread lists]
  const {
    threads,
    isLoading,
    renameThread,
    archiveThread,
    unarchiveThread,
    deleteThread,
    hasMoreThreads,
    isFetchingMoreThreads,
    fetchMoreThreads,
  } = useThreads({
    agentId: AGENT_ID,
    limit: 20, // limit: 20 enables cursor pagination
    includeArchived,
  });

  return (
    <div className="flex h-full">
      {/* Hand-rolled Thread Sidebar */}
      <div className="w-80 border-r p-3 flex flex-col h-full bg-zinc-50 overflow-y-auto shrink-0">
        <div className="flex items-center justify-between pb-2 border-b mb-2">
          <span className="font-semibold text-xs text-zinc-700">
            useThreads ({threads.length})
          </span>
          <label className="flex items-center gap-1.5 text-xs text-zinc-600 cursor-pointer">
            <input
              type="checkbox"
              checked={includeArchived}
              onChange={(e) => setIncludeArchived(e.target.checked)}
            />
            Show Archived
          </label>
        </div>

        {isLoading ? (
          <div className="text-xs text-zinc-500 py-4">Loading threads...</div>
        ) : threads.length === 0 ? (
          <div className="text-xs text-zinc-400 py-6 text-center border border-dashed rounded p-3">
            No threads returned (expected without Enterprise Intelligence license)
          </div>
        ) : (
          <div className="space-y-2 flex-1">
            {threads.map((thread) => (
              <div
                key={thread.id}
                onClick={() => setActiveThreadId(thread.id)}
                className={`p-2.5 rounded border text-xs cursor-pointer transition-colors ${
                  activeThreadId === thread.id
                    ? "bg-indigo-50 border-indigo-500"
                    : "bg-white border-zinc-200 hover:border-zinc-300"
                }`}
              >
                <div className="flex items-center justify-between gap-1">
                  <span className="font-semibold text-zinc-900 truncate">
                    {thread.name ?? "New conversation"}
                  </span>
                  {thread.archived && (
                    <span className="text-[10px] bg-amber-100 text-amber-800 px-1 py-0.2 rounded font-medium">
                      archived
                    </span>
                  )}
                </div>
                <div className="font-mono text-[10px] text-zinc-400 truncate mt-0.5">
                  {thread.id}
                </div>

                {/* [doc: rich-threads-headless-threads.md # Step 2: rename, archive, delete mutations] */}
                <div className="flex gap-3 mt-2 pt-1.5 border-t border-zinc-100 text-[11px]">
                  <button
                    className="text-indigo-600 hover:underline"
                    onClick={(e) => {
                      e.stopPropagation();
                      const name = window.prompt("Rename thread to:", thread.name ?? "");
                      if (name) void renameThread(thread.id, name);
                    }}
                  >
                    Rename
                  </button>
                  <button
                    className="text-amber-600 hover:underline"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (thread.archived) void unarchiveThread(thread.id);
                      else void archiveThread(thread.id);
                    }}
                  >
                    {thread.archived ? "Unarchive" : "Archive"}
                  </button>
                  <button
                    className="text-red-600 hover:underline"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (window.confirm("Permanently delete this thread?")) {
                        void deleteThread(thread.id);
                        if (activeThreadId === thread.id) setActiveThreadId(undefined);
                      }
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* [doc: rich-threads-headless-threads.md # Step 4: Pagination load more] */}
        {hasMoreThreads && (
          <button
            onClick={() => void fetchMoreThreads()}
            disabled={isFetchingMoreThreads}
            className="mt-2 w-full py-1.5 text-xs border rounded bg-white text-zinc-700 hover:bg-zinc-100 disabled:opacity-50"
          >
            {isFetchingMoreThreads ? "Loading..." : "Load more"}
          </button>
        )}
      </div>

      {/* [doc: rich-threads-headless-threads.md # Step 3: Switch between threads -> CopilotChat threadId] */}
      <div className="flex-1 flex flex-col h-full min-w-0">
        <div className="px-4 py-2 border-b bg-white text-xs text-zinc-600 flex items-center justify-between shrink-0">
          <span>
            Active threadId:{" "}
            <code className="font-mono text-indigo-600 font-semibold">
              {activeThreadId ?? "none (default conversation)"}
            </code>
          </span>
          {activeThreadId && (
            <button
              onClick={() => setActiveThreadId(undefined)}
              className="text-zinc-500 underline text-xs hover:text-zinc-800"
            >
              Clear selection
            </button>
          )}
        </div>
        <div className="flex-1 min-h-0">
          <CopilotChat key={activeThreadId ?? "default"} threadId={activeThreadId} />
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// 2. Thread & History Lifecycle
// Doc: rich-threads-thread-and-history-lifecycle.md
// ============================================================================
function ThreadLifecycleDemo() {
  return (
    <CopilotChatConfigurationProvider agentId={AGENT_ID}>
      <ThreadLifecycleContent />
    </CopilotChatConfigurationProvider>
  );
}

function ThreadLifecycleContent() {
  // [doc: rich-threads-thread-and-history-lifecycle.md # Manual hydration -> useAgent]
  const { agent } = useAgent({ agentId: AGENT_ID });
  // [doc: rich-threads-thread-and-history-lifecycle.md # Switching threads and starting new ones]
  const config = useCopilotChatConfiguration();

  // [doc: rich-threads-thread-and-history-lifecycle.md # How the threadId is created -> Explicit threadId prop]
  const [explicitId, setExplicitId] = useState<string | undefined>();
  const [remountKey, setRemountKey] = useState(0);

  const handleMintAndPin = () => {
    const id = typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `thread-${Date.now()}`;
    setExplicitId(id);
  };

  const handleClearExplicit = () => {
    setExplicitId(undefined);
  };

  const handleRemount = () => {
    // Changing key triggers remount to verify ID stability (auto-mint re-mints, explicit survives)
    setRemountKey((k) => k + 1);
  };

  const handleAddDirectMessage = () => {
    // [doc: rich-threads-thread-and-history-lifecycle.md # Manual hydration -> agent.addMessage]
    const msgId = typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `msg-${Date.now()}`;
    agent.addMessage({
      id: msgId,
      role: "user",
      content: `Direct message added at ${new Date().toLocaleTimeString()}`,
    });
  };

  return (
    <div className="flex flex-col h-full">
      {/* Lifecycle Diagnostics Bar */}
      <div className="p-3 border-b bg-zinc-50 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
        <div className="flex flex-wrap items-center gap-4">
          <div>
            <span className="text-zinc-500">Agent threadId:</span>{" "}
            <code className="font-mono font-semibold text-indigo-600 bg-white px-1.5 py-0.5 rounded border">
              {agent.threadId ?? "— (auto-minted on first send)"}
            </code>
          </div>
          <div>
            <span className="text-zinc-500">Explicit threadId Prop:</span>{" "}
            <code className="font-mono text-zinc-800 bg-white px-1.5 py-0.5 rounded border">
              {explicitId ?? "none (auto-mint)"}
            </code>
          </div>
          <div>
            <span className="text-zinc-500">Remount Count:</span>{" "}
            <span className="font-bold text-zinc-800">{remountKey}</span>
          </div>
          <div>
            <span className="text-zinc-500">Messages:</span>{" "}
            <span className="font-bold text-zinc-800">{agent.messages?.length ?? 0}</span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* [doc: rich-threads-thread-and-history-lifecycle.md # How the threadId is created -> Explicit threadId] */}
          <button
            onClick={handleMintAndPin}
            className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded font-medium text-xs"
            title="Sets authoritative explicit threadId prop on CopilotChat"
          >
            Mint & Pin Explicit ID
          </button>
          <button
            onClick={handleClearExplicit}
            className="px-2.5 py-1 bg-white border border-zinc-300 hover:bg-zinc-100 rounded text-zinc-700 text-xs"
            title="Clears explicit prop to restore fallback auto-minting"
          >
            Clear ID
          </button>
          <button
            onClick={handleRemount}
            className="px-2.5 py-1 bg-white border border-amber-300 hover:bg-amber-50 rounded text-amber-800 text-xs font-medium"
            title="Auto-minted IDs re-mint on remount; explicit IDs survive."
          >
            Remount Chat
          </button>
          {/* [doc: rich-threads-thread-and-history-lifecycle.md # Switching threads and starting new ones -> config?.startNewThread()] */}
          <button
            onClick={() => config?.startNewThread()}
            className="px-2.5 py-1 bg-white border border-zinc-300 hover:bg-zinc-100 rounded text-zinc-700 text-xs"
            title="Resets to a freshly minted, non-explicit id"
          >
            startNewThread()
          </button>
          {/* [doc: rich-threads-thread-and-history-lifecycle.md # Manual hydration -> agent.addMessage] */}
          <button
            onClick={handleAddDirectMessage}
            className="px-2.5 py-1 bg-white border border-zinc-300 hover:bg-zinc-100 rounded text-zinc-700 text-xs"
            title="Demonstrates agent.addMessage() hydration"
          >
            + Add Message
          </button>
        </div>
      </div>

      {/* [doc: rich-threads-thread-and-history-lifecycle.md # How history is restored -> CopilotChat threadId] */}
      <div className="flex-1 min-h-0">
        <CopilotChat key={`${remountKey}-${explicitId}`} threadId={explicitId} />
      </div>
    </div>
  );
}

// ============================================================================
// 3. Threads Drawer
// Doc: rich-threads-threads-drawer.md
// ============================================================================
function ThreadsDrawerDemo() {
  // [doc: rich-threads-threads-drawer.md # Set up the Threads Drawer -> Provider + Drawer + Chat]
  return (
    <CopilotChatConfigurationProvider agentId={AGENT_ID}>
      <div style={{ display: "flex", height: "100%" }}>
        {/* Prebuilt Threads Drawer */}
        <CopilotThreadsDrawer agentId={AGENT_ID} />

        {/* CopilotChat driven automatically by shared configuration */}
        <div style={{ flex: 1, minWidth: 0, height: "100%" }}>
          <CopilotChat />
        </div>
      </div>
    </CopilotChatConfigurationProvider>
  );
}
