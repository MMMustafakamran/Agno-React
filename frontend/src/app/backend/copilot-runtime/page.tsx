import { RouteHeader } from "@/components/route-header";
import { SourceCode } from "@/components/source-code";
import { Callout, CodeBlock, Panel, TryIt } from "@/components/ui";

const DIRECT_SNIPPET = `import { HttpAgent } from "@ag-ui/client";

const myAgent = new HttpAgent({ url: "http://localhost:8000/agui" });

<CopilotKitProvider agents__unsafe_dev_only={{ "my-agent": myAgent }}>
  <YourApp />
</CopilotKitProvider>`;

// "Which name identifies an agent", added 2026-09-21. Both blocks verbatim.
const ROUTING_KEY_SNIPPET = `const runtime = new CopilotRuntime({
  agents: {
    // \`my_agent\` is the key — the one string the frontend may ask for.
    my_agent: new HttpAgent({ url: "http://localhost:8000/" }),
  },
});`;

const ROUTING_PROVIDER_SNIPPET = `<CopilotKit runtimeUrl="/api/copilotkit" agent="my_agent" useSingleEndpoint={false}>
  <YourApp />
</CopilotKit>`;

const COMPARISON: [string, string, string][] = [
  ["Authentication", "Safe defaults provided", "You manage it"],
  ["AG-UI middleware", "Runs server-side", "Not available"],
  ["Agent routing", "Automatic", "Manual"],
  ["Threads and ecosystem", "Full support", "Limited"],
  ["Support", "Supported", "Not supported"],
  ["Setup", "Needs a backend endpoint", "Frontend only"],
];

export default function Page() {
  return (
    <>
      <RouteHeader path="/backend/copilot-runtime" />

      <Panel title="What it demonstrates">
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          The runtime is the server-side bridge between the app and the agent.
          It resolves agents by id, keeps the model provider key and any
          middleware on the server, and re-encodes the agent&apos;s output as
          SSE for the browser.
        </p>
        <div className="mt-4">
          <TryIt
            prompts={["Hello"]}
            expect="Both ids stream a reply. Switching ids starts a separate conversation, because each agent id carries its own message list."
            fail="One id errors with an agent-not-found style message — it is missing from the runtime's agents map."
          />
        </div>
      </Panel>

      <Panel
        title="This repo's runtime"
        description="Read from disk — diff it against the doc's minimal sample."
      >
        <SourceCode file="frontend/src/app/api/copilotkit/[[...slug]]/route.ts" />
        <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
          <code>createCopilotRuntimeHandler</code> with{" "}
          <code>InMemoryAgentRunner</code> is used from{" "}
          <code>@copilotkit/runtime/v2</code>. Agno calls the model, and the
          runtime acts as the server-side bridge. Registering an agent under the
          id <code>default</code> is what lets every prebuilt component work with
          no <code>agentId</code> prop.
        </p>
      </Panel>

      <Panel
        title="Which name identifies an agent"
        description="Added 2026-09-21: the name the frontend asks for is a key of the agents map, never the agent's own name or class."
      >
        <CodeBlock
          filename='app/api/copilotkit/[[...slug]]/route.ts'
          language="ts"
          code={ROUTING_KEY_SNIPPET}
        />
        <div className="mt-4">
          <CodeBlock
            filename="app/providers.tsx"
            language="tsx"
            code={ROUTING_PROVIDER_SNIPPET}
          />
        </div>
        <p className="mt-4 text-sm text-slate-600 dark:text-slate-400">
          This runtime registers <code>default</code> and{" "}
          <code>agno_agent</code>, so those two strings are the whole set of
          names the frontend may ask for. The demo adds a third button for{" "}
          <code>my_agent</code>, the page&apos;s own example key, which this
          runtime does not register, so the discovery failure is on camera
          beside the two that resolve. The demo also reads{" "}
          <code>GET /api/copilotkit/info</code>, which the page names as the way
          to see the real keys.
        </p>

        <div className="mt-4">
          <Callout tone="warn" title="The section's snippet points an Agno reader at the wrong URL">
            On <code>/agno</code> the example agent is{" "}
            <code>new HttpAgent({"{ url: \"http://localhost:8000/\" }"})</code>.
            Agno&apos;s AgentOS serves AG-UI at <code>/agui</code>, not at the
            root, and <code>HttpAgent</code> is never imported in that block:
            the page only imports it much further down, in the
            direct-connection section. The landing page&apos;s own snippet for
            the same job uses <code>AgnoAgent</code> with{" "}
            <code>http://localhost:8000/agui</code>. Copying this section into
            an Agno project gives a registered key that resolves to an endpoint
            that is not the agent.
          </Callout>
        </div>
      </Panel>

      <Panel title="The demo page">
        <SourceCode file="frontend/src/app/backend/copilot-runtime/demo-chat/page.tsx" />
      </Panel>

      <Panel
        title="Why not connect the browser straight to Agno?"
        description="AG-UI is an open protocol, so a direct connection is possible — with real losses."
      >
        <CodeBlock filename="Direct connection (dev only)" language="tsx" code={DIRECT_SNIPPET} />

        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[34rem] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500 dark:border-slate-700">
                <th className="pb-2 pr-4 font-medium" />
                <th className="pb-2 pr-4 font-medium">With runtime</th>
                <th className="pb-2 font-medium">Direct</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {COMPARISON.map(([label, withRt, direct]) => (
                <tr key={label}>
                  <td className="py-2 pr-4 font-medium text-slate-800 dark:text-slate-100">
                    {label}
                  </td>
                  <td className="py-2 pr-4 text-emerald-700 dark:text-emerald-400">
                    {withRt}
                  </td>
                  <td className="py-2 text-slate-600 dark:text-slate-400">
                    {direct}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4">
          <Callout tone="warn" title="Not implemented here on purpose">
            The prop is literally named <code>agents__unsafe_dev_only</code>. A
            direct connection would expose the Agno endpoint to the browser and
            disable the server-side middleware that threads and other features
            depend on, so this harness routes everything through the runtime.
          </Callout>
        </div>
      </Panel>
    </>
  );
}
