import "server-only";

import { AgnoAgent } from "@ag-ui/agno";
import {
  CopilotKitIntelligence,
  CopilotRuntime,
} from "@copilotkit/runtime/v2";

/**
 * Learning, step "Assign Threads from your Runtime" — the page's runtime,
 * mounted on its own route at `/api/copilotkit-learning`.
 *
 * The snippet below the rule is verbatim. It uses two identifiers it never
 * defines, `agents` and `identifyUser`, and says nothing about them; the page
 * is identical under every framework prefix, so it cannot. They are supplied
 * here, above the rule, and they are this harness's, not the page's:
 *
 *   agents        The Agno agent under the id the page's selector tests for,
 *                 `expense-agent`, plus `default`, which the selector sends to
 *                 no container. One backend, two ids: which one a run uses is
 *                 the only thing that decides whether it is assigned.
 *   identifyUser  The same fixed demo identity the threads runtime uses.
 *
 * A separate mount rather than an edit to `/api/copilotkit`, for two reasons.
 * `getLearningContainerId` exists only from runtime 1.70 — the page names no
 * version — and the constructor throws on a blank key, so the page's code
 * belongs where a failure takes down one route and not every chat in the app.
 */

const AGNO_URL = process.env.AGNO_AGENT_URL ?? "http://localhost:8000/agui";

const agents = {
  default: new AgnoAgent({ url: AGNO_URL }),
  "expense-agent": new AgnoAgent({ url: AGNO_URL }),
};

const identifyUser = (request: Request) => {
  const id = request.headers.get("x-copilotkit-user-id") ?? "demo-user";
  return { id, name: id === "demo-user" ? "Demo User" : id };
};

// ── the page's snippet ─────────────────────────────────────────────────────

// [1] learning: assign Threads from your Runtime
const intelligence = new CopilotKitIntelligence({
  apiKey: process.env.CPK_INTELLIGENCE_API_KEY!,
  getLearningContainerId: () => "firstlearningtest",
});

const runtime = new CopilotRuntime({
  agents,
  intelligence,
  identifyUser,
});

export { runtime as learningRuntime };
