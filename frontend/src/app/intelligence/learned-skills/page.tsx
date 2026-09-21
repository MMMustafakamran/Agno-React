import { RouteHeader } from "@/components/route-header";
import { SourceCode } from "@/components/source-code";
import { Callout, Panel, TryIt } from "@/components/ui";

const ADAPTER_TABLE = `| Framework                 | Package                                  |
| ------------------------- | ---------------------------------------- |
| BuiltInAgent              | @copilotkit/runtime/v2                   |  ← added 2026-09-21
| LangGraph Python          | copilotkit-intelligence-langgraph        |
| LangGraph TypeScript      | @copilotkit/intelligence-langgraph       |
| Mastra                    | @copilotkit/intelligence-mastra          |
| Google ADK                | copilotkit-intelligence-adk              |
| Microsoft Agent Framework | CopilotKit.Intelligence.AgentFramework   |

                      ← still no Agno row, on the /agno page`;

const TSC_OUTPUT = `$ npx tsc --noEmit      # built-in-agent.ts, suppressions removed
built-in-agent.ts(40,3): error TS2353: Object literal may only specify known
  properties, and 'learnedSkills' does not exist in type
  'BuiltInAgentConfiguration'.
built-in-agent.ts(51,3): error TS2353: Object literal may only specify known
  properties, and 'learnedSkills' does not exist in type
  'BuiltInAgentAISDKFactoryConfig | BuiltInAgentClassicConfig'.
built-in-agent.ts(52,35): error TS2339: Property 'learnedSkills' does not
  exist on type 'AgentFactoryContext'.

$ # and the type the page says to import to annotate a factory context:
probe.ts(1,15): error TS2724: '"@copilotkit/runtime/v2"' has no exported
  member named 'BuiltInAgentFactoryContext'. Did you mean
  'AgentFactoryContext'?

installed @copilotkit/runtime 1.72.0 (declared ^1.72.0)
learnedSkills and BuiltInAgentFactoryContext first ship in 1.73.0`;

const PYPI = `$ curl -o /dev/null -w '%{http_code}' https://pypi.org/pypi/copilotkit-intelligence-runtime/json
404
$ curl -o /dev/null -w '%{http_code}' https://pypi.org/pypi/copilotkit-intelligence-langgraph/json
404
$ curl -o /dev/null -w '%{http_code}' https://pypi.org/pypi/copilotkit-intelligence-adk/json
404`;

