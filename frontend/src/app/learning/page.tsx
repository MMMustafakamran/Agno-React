import { RouteHeader } from "@/components/route-header";
import { SourceCode } from "@/components/source-code";
import { Callout, Panel, TryIt } from "@/components/ui";

// "Connect your agent", added 2026-09-21. The page's blocks, verbatim as of
// the 2026-09-23 sync (the key placeholder changed from `your-project-key`).
const DELIVERY_LOGIN = `npx copilotkit@latest login
npx copilotkit@latest project select`;

const DELIVERY_ENV = `CPK_INTELLIGENCE_API_KEY=cpk-...
CPK_INTELLIGENCE_LEARNING_CONTAINER_ID=expense-review`;

// "Use downloaded Skills", verbatim as of the 2026-09-23 sync.
const DOWNLOAD = `npx copilotkit@latest login
npx copilotkit@latest project select
npx copilotkit@latest skills download expense-review --output ./learned-skills`;

const SERVER_LOG = `POST /api/copilotkit-learning/agent/expense-agent/run  → 404 {"error":"Failed to initialize thread"}
  Intelligence platform error 404:
  {"code":"LEARNING_CONTAINER_NOT_FOUND","message":"The Learning Container was not found in this project."}

POST /api/copilotkit-learning/agent/default/run        → 200  "Hello, how are you today?"`;

