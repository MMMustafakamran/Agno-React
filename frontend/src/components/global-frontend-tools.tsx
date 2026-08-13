"use client";

import { useFrontendTool, useHumanInTheLoop } from "@copilotkit/react-core/v2";
import { z } from "zod";

import { ACCENTS, isAccentName, useHarnessState } from "./harness-state";

/**
 * Registers every browser-executed tool once, at the app root.
 *
 * These are deliberately global rather than page-scoped. The Agno agent
 * declares all four with `external_execution=True`, so the model can call any
 * of them from any chat in the app. A tool call with no registered handler
 * never gets a result, and the run hangs waiting for one — so registering
 * these per-page would leave every other page able to deadlock its own chat.
 *
 * The pages under App Control show the *effects* and the source; this is where
 * the wiring lives.
 */
export function GlobalFrontendTools() {
  const { setAccent, setGreeting, addBookmark } = useHarnessState();

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
