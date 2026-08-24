import {
  CopilotRuntime,
  createCopilotRuntimeHandler,
  InMemoryAgentRunner,
} from "@copilotkit/runtime/v2";
import { AgnoAgent } from "@ag-ui/agno";

// Where the Agno AgentOS AG-UI interface is listening. `main.py` mounts it at
// POST /agui on port 8000.
const AGNO_URL = process.env.AGNO_AGENT_URL ?? "http://localhost:8000/agui";

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
  runner: new InMemoryAgentRunner(),
});

const handler = createCopilotRuntimeHandler({
  runtime,
  basePath: "/api/copilotkit",
});

export const GET = handler;
export const POST = handler;
