import "server-only";

import {
  BuiltInAgent,
  convertMessagesToVercelAISDKMessages,
} from "@copilotkit/runtime/v2";
import { openai } from "@ai-sdk/openai";
import { stepCountIs, streamText } from "ai";

/**
 * Automatic learned skill delivery, "Native setup / BuiltInAgent" — both of the
 * section's snippets, verbatim. NOTHING IMPORTS THIS FILE, on purpose.
 *
 * The 2026-09-21 sync added BuiltInAgent as the first row of the adapter table,
 * and it is the first row on this page an Agno reader could reach: it needs no
 * adapter package, only `@copilotkit/runtime/v2`, which this app already has.
 * It is not an Agno integration — a BuiltInAgent replaces the Agno agent with
 * CopilotKit's own — but it is runnable code on a page that previously had none
 * for this section.
 *
 * It does not compile on the installed runtime. `learnedSkills` does not exist
 * on any BuiltInAgent config in 1.72.0; it appears first in 1.73.0, published
 * after this doc text. The page states no version floor anywhere. The errors are
 * acknowledged in place so the file stays the evidence without taking the
 * typecheck down, exactly as `intelligence/memories/memory-list.tsx` did while
 * its own import was wrong.
 *
 * The two `import` lines are hoisted to the top of the file, which is the one
 * difference from the page: the second snippet repeats the `BuiltInAgent`
 * import and adds `convertMessagesToVercelAISDKMessages`, and one module cannot
 * import the same binding twice.
 */

// ── classic mode, verbatim ──────────────────────────────────────────────────

// [1] learned-skills: learnedSkills on BuiltInAgent
const agent = new BuiltInAgent({
  model: "openai/gpt-4o",
  prompt: "Follow the application's support policy.",
  // @ts-expect-error — `learnedSkills` is not a BuiltInAgent option on the
  // installed @copilotkit/runtime 1.72.0. It ships in 1.73.0; the page names
  // no version.
  learnedSkills: {
    containerId: "support-learning",
    // revision: "exact-revision-id", // Optional: pin a published revision.
  },
});

// ── factory mode, verbatim ──────────────────────────────────────────────────

// [2] learned-skills: the factory receives catalog and tools
const factoryAgent = new BuiltInAgent({
  type: "aisdk",
  // @ts-expect-error — same option, same version gap.
  learnedSkills: { containerId: "support-learning" },
  // @ts-expect-error — TS2339: Property 'learnedSkills' does not exist on type
  // 'AgentFactoryContext'. 1.72.0's factory context has no such field, and the
  // `BuiltInAgentFactoryContext` the page says to import for this is TS2724:
  // no exported member of that name. Both land in 1.73.0.
  factory: ({ input, abortSignal, learnedSkills }) =>
    streamText({
      model: openai("gpt-4o"),
      system: [
        "Follow the application's support policy.",
        learnedSkills.catalog,
      ].filter(Boolean).join("\n\n"),
      messages: convertMessagesToVercelAISDKMessages(input.messages),
      tools: { ...learnedSkills.tools },
      stopWhen: stepCountIs(10),
      abortSignal,
    }),
});

export { agent, factoryAgent };
