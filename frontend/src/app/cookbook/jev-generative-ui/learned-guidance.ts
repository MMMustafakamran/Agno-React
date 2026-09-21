/**
 * Jev: fast generative UI, "Optional: improve decisions and UI with Automatic
 * Learning" — `lib/learned-guidance.ts`, verbatim.
 * NOTHING IMPORTS THIS FILE, on purpose.
 *
 *   $ npx tsc --noEmit      # all four suppressions removed
 *   learned-guidance.ts(26,31): error TS2307: Cannot find module
 *     '@copilotkit/intelligence-langgraph' or its corresponding type
 *     declarations.
 *   learned-guidance.ts(35,36): error TS7006: Parameter 'skill' implicitly
 *     has an 'any' type.
 *   learned-guidance.ts(37,34): error TS7006: Parameter 'file' implicitly
 *     has an 'any' type.
 *   learned-guidance.ts(38,17): error TS7006: Parameter 'skill' implicitly
 *     has an 'any' type.
 *
 * The three TS7006s are knock-on, not separate defects: with the module
 * unresolved `SkillRegistry` is `any`, so every callback parameter below it is
 * implicitly `any` under `strict`. Same shape as the README's §9 #16, where a
 * wrong import path produced TS2305 plus a knock-on TS7006 on this same stack.
 *
 * The page says to install `@copilotkit/intelligence-langgraph@1.71.2`
 * "alongside the pinned stack above" — a stack pinned at 1.73.0. That package
 * is published (1.71.2, 2026-09-14, see the README's §9 #19) but is not
 * installed here, and this repo installs nothing for a doc page.
 *
 * Even installed it would do nothing: it reads a Learning container's published
 * Skills through `CPK_INTELLIGENCE_API_KEY` and
 * `CPK_INTELLIGENCE_LEARNING_CONTAINER_ID`, and this project has no container
 * (§9 #17) and no Intelligence entitlement (§9 #16).
 */

// [11] jev: read published Skills as Jev guidance
// [!code highlight]
// @ts-expect-error — TS2307: Cannot find module
// '@copilotkit/intelligence-langgraph' or its corresponding type declarations.
import { SkillRegistry } from "@copilotkit/intelligence-langgraph";

const registry = new SkillRegistry();
export async function loadGuidance() {
  await registry.initialize();
  const snapshot = await registry.acquireSnapshot();
  return {
    revision: registry.status.revision,
    stale: registry.status.stale,
    // @ts-expect-error — TS7006, knock-on from the unresolved module above.
    guidance: snapshot.skills.map((skill) => ({
      name: skill.name,
      // @ts-expect-error — TS7006, same cause.
      content: skill.files.find((file) => file.path === "SKILL.md")?.text ?? "",
      // @ts-expect-error — TS7006, same cause.
    })).filter((skill) => skill.content.length > 0),
  };
}
