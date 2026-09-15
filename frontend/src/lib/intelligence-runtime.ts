import "server-only";

import {
  CopilotRuntime,
  CopilotKitIntelligence,
  InMemoryAgentRunner,
} from "@copilotkit/runtime/v2";
import { AgnoAgent } from "@ag-ui/agno";

/**
 * The Intelligence runtime, built once and mounted twice.
 *
 * The Intelligence Quickstart builds a runtime in "Connect your runtime" and
 * exposes it in "Expose one Runtime route". That second step used to prescribe
 * the multi-route handler; as of the 2026-09-09 sync it prescribes
 * `mode: "single-route"`, and the frontend step gained `useSingleEndpoint`.
 * Both mounts are kept so the only variable under test is the transport:
 *
 *   `/api/copilotkit-threads` — multi-route, drives the Rich Threads routes and
 *                               is the only mode that dispatches the thread
 *                               REST subtree.
 *   `/api/copilotkit-single`  — single-route, drives `/intelligence/quickstart`.
 *
 * A factory rather than a shared instance: each route builds its own so neither
 * mount can be affected by the other's channel activation.
 */

const AGNO_URL = process.env.AGNO_AGENT_URL ?? "http://localhost:8000/agui";

// Treat empty/whitespace values as absent. A GitHub Actions `${{ secrets.X }}`
// reference to a secret that does not exist expands to an empty string, which
// still *defines* the variable — so a plain `??` or truthiness check on
// process.env would sail past it and hand Intelligence an empty credential.
const firstSet = (...values: (string | undefined)[]) =>
  values.find((v) => typeof v === "string" && v.trim().length > 0)?.trim();

// `CPK_INTELLIGENCE_API_KEY` is the name the docs now publish, so it is read
// first. `INTELLIGENCE_API_KEY` is what older CLIs wrote and stays accepted —
// the docs renamed the variable without saying the old one stopped working.
const INTELLIGENCE_KEY = firstSet(
  process.env.CPK_INTELLIGENCE_API_KEY,
  process.env.INTELLIGENCE_API_KEY,
);
const LICENSE_TOKEN = firstSet(process.env.COPILOTKIT_LICENSE_TOKEN);

/**
 * True when Intelligence is actually wired.
 *
 * Keyed on the project API key alone as of the 2026-09-15 sync: the Threads
 * Drawer page now states managed project setup does **not** issue
 * `COPILOTKIT_LICENSE_TOKEN`, and that the token is only for offline or
 * self-hosted licensing rather than a replacement for the managed key. The old
 * `KEY && TOKEN` gate dropped a correctly-configured managed project to the
 * in-memory runner, which is precisely the locked drawer the page says should
 * not happen.
 */
export const INTELLIGENCE_CONFIGURED = Boolean(INTELLIGENCE_KEY);

export function createIntelligenceRuntime(): CopilotRuntime {
  return new CopilotRuntime({
    // `default` is required: <CopilotThreadsDrawer> and useThreads fall back to
    // DEFAULT_AGENT_ID ("default") when given no agentId, and threads are
    // stored per agent id.
    agents: {
      default: new AgnoAgent({ url: AGNO_URL }),
      agno_agent: new AgnoAgent({ url: AGNO_URL }),
    },

    ...(INTELLIGENCE_KEY
      ? {
          intelligence: new CopilotKitIntelligence({
            apiKey: INTELLIGENCE_KEY,
          }),
          generateThreadNames: true,
          // Threads are stored per user, so the runtime has to name one. The
          // doc calls a static value demo-only, and that is exactly what this
          // is: a fixed id keeps one shared list across browsers for manual QA.
          // [1] intelligence quickstart: identifyUser
          // [!code highlight]
          identifyUser: (request: Request) => {
            const id =
              request.headers.get("x-copilotkit-user-id") ?? "demo-user";
            return { id, name: id === "demo-user" ? "Demo User" : id };
          },
          // Self-hosted / OSS licensing only. The page documents the option as
          // winning over `COPILOTKIT_LICENSE_TOKEN` when both are set; here the
          // option *is* the env var, and it is omitted when unset so a managed
          // project is not handed an empty credential.
          ...(LICENSE_TOKEN ? { licenseToken: LICENSE_TOKEN } : {}),
        }
      : { runner: new InMemoryAgentRunner() }),
  });
}
