import { RouteHeader } from "@/components/route-header";
import { SourceCode } from "@/components/source-code";
import { Callout, Panel, TryIt } from "@/components/ui";

const ADAPTER_TABLE = `| Framework                 | Package                                  |
| ------------------------- | ---------------------------------------- |
| LangGraph Python          | copilotkit-intelligence-langgraph        |
| LangGraph TypeScript      | @copilotkit/intelligence-langgraph       |
| Mastra                    | @copilotkit/intelligence-mastra          |
| Google ADK                | copilotkit-intelligence-adk              |
| Microsoft Agent Framework | CopilotKit.Intelligence.AgentFramework   |

                      ← no Agno row, on the /agno page`;

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

      <Callout tone="warn" title="Agno is not in the adapter table, on the Agno page">
        This page is served at{" "}
        <code>/agno/intelligence/learned-skills</code>. Its &ldquo;Choose an
        adapter&rdquo; table lists five frameworks — LangGraph Python, LangGraph
        TypeScript, Mastra, Google ADK, Microsoft Agent Framework — and Agno is
        not one of them. The page then says &ldquo;Attach an adapter to the
        agents that need skills&rdquo; without acknowledging that a reader in
        this section has no adapter to attach. Nothing marks the feature as
        unsupported for Agno; it is simply absent, which reads as an oversight
        rather than a decision.
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

      <Panel title="Source">
        <SourceCode file="frontend/src/app/intelligence/learned-skills/demo-chat/page.tsx" />
      </Panel>
    </>
  );
}
