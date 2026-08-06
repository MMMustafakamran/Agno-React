import { RouteHeader } from "@/components/route-header";
import { SourceCode, SourceCodeGroup } from "@/components/source-code";
import { Callout, Panel, TryIt } from "@/components/ui";

export default function Page() {
  return (
    <>
      <RouteHeader path="/human-in-the-loop" />

      <Panel title="How it differs from a normal frontend tool">
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          A tool registered with <code>useFrontendTool</code> completes when its{" "}
          <code>handler</code> returns. <code>useHumanInTheLoop</code> has no
          handler at all — it renders UI and hands you a <code>respond</code>{" "}
          function, and the run stays suspended until you call it. Whatever you
          pass to <code>respond</code> becomes the tool result the model reads
          next, so the agent&apos;s following step genuinely depends on the
          user&apos;s choice.
        </p>
        <div className="mt-4">
          <TryIt
            prompts={[
              "Can you show me two good options for a restaurant name?",
              "Give me two choices for a weekend trip",
            ]}
            expect="Two buttons render in the message stream. Nothing further streams until you click one; then the agent continues, aware of your choice."
            fail="The agent describes two options as plain text with no buttons, or continues without waiting — the tool name did not match the Python declaration."
          />
        </div>
      </Panel>

      <Panel
        title="Both halves"
        description="Note the Python body is empty: with external_execution the function never runs, it only defines the schema and the wire name."
      >
        <SourceCodeGroup
          files={[
            {
              file: "frontend/src/components/global-frontend-tools.tsx",
              region: "human-in-the-loop",
            },
            { file: "backend/tools/frontend_tools.py", region: "offer-options" },
          ]}
        />
      </Panel>

      <Panel title="The demo page">
        <SourceCode file="frontend/src/app/human-in-the-loop/demo-chat/page.tsx" />
      </Panel>
    </>
  );
}
