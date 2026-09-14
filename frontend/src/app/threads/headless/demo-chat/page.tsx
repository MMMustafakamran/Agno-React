"use client";

import { CopilotChat, useAgent, useThreads } from "@copilotkit/react-core/v2";
import { useEffect, useReducer, useState } from "react";

import { DemoFrame } from "@/components/demo-frame";

/**
 * [19] headless threads: driving one agent per thread.
 *
 * The published snippet, verbatim:
 *
 *   const { agent } = useAgent({
 *     agentId: `chat-${threadId}`, // local id, unique per mounted thread
 *     runtimeAgentId: "default",   // the one runtime agent they all route to
 *     threadId,                    // the thread this instance is pinned to
 *   });
 *
 * Two of these mount at once, which is the claim the section makes: a private
 * proxied agent per hook, and `agent.runAgent()` addressing that hook's thread.
 */
function ThreadAgentTab({ threadId, label }: { threadId: string; label: string }) {
  // [!code highlight]
  const { agent, isReady } = useAgent({
    agentId: `chat-${threadId}`, // local id, unique per mounted thread
    runtimeAgentId: "default", // the one runtime agent they all route to
    threadId, // the thread this instance is pinned to
  });

  const [isRunning, setIsRunning] = useState(false);
  const [, repaint] = useReducer((n: number) => n + 1, 0);

  // Harness-side, not from the doc: the hook owns re-rendering for its own
  // consumers, but this panel reads `agent.messages` directly, so it subscribes
  // to repaint as the reply streams in.
  useEffect(() => {
    const subscription = agent.subscribe({ onMessagesChanged: () => repaint() });
    return () => subscription.unsubscribe();
  }, [agent]);

  const lastAssistant = [...agent.messages]
    .reverse()
    .find((message) => message.role === "assistant");

  return (
    <div className="min-w-0 flex-1 border-l border-slate-200 p-3 first:border-l-0 dark:border-slate-800">
      <div className="flex items-center justify-between gap-2">
        <p className="truncate text-xs font-medium text-slate-700 dark:text-slate-300">
          {label}
        </p>
        <button
          type="button"
          data-testid="thread-agent-run"
          disabled={!isReady || isRunning}
          onClick={async () => {
            setIsRunning(true);
            try {
              agent.addMessage({
                id: crypto.randomUUID(),
                role: "user",
                content: "In one short line, what thread am I in?",
              });
              await agent.runAgent();
            } finally {
              setIsRunning(false);
            }
          }}
          className="shrink-0 rounded-md border border-slate-300 px-2 py-1 text-[11px] font-medium hover:border-slate-400 disabled:opacity-40 dark:border-slate-600"
        >
          {isRunning ? "Running…" : "Run this thread"}
        </button>
      </div>

      <p className="mt-0.5 truncate text-[10px] text-slate-400">
        agentId chat-{threadId.slice(0, 8)} → runtime default ·{" "}
        {agent.messages.length} message(s)
      </p>

      <p
        data-testid="thread-agent-reply"
        className="mt-2 line-clamp-3 text-[11px] text-slate-600 dark:text-slate-400"
      >
        {typeof lastAssistant?.content === "string"
          ? lastAssistant.content
          : "No reply on this thread yet."}
      </p>
    </div>
  );
}

