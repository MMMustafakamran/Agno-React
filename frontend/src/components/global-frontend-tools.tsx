"use client";

import { useFrontendTool, useHumanInTheLoop } from "@copilotkit/react-core/v2";
import { z } from "zod";

import { GovernedActionCard } from "./governed-action-card";
import { ACCENTS, isAccentName, useHarnessState } from "./harness-state";

/**
 * Registers every browser-executed tool once, at the app root.
 *
 * These are deliberately global rather than page-scoped. The Agno agent
 * declares each of them with `external_execution=True`, so the model can call
 * any of them from any chat in the app. A tool call with no registered handler
 * never gets a result, and the run hangs waiting for one — so registering
 * these per-page would leave every other page able to deadlock its own chat.
 *
 * The reverse also bites, and did: `addBookmark` and `offerOptions` were
 * registered here but missing from `FRONTEND_TOOLS` in `backend/tools/__init__.py`,
 * so the agent was never told they existed and simply never called them. A
 * handler with no tool behind it fails silently — see that file.
 *
 * The pages under App Control show the *effects* and the source; this is where
 * the wiring lives.
 */
export function GlobalFrontendTools() {
  const { setAccent, setGreeting, addBookmark } = useHarnessState();

  // #region frontend-tools
  // [7] frontend tool: execute the agent's tool call in the browser
  // [!code highlight:10]
  useFrontendTool({
    name: "sayHello",
    description: "Say hello to the user with a greeting banner in the UI.",
    parameters: z.object({
      name: z.string().describe("The name of the user to say hello to"),
    }),
    handler: async ({ name }) => {
      setGreeting(name);
      return `Displayed a greeting banner for ${name}.`;
    },
  });

  useFrontendTool({
    name: "setThemeColor",
    description: "Change the accent color of the application UI.",
    parameters: z.object({
      theme: z
        .enum(Object.keys(ACCENTS) as [string, ...string[]])
        .describe("The accent color to apply"),
    }),
    handler: async ({ theme }) => {
      if (!isAccentName(theme)) {
        // Returned rather than thrown: the model can read this and retry with a
        // valid value, whereas a throw surfaces as a tool_handler_failed error.
        return `"${theme}" is not a valid accent. Choose one of: ${Object.keys(
          ACCENTS,
        ).join(", ")}.`;
      }
      setAccent(theme);
      return `Accent color changed to ${theme}.`;
    },
  });

  useFrontendTool({
    name: "addBookmark",
    description: "Add a bookmark to the user's bookmark list in the UI.",
    parameters: z.object({
      title: z.string().describe("The label to show for the bookmark"),
      url: z.string().describe("The URL the bookmark points to"),
    }),
    handler: async ({ title, url }) => {
      addBookmark(title, url);
      return `Added bookmark "${title}".`;
    },
  });
  // #endregion

  // #region governed-action
  // Governed Action Approval UI — the tool-call variant from
  // docs.copilotkit.ai/agno/human-in-the-loop/governed-actions.
  //
  // Registered globally for the same reason as the others. The card itself
  // lives on the route so the page's own component is the one on screen.
  useHumanInTheLoop({
    name: "approve_governed_action",
    description:
      "Ask the user to approve a governed side-effect action before it runs.",
    parameters: z.object({
      id: z.string(),
      summary: z.string(),
      tool: z.string(),
      reference: z.string(),
      verdict: z.enum(["allow", "deny", "require_approval"]),
      // Published as `z.record(z.unknown())`. That is a zod 3 signature; this
      // repo is on zod 4.4.3, where `z.record` requires both a key and a value
      // schema — the single-argument form is `TS2554: Expected 2-3 arguments,
      // but got 1`. Translated rather than left failing because this component
      // is mounted at the app root, so the error would take down every route
      // instead of demonstrating anything. See /human-in-the-loop/governed-actions.
      arguments: z.record(z.string(), z.unknown()),
    }),
    render: ({ args, status, respond }) => {
      if (status !== "executing" || !respond) {
        return null;
      }

      return (
        <GovernedActionCard
          action={args}
          onApprove={() =>
            respond({
              approved: true,
              actionId: args.id,
              reference: args.reference,
            })
          }
          onReject={() =>
            respond({
              approved: false,
              actionId: args.id,
              reference: args.reference,
            })
          }
          onBlock={() =>
            respond({
              approved: false,
              actionId: args.id,
              reference: args.reference,
            })
          }
        />
      );
    },
  });
  // #endregion

  // #region human-in-the-loop
  // Human-in-the-loop: the run pauses here until `respond` is called, so the
  // agent's next step depends on what the user clicks.
  useHumanInTheLoop({
    name: "offerOptions",
    description:
      "Give the user a choice between two options and have them select one.",
    parameters: z.object({
      option_1: z.string().describe("The first option"),
      option_2: z.string().describe("The second option"),
    }),
    render: ({ args, respond, status }) => {
      const options = [args.option_1, args.option_2].filter(Boolean) as string[];

      if (status === "complete" || !respond) {
        return (
          <div className="my-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
            Choice submitted.
          </div>
        );
      }

      return (
        <div className="my-2 rounded-lg border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-900">
          <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
            Pick one:
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {options.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => respond(`${option} was selected`)}
                className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-800 transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)] dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      );
    },
  });
  // #endregion

  return null;
}
