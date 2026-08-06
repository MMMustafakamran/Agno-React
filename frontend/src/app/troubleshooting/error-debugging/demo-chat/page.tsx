"use client";

import { CopilotChat } from "@copilotkit/react-core/v2";

import { DemoFrame } from "@/components/demo-frame";
import { useHarnessState } from "@/components/harness-state";

/**
 * The live error log beside a chat to provoke errors in.
 *
 * Entries come from the provider-level `onError` handler in
 * `components/providers.tsx`, so this panel captures failures from every route
 * in the app, not just this one.
 */
export default function Page() {
  const { errors, clearErrors } = useHarnessState();

  return (
    <DemoFrame
      parentPath="/troubleshooting/error-debugging"
      subtitle="provider-level onError capture"
    >
      <div className="grid h-full grid-cols-1 lg:grid-cols-2">
        <div className="flex min-h-0 flex-col border-b border-slate-200 lg:border-b-0 lg:border-r dark:border-slate-800">
          <div className="flex shrink-0 items-center justify-between gap-2 border-b border-slate-200 px-3 py-2 dark:border-slate-800">
            <p className="text-xs text-slate-500">
              {errors.length} captured (newest first, capped at 50)
            </p>
            <button
              type="button"
              onClick={clearErrors}
              className="rounded-md border border-slate-300 px-2.5 py-1 text-xs font-medium dark:border-slate-600"
            >
              Clear
            </button>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto p-3">
            {errors.length === 0 ? (
              <p className="text-sm text-slate-500">
                No errors captured. That is the healthy state — stop the Agno
                process and send a message to see this fill up.
              </p>
            ) : (
              <ul className="space-y-2">
                {errors.map((e) => (
                  <li
                    key={e.id}
                    className="rounded-lg border border-rose-200 bg-rose-50 p-3 dark:border-rose-900 dark:bg-rose-950/40"
                  >
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <code className="text-xs font-semibold text-rose-800 dark:text-rose-200">
                        {e.code}
                      </code>
                      <span className="text-xs text-rose-600 dark:text-rose-400">
                        {new Date(e.at).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="mt-1 break-words text-sm text-rose-900 dark:text-rose-100">
                      {e.message}
                    </p>
                    {e.context != null && (
                      <pre className="mt-2 max-h-32 overflow-auto rounded bg-white/70 p-2 text-xs text-rose-900 dark:bg-slate-900/60 dark:text-rose-200">
                        {JSON.stringify(e.context, null, 2)}
                      </pre>
                    )}
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
                "Stop the Agno process, then send something here to capture a real error.",
            }}
          />
        </div>
      </div>
    </DemoFrame>
  );
}