/** The two most recent threads, each mounted against its own pinned agent. */
function PerThreadAgents({
  threads,
}: {
  threads: { id: string; name?: string | null }[];
}) {
  const mounted = threads.slice(0, 2);

  return (
    <div
      data-testid="per-thread-agents"
      className="shrink-0 border-t border-slate-200 dark:border-slate-800"
    >
      <p className="border-b border-slate-100 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:border-slate-800/60">
        One agent per thread
      </p>

      {mounted.length === 0 ? (
        <p className="p-3 text-[11px] text-slate-500">
          Send a message first — these panels mount against real threads.
        </p>
      ) : (
        <div className="flex">
          {mounted.map((thread) => (
            <ThreadAgentTab
              key={thread.id}
              threadId={thread.id}
              label={thread.name ?? "New conversation"}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * A thread list built by hand on `useThreads`, including rename — the one
 * action the prebuilt drawer does not surface.
 *
 * Selecting a thread just passes its id to the chat: `threadId` changing makes
 * the chat drop its messages, load that thread's history, and reconnect to any
 * run still in progress.
 */
export default function Page() {
  const [includeArchived, setIncludeArchived] = useState(false);
  const [activeThreadId, setActiveThreadId] = useState<string | undefined>();
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [draftName, setDraftName] = useState("");

  // [17] headless threads: list and manage threads
  // [!code highlight:10]
  const {
    threads,
    isLoading,
    listError,
    renameThread,
    archiveThread,
    unarchiveThread,
    deleteThread,
    hasMoreThreads,
    isFetchingMoreThreads,
    fetchMoreThreads,
  } = useThreads({ agentId: "default", limit: 20, includeArchived });

  const submitRename = async (id: string) => {
    if (draftName.trim()) await renameThread(id, draftName.trim());
    setRenamingId(null);
    setDraftName("");
  };

  return (
    <DemoFrame
      parentPath="/threads/headless"
      subtitle="useThreads driving custom markup"
    >
      <div className="grid h-full grid-cols-1 lg:grid-cols-[22rem_1fr]">
        <div className="flex min-h-0 flex-col border-b border-slate-200 lg:border-b-0 lg:border-r dark:border-slate-800">
          <div className="flex shrink-0 items-center justify-between gap-2 border-b border-slate-200 px-3 py-2 dark:border-slate-800">
            <p className="text-xs text-slate-500">{threads.length} threads</p>
            <label className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
              <input
                type="checkbox"
                checked={includeArchived}
                onChange={(e) => setIncludeArchived(e.target.checked)}
              />
              Show archived
            </label>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto p-3">
            {listError && (
              <p className="mb-3 rounded border border-amber-300 bg-amber-50 p-2 text-xs text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-100">
                {listError.message}
              </p>
            )}

            {isLoading ? (
              <p className="text-sm text-slate-500">Loading threads…</p>
            ) : threads.length === 0 ? (
              <p className="text-sm text-slate-500">
                No threads returned. Expected when no license key is configured.
              </p>
            ) : (
              <ul className="space-y-2">
                {threads.map((thread) => (
                  <li
                    key={thread.id}
                    className={`rounded-lg border px-3 py-2 ${
                      activeThreadId === thread.id
                        ? "border-[var(--accent)]"
                        : "border-slate-200 dark:border-slate-700"
                    }`}
                  >
                    {renamingId === thread.id ? (
                      <form
                        className="flex gap-2"
                        onSubmit={(e) => {
                          e.preventDefault();
                          void submitRename(thread.id);
                        }}
                      >
                        <input
                          autoFocus
                          value={draftName}
                          onChange={(e) => setDraftName(e.target.value)}
                          className="min-w-0 flex-1 rounded border border-slate-300 px-2 py-1 text-sm dark:border-slate-600 dark:bg-slate-800"
                        />
                        <button
                          type="submit"
                          className="rounded bg-[var(--accent)] px-2 py-1 text-xs font-medium text-white"
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={() => setRenamingId(null)}
                          className="rounded border border-slate-300 px-2 py-1 text-xs dark:border-slate-600"
                        >
                          Cancel
                        </button>
                      </form>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => setActiveThreadId(thread.id)}
                          className="w-full text-left"
                        >
                          <p className="truncate text-sm font-medium text-slate-800 dark:text-slate-100">
                            {thread.name ?? "New conversation"}
                            {thread.archived && (
                              <span className="ml-2 text-xs text-slate-400">
                                archived
                              </span>
                            )}
                          </p>
                          <p className="truncate font-mono text-xs text-slate-500">
                            {thread.id}
                          </p>
                        </button>

                        <div className="mt-2 flex flex-wrap gap-1">
                          <button
                            type="button"
                            onClick={() => {
                              setRenamingId(thread.id);
                              setDraftName(thread.name ?? "");
                            }}
                            className="rounded border border-slate-300 px-2 py-1 text-xs dark:border-slate-600"
                          >
                            Rename
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              void (thread.archived
                                ? unarchiveThread(thread.id)
                                : archiveThread(thread.id))
                            }
                            className="rounded border border-slate-300 px-2 py-1 text-xs dark:border-slate-600"
                          >
                            {thread.archived ? "Unarchive" : "Archive"}
                          </button>
                          <button
                            type="button"
                            onClick={() => void deleteThread(thread.id)}
                            className="rounded border border-rose-300 px-2 py-1 text-xs text-rose-600"
                          >
                            Delete
                          </button>
                        </div>
                      </>
                    )}
                  </li>
                ))}
              </ul>
            )}

            {hasMoreThreads && (
              <button
                type="button"
                onClick={fetchMoreThreads}
                disabled={isFetchingMoreThreads}
                className="mt-3 w-full rounded-md border border-slate-300 px-3 py-1.5 text-sm disabled:opacity-50 dark:border-slate-600"
              >
                {isFetchingMoreThreads ? "Loading…" : "Load more"}
              </button>
            )}
          </div>
        </div>

        <div className="flex min-h-0 flex-col">
          <p className="shrink-0 border-b border-slate-200 px-3 py-2 text-xs text-slate-500 dark:border-slate-800">
            Active thread:{" "}
            <code>{activeThreadId ?? "none — default conversation"}</code>
            {activeThreadId && (
              <button
                type="button"
                onClick={() => setActiveThreadId(undefined)}
                className="ml-2 underline"
              >
                clear
              </button>
            )}
          </p>
          <div className="min-h-0 flex-1">
            {/* [18] headless threads: connect the selected thread to chat */}
            {/* [!code highlight] */}
            <CopilotChat threadId={activeThreadId} />
          </div>

          <PerThreadAgents threads={threads} />
        </div>
      </div>
    </DemoFrame>
  );
}
