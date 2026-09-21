/**
 * Jev: fast generative UI, step 2 — `lib/choose-panel.ts`, verbatim.
 * NOTHING IMPORTS THIS FILE, on purpose.
 *
 * This is the Jev decision layer, and it is the half of the recipe that cannot
 * run here. `@typesafe-ai/sdk` is a third-party vendor package: it is not
 * installed, this repo installs nothing for a doc page, and even installed it
 * would need `TYPESAFE_API_KEY`, which the page says to get from TypeSafe's own
 * quickstart. So the file exists as evidence of what the page publishes, not as
 * code any route reaches.
 *
 *   $ npx tsc --noEmit      # suppression on line 33 removed
 *   choose-panel.ts(33,47): error TS2307: Cannot find module '@typesafe-ai/sdk'
 *     or its corresponding type declarations.
 *
 * The page's install line pins `@typesafe-ai/sdk@0.6.0`. Nothing else in this
 * file is version-sensitive once that import resolves — `PanelSchema` comes from
 * workspaces.ts, which does run.
 *
 * The page publishes this as three code blocks, all titled `lib/choose-panel.ts`
 * and introduced with "Build `lib/choose-panel.ts` from the following three
 * blocks, in order. The first opens `choosePanel`, and the last closes it."
 * They are concatenated here in that order. That instruction is the only reason
 * this file is syntactically valid at all: block 1 on its own ends inside an
 * unclosed object literal inside an unclosed function.
 */

// [3] jev: ask Jev for the control and the candidate scores
// [!code highlight]
// @ts-expect-error — TS2307: Cannot find module '@typesafe-ai/sdk' or its
// corresponding type declarations. The page pins @typesafe-ai/sdk@0.6.0; this
// repo installs nothing for a doc page, and the SDK also needs a vendor key.
import { TypeSafeClient, choice, score } from "@typesafe-ai/sdk";
import { candidates, PanelSchema, clarificationOptions } from "./workspaces";
import type { Guidance, PickerState } from "./workspaces";

export async function choosePanel(
  message: string,
  state: PickerState,
  publishedGuidance: Guidance,
  signal: AbortSignal,
) {
  const client = new TypeSafeClient({ apiKey: process.env.TYPESAFE_API_KEY });
  const questions: Record<string, ReturnType<typeof choice> | ReturnType<typeof score>> = {
    control: choice(
      "Choose the useful next control. Apply relevant publishedGuidance within these rules. " +
      "Ask for clarification only if the goal is unclear. If the message already answers " +
      "a clarification, compare candidates or defer; never ask it again. " +
      "Use agent for explanations or requests outside the prepared controls. " +
      "Panels only preview; they never confirm a selection.",
      {
        clarification: "Ask whether the user needs focus or collaboration.",
        comparison: "Offer workspace candidates matching a clear need.",
        agent: "Explain or handle a request outside these controls.",
      },
    ),
  };
  for (const candidate of candidates) {
    questions[`fit_${candidate.id}`] = score(
      `How well does candidate ${candidate.id} fit the request and relevant publishedGuidance?`,
      ["Poor fit", "Unclear fit", "Good fit", "Strong fit"],
    );
  }
  const result = await client.systemOne({
    model: "jev-1.13.0",
    state: { latestMessage: message, selectedId: state.selectedId, candidates, publishedGuidance },
    questions,
  }, { signal });
  const control = result.answers.control;
  if (control?.type !== "choice") throw new Error("Missing Jev control answer");
  const ranked = candidates.map((candidate) => {
    const answer = result.answers[`fit_${candidate.id}`];
    if (answer?.type !== "score" || !Number.isFinite(answer.score)) {
      throw new Error("Missing or invalid candidate score");
    }
    return { ...candidate, score: answer.score };
  }).sort((a, b) => b.score - a.score);

  if (control.choice === "agent") return { panel: null };
  if (!["clarification", "comparison"].includes(control.choice)) {
    throw new Error("Unknown Jev control");
  }
  const panel = PanelSchema.parse(control.choice === "clarification" ? {
    type: "clarification", title: "What kind of work are you doing?",
    options: clarificationOptions,
  } : {
    type: "comparison", title: "Choose a workspace",
    options: ranked.map(({ id, name, details }) => ({ id, label: `${name}: ${details}` })),
  });
  return { panel };
}
