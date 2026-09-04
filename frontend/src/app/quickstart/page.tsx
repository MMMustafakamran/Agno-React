import { RouteHeader } from "@/components/route-header";
import { SourceCode, SourceCodeGroup } from "@/components/source-code";
import { Callout, Panel, TryIt } from "@/components/ui";

export default function Page() {
  return (
    <>
      <RouteHeader path="/quickstart" />

      <Panel title="What it demonstrates">
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          The smallest end-to-end path: a provider at the app root, a runtime
          route that binds an <code>AgnoAgent</code>, and one chat component.
          Everything else in this harness is a variation on these three pieces.
        </p>
        <div className="mt-4">
          <TryIt
            prompts={["Can you tell me a joke?", "What can you do?"]}
            expect="Tokens stream in a word at a time and the reply renders as markdown."
            fail="Nothing streams, or an error appears — the agent process is probably down. Check the connection panel on the home page."
          />
        </div>
      </Panel>

      <Panel title="The demo">
        <SourceCode file="frontend/src/app/quickstart/demo-chat/page.tsx" />
      </Panel>

      <Panel
        title="The two files that make it work"
        description="Both read from this repo, so they can be diffed against the doc's samples directly."
      >
        <SourceCodeGroup
          files={[
            { file: "frontend/src/app/api/copilotkit/[[...slug]]/route.ts" },
            { file: "backend/main.py" },
          ]}
          note={
            <>
              One deliberate difference from the doc sample: a second agent id,
              so the Copilot Runtime route can demonstrate routing against a
              real second registration.
            </>
          }
        />
        <div className="mt-4">
          <Callout tone="premium" title="Intelligence is optional here">
            The doc's route now wires <code>CopilotKitIntelligence</code> and{" "}
            <code>identifyUser</code> using the project key from step 1 — this
            sync renamed it to <code>CPK_INTELLIGENCE_API_KEY</code> and stopped
            calling it a license key, with the placeholder going from{" "}
            <code>your_license_key</code> to <code>cpk-...</code>. This route
            does the same when either spelling is set, and otherwise takes the
            fallback the doc describes: SSE with an in-memory runner, so chat
            works while Threads and the Inspector stay locked.
          </Callout>
        </div>
      </Panel>

      <Panel title="Provider and agent">
        <SourceCodeGroup
          files={[
            { file: "frontend/src/components/providers.tsx" },
            { file: "backend/agent.py" },
          ]}
          note={
            <>
              The doc&apos;s quickstart wraps the app in{" "}
              <code>&lt;CopilotKit&gt;</code>. This repo uses{" "}
              <code>&lt;CopilotKitProvider&gt;</code> because only that one
              exposes the <code>{"{ error, code, context }"}</code> handler the
              Error Debugging page documents
            </>
          }
        />
        <div className="mt-4">
          <Callout title="Why the relative runtimeUrl works">
            <code>/api/copilotkit</code> resolves because Next.js serves both
            the app and the runtime from one origin. A client-only frontend has
            no shared origin and needs a standalone runtime server plus an
            absolute URL.
          </Callout>
        </div>
      </Panel>
    </>
  );
}
