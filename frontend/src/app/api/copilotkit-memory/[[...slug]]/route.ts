import { AgnoAgent } from "@ag-ui/agno";
import {
  CopilotKitIntelligence,
  CopilotRuntime,
  createCopilotRuntimeHandler,
} from "@copilotkit/runtime/v2";

/**
 * NOT FROM THE PAGE. The runtime option Memories & Recall never mentions.
 *
 * The page says memory "is not a feature flag" and that `isAvailable: false` is
 * what an unentitled deployment looks like. On runtime 1.71.0 there is a gate
 * before entitlement is ever consulted: every `/memories/*` request 404s at the
 * runtime unless it is constructed with `memory: { access }` (or the deprecated
 * `exposeMemoryRoutes: true`) — a "secure default", per the runtime's own
 * typings. `/api/copilotkit`, built the way the Quickstart builds it, has
 * neither, so the page's `useMemories()` reports unavailable there no matter
 * what the organization is entitled to.
 *
 * This mount is the same Intelligence runtime with that one option added,
 * granting the user read-write. It exists so the demo can show what sits
 * behind the undocumented gate: with the routes open, the request reaches the
 * platform, and what the platform says about this project's entitlement is
 * what the hook then reports.
 */

const AGNO_URL = process.env.AGNO_AGENT_URL ?? "http://localhost:8000/agui";
const INTELLIGENCE_API_KEY =
  process.env.CPK_INTELLIGENCE_API_KEY ?? process.env.INTELLIGENCE_API_KEY;

function build(): CopilotRuntime | null {
  if (!INTELLIGENCE_API_KEY) return null;
  return new CopilotRuntime({
    agents: { default: new AgnoAgent({ url: AGNO_URL }) },
    intelligence: new CopilotKitIntelligence({ apiKey: INTELLIGENCE_API_KEY }),
    identifyUser: (request: Request) => ({
      id: request.headers.get("x-user-id") ?? "anonymous",
      name: request.headers.get("x-user-name") ?? "Anonymous",
    }),
    // The missing option.
    memory: {
      access: () => ({ user: "read-write", project: "none" }),
    },
  });
}

const runtime = build();

const handler = runtime
  ? createCopilotRuntimeHandler({ runtime, basePath: "/api/copilotkit-memory" })
  : async () =>
      Response.json(
        { error: "CPK_INTELLIGENCE_API_KEY is not set; memory needs an Intelligence runtime." },
        { status: 503 },
      );

export const GET = handler;
export const POST = handler;
export const PATCH = handler;
export const DELETE = handler;
