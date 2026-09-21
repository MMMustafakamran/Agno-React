import "server-only";

/**
 * Jev: fast generative UI, step 4 — the runtime registration, verbatim.
 * NOTHING IMPORTS THIS FILE, and it is deliberately NOT under `app/api/`.
 *
 * The page titles it `app/api/copilotkit/[[...slug]]/route.ts`. Put there it
 * would collide with this repo's own runtime at that exact path, and it would
 * register a `picker` agent whose every turn throws inside `choosePanel` for
 * want of a vendor SDK and a Jev key. So it is kept outside the route tree: the
 * point of the file is that it compiles, not that it serves.
 *
 * And it does compile, on the installed `@copilotkit/runtime` 1.72.0 (declared
 * `^1.72.0`), against the page's pinned `@copilotkit/runtime@1.73.0`. Together
 * with `picker-agent.ts` and the React page, that is the whole published stack
 * typechecking one minor version below the pin, with the page giving no reason
 * for it.
 *
 * Worth noting against this repo's §9 #18: this file is titled with the
 * catch-all path, `[[...slug]]`, and exports GET, POST, PATCH and DELETE —
 * agreeing with Quickstart, Copilot Runtime and Thread & History Lifecycle, and
 * disagreeing with the /agno landing page's plain `app/api/copilotkit/route.ts`
 * with two exports. Four pages to one.
 */

// [10] jev: register the picker with the runtime
// [!code highlight]
import { CopilotRuntime, createCopilotEndpoint } from "@copilotkit/runtime/v2";
import { PickerAgent } from "./picker-agent";

export const runtime = "nodejs";
const endpoint = createCopilotEndpoint({
  runtime: new CopilotRuntime({ agents: { picker: new PickerAgent() } }),
  basePath: "/api/copilotkit",
});
const handler = (request: Request) => endpoint.fetch(request);
export { handler as GET, handler as POST, handler as PATCH, handler as DELETE };
