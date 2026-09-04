import {
  CopilotRuntime,
  CopilotKitIntelligence,
  InMemoryAgentRunner,
  createCopilotRuntimeHandler,
} from "@copilotkit/runtime/v2";
import { AgnoAgent } from "@ag-ui/agno";

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

const runtime = new CopilotRuntime({
  // `default` is required: <CopilotThreadsDrawer> and useThreads fall back to
  // DEFAULT_AGENT_ID ("default") when given no agentId, and threads are stored
  // per agent id.
  agents: {
    default: new AgnoAgent({ url: AGNO_URL }),
    agno_agent: new AgnoAgent({ url: AGNO_URL }),
  },

  ...(INTELLIGENCE_KEY && LICENSE_TOKEN
    ? {
        intelligence: new CopilotKitIntelligence({
          apiKey: INTELLIGENCE_KEY,
        }),
        generateThreadNames: true,
        identifyUser: (request: Request) => {
          const id = request.headers.get("x-copilotkit-user-id") ?? "demo-user";
          return { id, name: id === "demo-user" ? "Demo User" : id };
        },
        licenseToken: LICENSE_TOKEN,
      }
    : { runner: new InMemoryAgentRunner() }),
});

const handler = createCopilotRuntimeHandler({
  runtime,
  basePath: "/api/copilotkit-threads",
});

export const GET = handler;
export const POST = handler;
export const PATCH = handler;
export const DELETE = handler;
