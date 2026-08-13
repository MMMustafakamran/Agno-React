import {
  CopilotRuntime,
  ExperimentalEmptyAdapter,
  copilotRuntimeNextJSAppRouterEndpoint,
} from "@copilotkit/runtime";
import { AgnoAgent } from "@ag-ui/agno";
import { NextRequest } from "next/server";

// Where the Agno AgentOS AG-UI interface is listening. `main.py` mounts it at
// POST /agui on port 8000.
const AGNO_URL = process.env.AGNO_AGENT_URL ?? "http://localhost:8000/agui";

// The model provider key never reaches the browser: the agent process holds it,
// and this route is the only thing that talks to the agent.
const serviceAdapter = new ExperimentalEmptyAdapter();

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
});

export const POST = async (req: NextRequest) => {
  // [3] Copilot Runtime: handle the app-router request
  // [!code highlight]
  const { handleRequest } = copilotRuntimeNextJSAppRouterEndpoint({
    runtime,
    serviceAdapter,
    endpoint: "/api/copilotkit",
  });

  return handleRequest(req);
};
