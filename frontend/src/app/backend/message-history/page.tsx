import { RouteHeader } from "@/components/route-header";
import { SourceCode } from "@/components/source-code";
import { Callout, CodeBlock, Panel, TryIt } from "@/components/ui";

// "Trim an agent you construct yourself", verbatim. Quoted, not mounted: the
// agent URL is a placeholder and `YourApp` is never defined.
const SELF_MANAGED_SNIPPET = `import { HttpAgent } from "@ag-ui/client";
import { CopilotKit } from "@copilotkit/react-core/v2";
import { lastTurnOnly, TrimHistoryMiddleware } from "./trim-history";

const supportAgent = new HttpAgent({ url: "https://agents.example.com/support" });
supportAgent.use(new TrimHistoryMiddleware(lastTurnOnly));

<CopilotKit selfManagedAgents={{ "support-agent": supportAgent }}>
  <YourApp />
</CopilotKit>;`;

const DIR = "frontend/src/app/api/copilotkit-trimmed/[[...slug]]";

export default function Page() {
  return (
    <>
      <RouteHeader path="/backend/message-history" />

      <Panel title="What it demonstrates">
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          CopilotKit forwards the whole transcript on every run. For an agent
          that stores its own history that is a second copy, and the page shows
          three ways to forward less: a <code>messageFilter</code> prop on the
          provider, an AG-UI middleware attached inside the runtime, and the same
          middleware on an agent you construct yourself.
        </p>
        <div className="mt-4">
          <TryIt
            prompts={["My name is Sam.", "What is my name?"]}
            expect="Both tabs answer the first prompt. On this Agno backend neither remembers the name: observed 2026-09-22, the AgentOS AG-UI endpoint answered from the last user message alone, even when sent the full transcript. So the answer cannot tell the tabs apart here; the difference is in what the runtime forwards."
            fail="The Runtime middleware tab errors or never answers: /api/copilotkit-trimmed could not reach the agent at AGENT_URL."
          />
        </div>
      </Panel>

      <Callout tone="warn" title="messageFilter: resolved at 1.73.3, failed at 1.72.0, no minimum version stated">
        The page&apos;s first and recommended recipe,{" "}
        <code>messageFilter=&#123;(messages) =&gt; messages.slice(-1)&#125;</code>{" "}
        on <code>&lt;CopilotKit&gt;</code>, was not a prop on{" "}
        <code>@copilotkit/react-core</code> 1.72.0 or 1.73.0: a type error, and
        at runtime an ignored prop. The demo mounted it verbatim under a{" "}
        <code>@ts-expect-error</code> so the typecheck would fail the day a
        release added it. On 2026-09-23, after upgrading to the installed{" "}
        <strong>1.73.3</strong> (declared <code>^1.73.3</code>), the directive
        was reported unused (TS2578) and was removed; the recipe now typechecks
        as published. The page still states no minimum version. Whether it
        trims the request body at runtime has not been observed on 1.73.3.
      </Callout>

      <Callout tone="info" title="The middleware works as published">
        <code>trim-history.ts</code> compiles on <code>@ag-ui/client</code>{" "}
        0.0.59 and the page&apos;s own check passes (
        <code>trim-history: forwarded only the answered call, next to its result</code>
        ). Two gaps around it. The runtime snippet reads{" "}
        <code>process.env.AGENT_URL!</code>, which the page never defines; the
        route supplies it, marked. And the check script&apos;s line{" "}
        <code>answers.add(trimmedParallel[i].toolCallId)</code> is a TS2339 error
        as published, because the loop condition does not narrow the element it
        reads again. It runs; it does not typecheck.
      </Callout>

      <Callout tone="info" title="On Agno, there is no second copy to trim">
        The page is written for agents that store their own history. This
        backend&apos;s Agno agent has a <code>db</code> but no{" "}
        <code>add_history_to_context</code>, and its AG-UI endpoint answered
        from the last user message alone. Sent{" "}
        <em>My name is Sam</em>, <em>Ok</em>, <em>What is my name?</em> in one
        run, it answered <code>UNKNOWN</code> directly and through{" "}
        <code>/api/copilotkit-trimmed</code> alike; asked across two runs on one
        thread, also <code>UNKNOWN</code>. So trimming is harmless here and
        changes no answer. The page never says which integrations it applies
        to, and Agno is not in its list of history-keeping backends.
      </Callout>

      <Panel title="The demo">
        <SourceCode file="frontend/src/app/backend/message-history/demo-chat/page.tsx" />
      </Panel>

      <Panel title="Trim inside the runtime" description="The page's route, mounted at /api/copilotkit-trimmed.">
        <SourceCode file={`${DIR}/route.ts`} />
      </Panel>

      <Panel title="Write a filter for middleware" description="trim-history.ts, verbatim.">
        <SourceCode file={`${DIR}/trim-history.ts`} />
      </Panel>

      <Panel
        title="Trim an agent you construct yourself"
        description="Quoted, not mounted. selfManagedAgents is Enterprise plan."
      >
        <CodeBlock filename="app/page.tsx" language="tsx" code={SELF_MANAGED_SNIPPET} />
      </Panel>
    </>
  );
}
