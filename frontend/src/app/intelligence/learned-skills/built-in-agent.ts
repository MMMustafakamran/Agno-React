import "server-only";

import {
  BuiltInAgent,
  convertMessagesToVercelAISDKMessages,
} from "@copilotkit/runtime/v2";
import { openai } from "@ai-sdk/openai";
import { stepCountIs, streamText } from "ai";

/**
 * Skill delivery, "BuiltInAgent" — both of the section's snippets, verbatim.
 * NOTHING IMPORTS THIS FILE, on purpose.
 *
 * The 2026-09-21 sync added BuiltInAgent as the first row of the adapter table,
 * and it is the first row on this page an Agno reader could reach: it needs no
 * adapter package, only `@copilotkit/runtime/v2`, which this app already has.
 * It is not an Agno integration — a BuiltInAgent replaces the Agno agent with
 * CopilotKit's own — but it is runnable code on a page that previously had none
 * for this section.
 *
 * It typechecks on the installed @copilotkit/runtime 1.73.3 (declared ^1.73.3).
 * It did not on 1.72.0: `learnedSkills` was on no BuiltInAgent config (TS2353)
 * and not on the factory context (TS2339). Those errors were acknowledged here
 * with `@ts-expect-error` until the 2026-09-23 upgrade made the directives
 * unused, and they were removed then. The page still states no minimum version.
 * See README §9 #19.
 *
 * The 2026-09-23 sync un-commented `revision: "exact-revision-id"` in both
 * snippets. That is a placeholder, not a revision: the page says to replace it
 * or remove it, and its own "Make sure delivery works" check says to remove it.
 * Kept verbatim; see README §9 #32.
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
  learnedSkills: {
    // Set these here, or omit them to use environment variables (linked above).
    containerId: "support-learning",
    revision: "exact-revision-id", // Optional: pin a published revision.
  },
});

// ── factory mode, verbatim ──────────────────────────────────────────────────

// [2] learned-skills: the factory receives catalog and tools
const factoryAgent = new BuiltInAgent({
  type: "aisdk",
  learnedSkills: {
    // Set these here, or omit them to use environment variables (linked above).
    containerId: "support-learning",
    revision: "exact-revision-id", // Optional: pin a published revision.
  },
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
