"use client";

import { CopilotChat } from "@copilotkit/react-core/v2";

import { DemoFrame } from "@/components/demo-frame";
import { ACCENTS, useHarnessState } from "@/components/harness-state";

/**
 * The effects panel beside the chat that drives it.
 *
 * The tools themselves are registered once at the app root (see
 * `components/global-frontend-tools.tsx`) — this page only renders the state
 * they mutate, so the two halves stay visible side by side.
 */
export default function Page() {
  const { greeting, setGreeting, accent, bookmarks, removeBookmark } =
    useHarnessState();

  return (
    <DemoFrame
      parentPath="/frontend-tools"
      subtitle="tools that execute in this browser tab"
    >
      <div className="grid h-full grid-cols-1 lg:grid-cols-2">
        <div className="min-h-0 space-y-4 overflow-y-auto border-b border-slate-200 p-4 lg:border-b-0 lg:border-r dark:border-slate-800">
          <div className="rounded-lg border border-slate-200 p-4 dark:border-slate-700">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              sayHello
            </p>
            {greeting ? (
              <div className="mt-2 flex items-center justify-between gap-3">
                <p className="text-lg font-medium text-[var(--accent)]">
                  Hello, {greeting}!
                </p>
                <button
                  type="button"
                  onClick={() => setGreeting(null)}
                  className="rounded border border-slate-300 px-2 py-1 text-xs text-slate-600 dark:border-slate-600 dark:text-slate-300"
                >
                  Clear
                </button>
              </div>
            ) : (
              <p className="mt-2 text-sm text-slate-500">No greeting yet.</p>
            )}
          </div>

          <div className="rounded-lg border border-slate-200 p-4 dark:border-slate-700">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              setThemeColor
            </p>
            <div className="mt-2 flex items-center gap-3">
              <span
                className="h-6 w-6 rounded-full border border-slate-300"
                style={{ background: ACCENTS[accent] }}
                aria-hidden
              />
              <p className="text-sm text-slate-700 dark:text-slate-300">
                Current accent: <strong>{accent}</strong>. It drives highlights
                across the whole app, so the change follows you between routes.
              </p>
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 p-4 dark:border-slate-700">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              addBookmark
            </p>
            {bookmarks.length === 0 ? (
              <p className="mt-2 text-sm text-slate-500">No bookmarks yet.</p>
            ) : (
              <ul className="mt-2 space-y-2">
                {bookmarks.map((b) => (
                  <li
                    key={b.id}
                    className="flex items-center justify-between gap-3 rounded border border-slate-200 px-3 py-2 dark:border-slate-700"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-slate-800 dark:text-slate-100">
                        {b.title}
                      </p>
                      <p className="truncate text-xs text-slate-500">{b.url}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeBookmark(b.id)}
                      className="shrink-0 rounded border border-slate-300 px-2 py-1 text-xs text-slate-600 dark:border-slate-600 dark:text-slate-300"
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="min-h-0">
          <CopilotChat
            labels={{
              welcomeMessageText:
                "Ask me to greet someone, change the theme, or bookmark a link.",
            }}
          />
        </div>
      </div>
    </DemoFrame>
  );
}
