/**
 * Jev: fast generative UI, step 1 — `lib/workspaces.ts`, verbatim.
 *
 * This is the half of the recipe that runs here. It is plain zod plus three
 * literals: no vendor SDK, no key, no package this repo does not already have.
 * `zod` is installed at 4.4.3 (declared `^4.4.3`) against the recipe's pinned
 * `zod@4.6.5`; nothing in these two blocks is 4.6-only, and the schemas parse.
 *
 * The page publishes this as two code blocks under one `lib/workspaces.ts`
 * title, the second introduced with "add the shape of the UI state to the same
 * file". They are concatenated here in that order and otherwise untouched.
 *
 * `Guidance` is exported but never used until the optional Automatic Learning
 * section at the bottom of the page; `choosePanel` receives `[]` for it in the
 * base recipe.
 */

// [1] jev: the catalog
import { z } from "zod";

export const candidates = [
  { id: "quiet", name: "Quiet room", details: "Enclosed, quiet, one person" },
  { id: "team", name: "Team table", details: "Open, collaborative, six people" },
  { id: "studio", name: "Studio", details: "Enclosed, whiteboard, four people" },
];

// [2] jev: the panel and state schemas
// [!code highlight]
export const PanelSchema = z.object({
  type: z.enum(["clarification", "comparison"]),
  title: z.string(),
  options: z.array(z.object({ id: z.string(), label: z.string() })).min(1),
});
export const StateSchema = z.object({
  panel: PanelSchema.nullable().default(null),
  selectedId: z.string().nullable().default(null),
  note: z.string().default(""),
});
export type PickerState = z.infer<typeof StateSchema>;
export type Guidance = { name: string; content: string }[];
export const clarificationOptions = [
  { id: "focus", label: "Quiet focus time" },
  { id: "collaboration", label: "Working with a team" },
];
