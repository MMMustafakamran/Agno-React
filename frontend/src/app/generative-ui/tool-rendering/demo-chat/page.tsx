"use client";

import {
  CopilotChat,
  useDefaultRenderTool,
  useRenderTool,
} from "@copilotkit/react-core/v2";
import { z } from "zod";

import { DemoFrame } from "@/components/demo-frame";

/**
 * Two renderers in one chat: a named card for `get_weather`, and a generic
 * fallback for every other tool.
 *
 * Both registrations are scoped to this route, so the same tool calls fall back
 * to CopilotKit's built-in rendering everywhere else in the app.
 */

function Shell({
  tone,
  title,
  children,
}: {
  tone: "pending" | "done";
  title: string;
  children?: React.ReactNode;
}) {
  return (
    <div
      className={`my-2 rounded-xl border p-4 ${
        tone === "done"
          ? "border-[var(--accent)] bg-white dark:bg-slate-900"
          : "border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800"
      }`}
    >
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {title}
      </p>
      {children}
    </div>
  );
}

export default function Page() {
  // Named renderer. `parameters` is required here and types the `parameters`
  // prop inside render — note the shipped hook does not call this `args`.
  useRenderTool(
    {
      name: "get_weather",
      parameters: z.object({ location: z.string() }),
      render: (props) => {
        if (props.status === "inProgress") {
          return <Shell tone="pending" title="Weather">Preparing request…</Shell>;
        }
        if (props.status === "executing") {
          return (
            <Shell tone="pending" title="Weather">
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                Checking {props.parameters?.location ?? "…"}
              </p>
            </Shell>
          );
        }
        return (
          <Shell tone="done" title="Weather">
            <p className="mt-1 text-lg font-medium text-slate-900 dark:text-slate-50">
              {props.parameters?.location}
            </p>
            <pre className="mt-2 overflow-x-auto rounded bg-slate-100 p-2 text-xs text-slate-700 dark:bg-slate-800 dark:text-slate-200">
              {props.result}
            </pre>
          </Shell>
        );
      },
    },
    [],
  );

  // Catch-all for any tool without a dedicated renderer. With the current
  // agent that means the browser-executed ones — setThemeColor and sayHello.
  useDefaultRenderTool({
    render: ({ name, status, result }) => (
      <div className="my-2 rounded-lg border border-slate-200 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-900">
        <p className="font-mono text-xs text-slate-600 dark:text-slate-300">
          {status === "complete" ? "✓" : "⏳"} {name}
        </p>
        {status === "complete" && result && (
          <pre className="mt-1 overflow-x-auto text-xs text-slate-500">
            {result}
          </pre>
        )}
      </div>
    ),
  });

  return (
    <DemoFrame
      parentPath="/generative-ui/tool-rendering"
      subtitle="named renderer + wildcard fallback"
    >
      <CopilotChat
        labels={{
          welcomeMessageText:
            "Ask for the weather to see the custom card, or change the theme to see the generic fallback.",
        }}
      />
    </DemoFrame>
  );
}
