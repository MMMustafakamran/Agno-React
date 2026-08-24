import {
  CopilotRuntime,
  CopilotKitIntelligence,
  InMemoryAgentRunner,
  createCopilotRuntimeHandler,
} from "@copilotkit/runtime/v2";
import { AgnoAgent } from "@ag-ui/agno";

const AGNO_URL = process.env.AGNO_AGENT_URL ?? "http://localhost:8000/agui";
const LICENSE_TOKEN = process.env.COPILOTKIT_LICENSE_TOKEN;

const runtime = new CopilotRuntime({
  // `default` is required: <CopilotThreadsDrawer> and useThreads fall back to
  // DEFAULT_AGENT_ID ("default") when given no agentId, and threads are stored
  // per agent id.
  agents: {
    default: new AgnoAgent({ url: AGNO_URL }),
    agno_agent: new AgnoAgent({ url: AGNO_URL }),
  },

  ...(LICENSE_TOKEN
    ? {
        intelligence: new CopilotKitIntelligence({
          apiKey: process.env.INTELLIGENCE_API_KEY ?? "",
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