export default function Page() {
  return (
    <>
      <RouteHeader path="/intelligence/learned-skills" />

      <Panel title="What it demonstrates">
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          Automatic learned skill delivery is meant to put one Learning
          container&apos;s published skills in front of an agent without a CLI
          download or a restart. A framework adapter adds an alphabetical
          catalog and two tools —{" "}
          <code>copilotkit_load_skill</code> and{" "}
          <code>copilotkit_read_skill_file</code> — and the model decides when
          to load a skill. This route is where that would be wired for the Agno
          backend this repo runs.
        </p>
        <div className="mt-4">
          <TryIt
            prompts={[
              "List the skills you can load, then load the refund-policy skill and follow it.",
            ]}
            expect="The agent calls copilotkit_load_skill, reads SKILL.md, and answers following the published skill."
            fail="What actually happens: the agent answers from its own instructions. Neither tool exists — the page is published under /agno and Agno is not in its adapter table."
          />
        </div>
      </Panel>

      <Callout tone="warn" title="The new BuiltInAgent option does not exist on the installed runtime">
        The 2026-09-21 sync added a <code>BuiltInAgent</code> row at the top of
        the adapter table and a section for it: set{" "}
        <code>learnedSkills</code> on the agent, no adapter package required,
        just <code>@copilotkit/runtime/v2</code>. That is the first code on this
        page a reader in the Agno section can reach for. It does not compile
        here: <code>learnedSkills</code> is not an option on any{" "}
        <code>BuiltInAgent</code> config in the installed runtime{" "}
        <strong>1.72.0</strong>, the factory context has no such field, and{" "}
        <code>BuiltInAgentFactoryContext</code>, which the page tells you to
        import to annotate one, is not exported. All three land in{" "}
        <strong>1.73.0</strong>, published after this text; the page states no
        version floor. Both snippets are in{" "}
        <code>built-in-agent.ts</code> verbatim, errors acknowledged in place,
        imported by nothing.
        <pre className="mt-3 overflow-x-auto rounded bg-slate-900 p-3 text-xs text-slate-100">
          {TSC_OUTPUT}
        </pre>
      </Callout>

      <Callout tone="warn" title="A BuiltInAgent is not an Agno agent">
        The new row is the page&apos;s answer for a reader with no framework
        adapter, but a <code>BuiltInAgent</code> replaces the agent: it calls
        the model itself from the runtime. Following it in this section means
        the Agno service stops being the thing under test, and the page never
        says so. Nothing on the page connects skill delivery to an agent reached
        over AG-UI, which is every agent in the Agno guide.
      </Callout>

      <Callout tone="warn" title="Agno is still not in the adapter table, on the Agno page">
        This page is served at{" "}
        <code>/agno/intelligence/learned-skills</code>. Its &ldquo;Choose an
        adapter&rdquo; table now lists six rows, BuiltInAgent, LangGraph
        Python, LangGraph TypeScript, Mastra, Google ADK and Microsoft Agent
        Framework, and Agno is still not one of them. The page then says
        &ldquo;Attach an adapter to the agents that need skills&rdquo; without
        acknowledging that a reader in this section has no adapter to attach.
        Nothing marks the feature as unsupported for Agno; it is simply absent,
        which reads as an oversight rather than a decision.
        <pre className="mt-3 overflow-x-auto rounded bg-slate-900 p-3 text-xs text-slate-100">
          {ADAPTER_TABLE}
        </pre>
      </Callout>

      <Callout tone="warn" title="The generic Python client it falls back to does not exist either">
        The page says &ldquo;Python uses{" "}
        <code>copilotkit-intelligence-runtime</code>&rdquo;, which would be the
        obvious thing to reach for without a framework adapter. That package is
        not on PyPI, and neither are the two Python adapters listed for other
        frameworks. Checked 2026-09-16. The TypeScript packages{" "}
        <em>are</em> published (both 1.71.2, 2026-09-14), so the Python side is
        the gap rather than the feature being unreleased.
        <pre className="mt-3 overflow-x-auto rounded bg-slate-900 p-3 text-xs text-slate-100">
          {PYPI}
        </pre>
      </Callout>

      <Callout tone="warn" title="“Deployment requirements” admits this at the bottom, not the top">
        The page&apos;s closing section: “The server migration and v1 delivery
        endpoint must deploy before adapters rely on them. Each adapter also
        requires a published canonical client version with the learned-snapshot
        operation.” That is the page saying the feature may not be live — placed
        after every setup snippet, with nothing earlier marked unavailable.
      </Callout>

      <Callout tone="warn" title="One page, three sections, none of them able to follow it">
        The same page is served byte-identically under <code>/agno</code>,{" "}
        <code>/ms-agent-python</code> and <code>/deepagents</code>, differing
        only in the flavour inside its own links. Deep Agents maps to the
        LangGraph Python adapter, which 404s. The Microsoft Agent Framework row
        is a .NET 9 package under a Python section. Agno has no row at all.
      </Callout>

      <Callout tone="premium" title="Not exercised here">
        Everything past installation: the freshness window and shared refresh,
        per-invocation snapshot pinning, <code>latest</code> versus an exact{" "}
        <code>CPK_INTELLIGENCE_SKILLS_REVISION</code>, revocation blocking new
        invocations, the stale-snapshot fallback, and the read-only status
        fields. All of it needs an adapter that does not exist for this
        framework, plus a provisioned Learning container with published skills.
      </Callout>

      <Callout tone="info" title="Read tools: the new section changes what an empty snapshot does">
        &ldquo;Both tools remain registered even when the snapshot is
        empty&rdquo; became &ldquo;The framework adapters keep both tools
        registered even when the snapshot is empty.{" "}
        <code>BuiltInAgent</code> omits both tools for an empty snapshot; its
        factory receives <code>tools: {"{}"}</code>.&rdquo; So the same empty
        container gives a model two registered tools under one adapter and none
        under another, and only the paragraph under &ldquo;Read tools&rdquo;
        says which.
      </Callout>

      <Panel title="Source">
        <SourceCode file="frontend/src/app/intelligence/learned-skills/built-in-agent.ts" />
        <div className="mt-4">
          <SourceCode file="frontend/src/app/intelligence/learned-skills/demo-chat/page.tsx" />
        </div>
      </Panel>
    </>
  );
}
