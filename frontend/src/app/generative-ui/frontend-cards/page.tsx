import { RouteHeader } from "@/components/route-header";
import { SourceCode, SourceCodeGroup } from "@/components/source-code";
import { Callout, Panel, TryIt } from "@/components/ui";

export default function Page() {
  return (
    <>
      <RouteHeader path="/generative-ui/frontend-cards" />

      <Panel title="What it demonstrates">
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          A card your app puts in the chat on its own — a job finished, a
          socket pushed something — with no agent turn behind it. It is a
          message with <code>role: &quot;activity&quot;</code>: the transcript
          renders it through a registered renderer, and it is stripped from
          every run request, so the model never sees it.
        </p>
        <div className="mt-4">
          <TryIt
            prompts={[
              "Click “Simulate: deployment finished”, then ask: Have you been shown any deployment card?",
            ]}
            expect="The card appears in the transcript. After the turn, the probe row reads agent.messages = activity, user, assistant and run payload = user — and the agent says it saw no card."
            fail="The card never renders, or the payload row lists activity (the agent received it)."
          />
        </div>
      </Panel>

      <Callout tone="success" title="The central claim holds">
        Checked against the request that actually left the browser, not the
        library&apos;s own bookkeeping: with a card in the transcript, the run
        payload carried only <code>user</code>, and the agent answered that it
        had been shown no card. Runtime and react-core 1.71.0.
      </Callout>

      <Callout tone="warn" title="A card added before the runtime connects is silently lost">
        Until <code>/info</code> answers, <code>useAgent()</code> returns a
        provisional agent (<code>isReady: false</code>). <code>addMessage</code>{" "}
        on it succeeds and even updates <code>agent.messages</code> — and when
        the real agent replaces it a moment later, the card is gone, with no
        error anywhere. Reproduced 3 of 3 by clicking before <code>/info</code>{" "}
        returned; it also happened unprompted on the first cold load. The
        page&apos;s warning is about agents you construct yourself; it never
        mentions <code>isReady</code>, which is the only thing that tells you a
        socket event arriving at startup will be dropped.
      </Callout>

      <Callout tone="warn" title="Step 3 is never wired to step 2">
        Step 2&apos;s <code>Page</code> renders <code>&lt;CopilotChat /&gt;</code>{" "}
        and nothing else; step 3 builds <code>&lt;DeploymentWatcher /&gt;</code>{" "}
        and never says where it goes. It has to be under the provider for{" "}
        <code>useAgent()</code> to work — this route mounts it there. And its
        socket is <code>wss://example.com/deployments</code>, a placeholder that
        404s the handshake, so mounted as published it never adds a card. The
        demo&apos;s button calls the same <code>addMessage</code>, which the page
        names as an equivalent trigger.
      </Callout>

      <Callout tone="info" title="Integration-dependent: the bare `useAgent()` and `<CopilotChat />`">
        Neither passes an <code>agentId</code>, so both resolve to{" "}
        <code>&quot;default&quot;</code>. That works here only because this
        repo&apos;s runtime registers an agent under <code>default</code>. The
        page is byte-identical under every framework prefix, so a reader whose
        runtime names its agent anything else — as the Deep Agents Quickstart
        does — gets code that targets an agent that does not exist.
      </Callout>

      <Panel title="Source">
        <SourceCodeGroup
          files={[
            { file: "frontend/src/app/generative-ui/frontend-cards/event-card.tsx" },
            { file: "frontend/src/app/generative-ui/frontend-cards/deployment-watcher.tsx" },
          ]}
        />
        <div className="mt-4">
          <SourceCode file="frontend/src/app/generative-ui/frontend-cards/demo-chat/page.tsx" />
        </div>
      </Panel>
    </>
  );
}
