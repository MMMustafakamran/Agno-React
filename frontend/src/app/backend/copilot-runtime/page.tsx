import { RouteHeader } from "@/components/route-header";
import { SourceCode } from "@/components/source-code";
import { Callout, CodeBlock, Panel, TryIt } from "@/components/ui";

const DIRECT_SNIPPET = `import { HttpAgent } from "@ag-ui/client";

const myAgent = new HttpAgent({ url: "http://localhost:8000/agui" });

<CopilotKitProvider agents__unsafe_dev_only={{ "my-agent": myAgent }}>
  <YourApp />
</CopilotKitProvider>`;

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
