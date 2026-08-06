import { RouteHeader } from "@/components/route-header";
import { SourceCode, SourceCodeGroup } from "@/components/source-code";
import { Callout, Panel, TryIt } from "@/components/ui";

export default function Page() {
  return (
    <>
      <RouteHeader path="/generative-ui/tool-rendering" />

      <Panel title="What it demonstrates">
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          A tool call is an event in the stream, not just a function result — so
          you can render it. <code>useRenderTool</code> attaches a component to
          one tool by name, and <code>useDefaultRenderTool</code> registers a
          wildcard that catches everything without a dedicated renderer.
        </p>
        <p className="mt-3 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          The renderer name must equal the Python tool name exactly. That is the
          single most common reason a tool runs but its UI never appears.
        </p>
        <div className="mt-4">
          <TryIt
            prompts={[
              "What's the weather in Tokyo?",
              "Change the theme to violet",
            ]}
            expect="The weather call renders the bordered card, moving from 'Checking…' to a result. The theme change has no dedicated renderer, so it renders the plain monospace fallback row instead."
            fail="Tool calls render as raw JSON or not at all — the renderer name and the tool name disagree."
          />
        </div>
      </Panel>
      
      <Panel title="Source">
        <SourceCode file="frontend/src/app/generative-ui/tool-rendering/demo-chat/page.tsx" />
      </Panel>

      <Panel
        title="The tools being rendered"
        description="Ordinary server-side Agno tools — nothing about them is CopilotKit-specific."
      >
        <SourceCodeGroup files={[{ file: "backend/tools/backend_tools.py" }]} />
      </Panel>
    </>
  );
}
