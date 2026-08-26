import {
  CopilotKitIntelligence,
  CopilotRuntime,
  createCopilotRuntimeHandler,
  InMemoryAgentRunner,
} from "@copilotkit/runtime/v2";
import { AgnoAgent } from "@ag-ui/agno";

// Where the Agno AgentOS AG-UI interface is listening. `main.py` mounts it at
// POST /agui on port 8000.
const AGNO_URL = process.env.AGNO_AGENT_URL ?? "http://localhost:8000/agui";

// Quickstart step 1's license key. Present -> the doc's Intelligence wiring;
// absent -> the doc's documented fallback (SSE + in-memory runner).
const INTELLIGENCE_API_KEY = process.env.INTELLIGENCE_API_KEY;

// Two ids, one backend. `default` is what every prebuilt component picks up with
// no configuration; `agno_agent` is the same agent under an explicit id, which
// is what the Copilot Runtime route uses to show agent routing working.
const runtime = new CopilotRuntime({
  // [2] Copilot Runtime: register the Agno agent
  // [!code highlight]
  agents: {
    default: new AgnoAgent({ url: AGNO_URL }),
    agno_agent: new AgnoAgent({ url: AGNO_URL }),
  },

  ...(INTELLIGENCE_API_KEY
    ? {
        intelligence: new CopilotKitIntelligence({
          apiKey: INTELLIGENCE_API_KEY,
        }),
        // Threads are per-user. Without this, every visitor shares one history.
        identifyUser: (request: Request) => ({
          id: request.headers.get("x-user-id") ?? "anonymous",
          name: request.headers.get("x-user-name") ?? "Anonymous",
        }),
      }
    : { runner: new InMemoryAgentRunner() }),
});

const handler = createCopilotRuntimeHandler({
  runtime,
  basePath: "/api/copilotkit",
});

export const GET = handler;
export const POST = handler;
