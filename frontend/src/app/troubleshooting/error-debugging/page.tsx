import { RouteHeader } from "@/components/route-header";
import { SourceCode } from "@/components/source-code";
import { Callout, Panel, TryIt } from "@/components/ui";

const CODES: [string, string][] = [
  ["runtime_info_fetch_failed", "The runtime's info endpoint was unreachable."],
  ["agent_connect_failed", "Thread setup / agent connection failed."],
  ["agent_run_failed", "The run was rejected, typically a network error."],
  ["agent_run_failed_event", "The agent's onRunFailed subscriber fired."],
  ["agent_run_error_event", "The agent emitted a RUN_ERROR event."],
  ["tool_argument_parse_failed", "Tool call arguments were not valid JSON."],
  ["tool_handler_failed", "A frontend tool handler threw."],
];

export default function Page() {
  return (
    <>
      <RouteHeader path="/troubleshooting/error-debugging" />

      <Panel title="What it demonstrates">
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          A single <code>onError</code> handler on the provider catches every
          failure class — runtime connection problems, agent run failures, and
          errors thrown inside frontend tool handlers — with a stable code you
          can branch on or forward to an error tracker.
        </p>
        <div className="mt-4">
          <TryIt
            prompts={[
              "Stop the Agno process (Ctrl-C), then send: hello",
              "Restart it and send: hello",
            ]}
            expect="With the agent down, an entry appears with an agent_run_failed or runtime_info_fetch_failed style code. After restarting, messages stream normally again."
            fail="The chat fails silently with nothing logged — the provider's onError is not wired up."
          />
        </div>
      </Panel>

      <Callout tone="warn" title="Doc drift worth knowing">
        The published page shows <code>event.code</code> on a{" "}
        <code>&lt;CopilotKit&gt;</code> provider. In 1.66.2 that component&apos;s{" "}
        <code>onError</code> receives the legacy <code>CopilotErrorEvent</code> (
        <code>{"{ type, timestamp, context, error }"}</code>), which has no{" "}
        <code>code</code> field at all — <code>CopilotKitProps</code> is{" "}
        <code>Omit&lt;CopilotKitProviderProps, &quot;children&quot; | &quot;onError&quot;&gt;</code>{" "}
        with <code>onError</code> redeclared. Only{" "}
        <code>&lt;CopilotKitProvider&gt;</code> matches the documented shape,
        which is why this app uses it.
      </Callout>

      <Panel
        title="Where the log is wired"
        description="Read from disk — this is the provider the whole app runs under."
      >
        <SourceCode file="frontend/src/components/providers.tsx" />
      </Panel>

      <Panel title="Error codes">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[34rem] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500 dark:border-slate-700">
                <th className="pb-2 pr-4 font-medium">Code</th>
                <th className="pb-2 font-medium">Meaning</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {CODES.map(([code, meaning]) => (
                <tr key={code}>
                  <td className="py-2 pr-4 font-mono text-xs text-slate-800 dark:text-slate-100">
                    {code}
                  </td>
                  <td className="py-2 text-slate-600 dark:text-slate-400">
                    {meaning}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
          <code>CopilotChat</code> also accepts an <code>onError</code>, scoped
          to that chat&apos;s agent. It fires in addition to the provider
          handler rather than replacing it.
        </p>
      </Panel>

      <Panel title="The demo page">
        <SourceCode file="frontend/src/app/troubleshooting/error-debugging/demo-chat/page.tsx" />
      </Panel>
    </>
  );
}