export default function Page() {
  return (
    <>
      <RouteHeader path="/learning" />

      <Panel title="What it demonstrates">
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          Learning groups Threads from one kind of work into a container,
          analyzes completed runs into Insights, and proposes Skills you review
          and publish. The only code the page asks for is one runtime callback,{" "}
          <code>getLearningContainerId</code>, that decides which container a
          new Thread joins. This route mounts that runtime verbatim at{" "}
          <code>/api/copilotkit-learning</code> and runs one agent it assigns and
          one it does not.
        </p>
        <div className="mt-4">
          <TryIt
            prompts={[
              "On expense-agent: Review this expense: $42 team lunch, receipt attached.",
              "On default: Say hello in five words.",
            ]}
            expect="Both agents answer; expense-agent's Thread shows up in the expense-review container in the dashboard."
            fail="What actually happens here: expense-agent never answers — see below. default answers."
          />
        </div>
      </Panel>

      <Callout tone="warn" title="A container ID that does not exist breaks the chat, not just the assignment">
        The page&apos;s example routes <code>expense-agent</code> to{" "}
        <code>expense-review</code>. That container does not exist in this
        project, and the result is not an unassigned Thread: the platform
        refuses to create the Thread at all, the run fails, and the chat shows
        the user&apos;s message and then nothing — no reply, no error in the
        transcript. <code>default</code>, on the same runtime and backend, answers
        normally. The page&apos;s troubleshooting row for this case reads
        &quot;A Thread never appears in the container&quot;, which describes a
        much milder failure than the one you get.
        <pre className="mt-3 overflow-x-auto rounded bg-slate-900 p-3 text-xs text-slate-100">
          {SERVER_LOG}
        </pre>
      </Callout>

      <Callout tone="warn" title="The snippet leans on two things it never defines">
        <code>new CopilotRuntime({"{ agents, intelligence, identifyUser }"})</code>{" "}
        — <code>agents</code> and <code>identifyUser</code> appear nowhere else
        on the page. They are supplied in <code>lib/learning-runtime.ts</code>,
        above the verbatim block, and marked as this harness&apos;s.
      </Callout>

      <Callout tone="warn" title="No version floor">
        <code>getLearningContainerId</code> exists on{" "}
        <code>CopilotKitIntelligence</code> from runtime 1.70; on 1.69.x, which
        this repo&apos;s lockfile pinned before 1.72.0, the option is a type
        error. It typechecks on the installed <strong>1.73.3</strong> (declared{" "}
        <code>^1.73.3</code>). The page names no version and never mentions the
        deprecated <code>ɵlearning</code> option that older runtimes have
        instead. The same gap repeats one page over: the learned-skills{" "}
        <code>learnedSkills</code> option failed on 1.72.0, compiles on 1.73.3,
        and the page states no minimum version.
      </Callout>

      <Callout tone="warn" title="The new delivery steps end at an adapter Agno does not have">
        The 2026-09-21 sync replaced the one-line pointer to learned skills with
        three steps: enable delivery on the container, connect your agent, and
        verify it in a new invocation. The 2026-09-23 sync dropped the list of
        frameworks from step two. It now says &ldquo;Pick the adapter for the
        agent you already run.&rdquo; Agno is not in the adapter table that link
        leads to, so on the Agno page the steps stop being followable at exactly
        the point they become concrete. If the agent server has no key yet, the
        step now signs in and selects the project first, then gives the
        environment block. See{" "}
        <a
          href="/intelligence/learned-skills"
          className="text-[var(--accent)] underline underline-offset-4"
        >
          the Skill delivery route
        </a>{" "}
        for what that page does and does not offer this backend.
        <pre className="mt-3 overflow-x-auto rounded bg-slate-900 p-3 text-xs text-slate-100">
          {DELIVERY_LOGIN}
        </pre>
        <pre className="mt-3 overflow-x-auto rounded bg-slate-900 p-3 text-xs text-slate-100">
          {DELIVERY_ENV}
        </pre>
        Neither variable is read anywhere in this harness: with no adapter,
        nothing consumes them. The container id in the block is{" "}
        <code>expense-review</code>, the same non-existent container the runtime
        snippet above uses, while the learned-skills page configures{" "}
        <code>containerId: &quot;support-learning&quot;</code> for the same job.
      </Callout>

      <Callout tone="warn" title="The new “Collect runs and deliver Skills” section leads with an unpublished Python adapter">
        The 2026-09-23 sync added a section that tells the reader: &ldquo;For
        agent setup, use the Mastra, LangGraph TypeScript, or LangGraph Python
        example.&rdquo; LangGraph Python is one of the three headline options,
        and its package, <code>copilotkit-intelligence-langgraph</code>, is not
        on PyPI (404, checked 2026-09-23). The Skill delivery page it links to
        now marks that package &ldquo;pending release&rdquo;; this page does
        not. Agno is not among the headline options or in the second list of
        Google ADK, BuiltInAgent and Microsoft Agent Framework.
      </Callout>

      <Callout tone="warn" title="The daily schedule and the Thread threshold are dashboard-only claims">
        The sync also added a &ldquo;Choose the daily schedule&rdquo; step
        (organization default <strong>02:00 UTC</strong>, per-project override,{" "}
        <strong>15 eligible Threads</strong> before an automatic run, a{" "}
        <em>Next scheduled run</em> countdown) and swapped &ldquo;Run
        Learning&rdquo; for &ldquo;Start manual run now&rdquo;. All of it is
        dashboard UI behind a login this harness does not drive, so none of it
        is exercised or contradicted here. The page hedges its own number
        (&ldquo;Use the count shown in your container if your deployment has a
        different threshold&rdquo;), which leaves a reader with no way to know
        the threshold without the dashboard open.
      </Callout>

      <Callout tone="premium" title="Not exercised here">
        Creating a container, Run Learning, reviewing Insights, approving a
        Skill, and <code>npx copilotkit@latest skills download</code> are
        dashboard and CLI steps behind a login this harness does not drive. They
        are not on the clip, and nothing here says whether they work. The
        page&apos;s download block, verbatim:
        <pre className="mt-3 overflow-x-auto rounded bg-slate-900 p-3 text-xs text-slate-100">
          {DOWNLOAD}
        </pre>
      </Callout>

      <Panel title="Source">
        <SourceCode file="frontend/src/lib/learning-runtime.ts" />
        <div className="mt-4">
          <SourceCode file="frontend/src/app/learning/demo-chat/page.tsx" />
        </div>
      </Panel>
    </>
  );
}
