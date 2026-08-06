import { RouteHeader } from "@/components/route-header";
import { SourceCode, SourceCodeGroup } from "@/components/source-code";
import { Callout, Panel, TryIt } from "@/components/ui";

export default function Page() {
  return (
    <>
      <RouteHeader path="/frontend-tools" />

      <Panel title="What it demonstrates">
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          Tools the agent calls that execute in the user&apos;s browser rather
          than in the agent process. The handler runs client-side, so it can
          touch React state, browser APIs, and anything else only the frontend
          has access to — then returns a string the model reads as the tool
          result.
        </p>
        <div className="mt-4">
          <TryIt
            prompts={[
              "Say hello to Damien",
              "Change the theme to violet",
              "Bookmark the CopilotKit docs at https://docs.copilotkit.ai",
            ]}
            expect="The panel updates the moment the tool call completes, and the agent replies confirming what it did. The theme change persists across routes."
            fail="The agent says it did something but no panel changes — the tool name on the frontend and the Python side have drifted apart."
          />
        </div>
      </Panel>

      <Panel
        title="Both halves of a frontend tool"
        description="The name is the contract — it must be byte-identical on both sides, which is why the Python functions are camelCase."
      >
        <SourceCodeGroup
          files={[
            { file: "frontend/src/components/global-frontend-tools.tsx" },
            { file: "backend/tools/frontend_tools.py" },
          ]}
        />
      </Panel>

      <Callout tone="warn" title="Why these are registered globally">
        The docs register frontend tools on the page that uses them. This repo
        registers all four at the app root instead. The Agno agent declares every
        tool on <em>every</em> conversation, so a chat on any route can call one
        — and a tool call with no registered handler never returns a result,
        which leaves the run hanging forever. Page-scoped registration would let
        every other route deadlock its own chat.
      </Callout>

      <Panel title="The demo page">
        <SourceCode file="frontend/src/app/frontend-tools/demo-chat/page.tsx" />
      </Panel>
    </>
  );
}
