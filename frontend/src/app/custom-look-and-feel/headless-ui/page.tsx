import { RouteHeader } from "@/components/route-header";
import { SourceCode } from "@/components/source-code";
import { Callout, Panel, TryIt } from "@/components/ui";

export default function Page() {
  return (
    <>
      <RouteHeader path="/custom-look-and-feel/headless-ui" />

      <Panel title="What it demonstrates">
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          The slot system customises CopilotKit&apos;s chat. This replaces it
          entirely: the bubbles, the input, the thinking indicator, and the
          layout are all hand-written. CopilotKit still supplies the message
          list, the streaming, and tool-call rendering — you just stop using its
          components to display them.
        </p>
        <p className="mt-3 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          Two hooks carry it. <code>useAgent</code> exposes{" "}
          <code>messages</code>, <code>state</code>, and{" "}
          <code>isRunning</code>; <code>useCopilotKit</code> gives{" "}
          <code>runAgent</code> and <code>stopAgent</code>. Note the demo shares
          the app-wide provider, so its conversation is the same one the
          Programmatic Control route shows.
        </p>
        <div className="mt-4">
          <TryIt
            prompts={["Tell me a joke", "Give me a fun fact about Mars"]}
            expect="Messages stream into the custom bubbles, 'Thinking…' appears while running, and tool calls still render — including the frontend tools registered at the app root."
            fail="Send does nothing, or the assistant reply never appears — copilotkit.runAgent() is not being awaited, or the agent id is wrong."
          />
        </div>
      </Panel>

      <Panel
        title="Source"
        description="Read straight from this repository — this is the file the demo route runs."
      >
        <SourceCode file="frontend/src/app/custom-look-and-feel/headless-ui/demo-chat/page.tsx" />
        <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
          Compare against the doc page linked above. Two differences worth
          noting: the doc imports <code>randomUUID</code> from{" "}
          <code>@copilotkit/shared</code> where this uses the platform&apos;s{" "}
          <code>crypto.randomUUID()</code> to avoid depending on a transitive
          package, and the tool-message lookup needs an explicit type predicate
          because <code>.find</code> does not narrow the message union.
        </p>
      </Panel>
    </>
  );
}
