import { RouteHeader } from "@/components/route-header";
import { SourceCode } from "@/components/source-code";
import { Callout, Panel, TryIt } from "@/components/ui";

const INSTALL_LINE = `the page's install line:

  npm install @copilotkit/core@1.73.0 @copilotkit/react-core@1.73.0 \\
    @copilotkit/runtime@1.73.0 @ag-ui/client@0.0.59 @ag-ui/core@0.0.59 \\
    @typesafe-ai/sdk@0.6.0 rxjs@7.8.1 zod@4.6.5 \\
    @langchain/openai@1.5.13 @langchain/core@1.2.11

package                        pinned     installed here  declared here   (as recorded 2026-09-21)
-----------------------------  ---------  --------------  -----------------
@copilotkit/core               1.73.0     1.72.0          (not declared)
@copilotkit/react-core         1.73.0     1.72.0          ^1.69.2
@copilotkit/runtime            1.73.0     1.72.0          ^1.69.2
@ag-ui/client                  0.0.59     0.0.59          0.0.x
@ag-ui/core                    0.0.59     0.0.59          (not declared)
@typesafe-ai/sdk               0.6.0      ABSENT          (not declared)
rxjs                           7.8.1      7.8.1           (not declared)
zod                            4.6.5      4.4.3           ^4.4.3
@langchain/openai              1.5.13     ABSENT          (not declared)
@langchain/core                1.2.11     1.2.11          (not declared)

declared = frontend/package.json. An earlier revision of this table said
^1.72.0, a working-tree edit that was never committed; the committed file
said ^1.69.2. Since 2026-09-23 all three @copilotkit packages are installed
at 1.73.3, react-core and runtime declared ^1.73.3.`;

const TSC_OUTPUT = `$ npx tsc --noEmit     # every module suppression removed

choose-panel.ts(33,47): error TS2307: Cannot find module '@typesafe-ai/sdk'
  or its corresponding type declarations.
picker-agent.ts(37,28): error TS2307: Cannot find module '@langchain/openai'
  or its corresponding type declarations.
learned-guidance.ts(26,31): error TS2307: Cannot find module
  '@copilotkit/intelligence-langgraph' or its corresponding type declarations.
learned-guidance.ts(35,36): error TS7006: Parameter 'skill' implicitly has an
  'any' type.                        (knock-on: SkillRegistry is any)
learned-guidance.ts(37,34): error TS7006: Parameter 'file'  implicitly ...
learned-guidance.ts(38,17): error TS7006: Parameter 'skill' implicitly ...

$ npx tsc --noEmit     # as shipped, suppressions in place
(no output)

so every line of the recipe that does not touch those three absent packages
compiles against @copilotkit/{core,react-core,runtime} 1.72.0 — one minor below
the 1.73.0 the page pins, with no floor stated and nothing visibly needing it.`;

const SHARED_STATE = `/agno/cookbook/jev-generative-ui  (this page, tracked here)

  const { agent, isReady } = useAgent({ agentId: "picker" });
  ...
  agent.addMessage({ id: crypto.randomUUID(), role: "user", content });
  await copilotkit.runAgent({ agent });

  -> reads agent.state; never writes it. Every user action is a chat message.

/agno/shared-state  (linked from the callout above; NOT tracked here)

  "Create a two-way connection between your UI and agent state."

  const { agent } = useAgent({
    agentId: "shared-state-read-write",
    updates: [UseAgentUpdate.OnStateChanged],
  });
  ...
  agent.setState({ preferences: next, notes });

  "the UI doesn't just observe the agent, it can hand the agent fresh inputs
   ... without going through the chat thread."`;

export default function Page() {
  return (
    <>
      <RouteHeader path="/cookbook/jev-generative-ui" />

      <Panel title="What runs here, and what does not">
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          The recipe builds a workspace picker in two halves. The{" "}
          <strong>prepared controls</strong> are this repo&apos;s own React and
          zod: the catalog, <code>PanelSchema</code> and{" "}
          <code>StateSchema</code>, the <code>Picker</code> component, its form,
          its panel markup and its two button message formats. All of that is
          shipped verbatim and runs. The <strong>Jev decision layer</strong> is
          a third-party service: <code>choosePanel</code> needs{" "}
          <code>@typesafe-ai/sdk</code>, which is not installed, plus a{" "}
          <code>TYPESAFE_API_KEY</code> from TypeSafe. It cannot run here and
          this repo installs nothing for a doc page.
        </p>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[34rem] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500 dark:border-slate-700">
                <th className="pb-2 pr-4 font-medium">Published file</th>
                <th className="pb-2 pr-4 font-medium">Here</th>
                <th className="pb-2 font-medium">State</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {[
                [
                  "lib/workspaces.ts",
                  "cookbook/jev-generative-ui/workspaces.ts",
                  "Runs. Imported by the demo.",
                ],
                [
                  "app/page.tsx",
                  "cookbook/jev-generative-ui/demo-chat/page.tsx",
                  "Runs. Mounted, against an agent id nothing registers.",
                ],
                [
                  "lib/choose-panel.ts",
                  "cookbook/jev-generative-ui/choose-panel.ts",
                  "Cannot run. @typesafe-ai/sdk absent, vendor key required. Imported by nothing.",
                ],
                [
                  "lib/picker-agent.ts",
                  "cookbook/jev-generative-ui/picker-agent.ts",
                  "Cannot run. @langchain/openai absent, and it calls choosePanel. Imported by nothing.",
                ],
                [
                  "app/api/copilotkit/[[...slug]]/route.ts",
                  "cookbook/jev-generative-ui/runtime-route.ts",
                  "Compiles; deliberately outside the route tree. Mounting it would register an agent that throws every turn.",
                ],
                [
                  "lib/learned-guidance.ts",
                  "cookbook/jev-generative-ui/learned-guidance.ts",
                  "Cannot run. @copilotkit/intelligence-langgraph absent, and it needs a Learning container with published Skills. Imported by nothing.",
                ],
              ].map(([published, here, state]) => (
                <tr key={published}>
                  <td className="py-2 pr-4 font-mono text-xs text-slate-800 dark:text-slate-100">
                    {published}
                  </td>
                  <td className="py-2 pr-4 font-mono text-xs text-slate-600 dark:text-slate-400">
                    {here}
                  </td>
                  <td className="py-2 text-slate-600 dark:text-slate-400">
                    {state}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4">
          <TryIt
            prompts={[
              "Show the clarification panel",
              "Show the comparison panel (catalog order, not ranked)",
            ]}
            expect="The published panel markup draws both prepared controls from PanelSchema.parse, and the probe row reads isReady: false with an empty agent.state. Typing a request and pressing Find options does nothing, because the published send() returns early on !isReady."
            fail="A panel that claims a Jev decision was made, or a picker that answers a typed request — nothing here can produce either."
          />
        </div>
      </Panel>

      <Callout tone="warn" title="The Jev half is vendor-gated, and the page does not say so until the install line">
        <code>choosePanel</code> is the recipe. It picks the control and ranks
        the rooms, and everything downstream is markup around its answer. It
        calls <code>TypeSafeClient.systemOne</code> with{" "}
        <code>model: &quot;jev-1.13.0&quot;</code> against{" "}
        <code>@typesafe-ai/sdk@0.6.0</code>, and the key comes from
        docs.typesafe.ai, not from CopilotKit. So a reader arriving from the
        Agno guide needs an account with a third party before any of this works.
        The page mentions that once, in the sentence after the install line, and
        never marks the recipe as vendor-gated above it. The five steps that
        follow read as ordinary Next.js work.
      </Callout>

      <Callout tone="warn" title="1.73.0 is pinned, nothing is shown to need it, and no floor is stated">
        The install line pins three CopilotKit packages at{" "}
        <strong>1.73.0</strong>. This repo has <strong>1.72.0</strong>{" "}
        installed. Every published file that does not touch the two absent
        third-party packages compiles against 1.72.0 —{" "}
        <code>useAgent</code>, <code>useCopilotKit</code>,{" "}
        <code>agent.subscribe</code>, <code>agent.abortRun</code>,{" "}
        <code>copilotkit.runAgent</code>, <code>CopilotRuntime</code> and{" "}
        <code>createCopilotEndpoint</code> are all there. The page gives no
        reason for the pin and states no minimum, so a reader cannot tell
        whether 1.73.0 is required or merely what the author had. Compare §9
        #19, where the same section genuinely does need 1.73.0 and the page
        states no floor at all.
        <pre className="mt-3 overflow-x-auto rounded bg-slate-900 p-3 text-xs text-slate-100">
          {INSTALL_LINE}
        </pre>
        <pre className="mt-3 overflow-x-auto rounded bg-slate-900 p-3 text-xs text-slate-100">
          {TSC_OUTPUT}
        </pre>
      </Callout>

      <Callout tone="warn" title="Four of the ten pinned packages are pinned to what is already here, undeclared">
        <code>@ag-ui/core</code>, <code>rxjs</code> and{" "}
        <code>@langchain/core</code> resolve here at exactly the pinned
        versions — 0.0.59, 7.8.1 and 1.2.11 — but only as transitive
        dependencies, declared by nothing. <code>@ag-ui/client</code> is
        declared as <code>0.0.x</code> and resolves to the pinned 0.0.59.{" "}
        <code>zod</code> is pinned at <strong>4.6.5</strong> while this repo is
        on <strong>4.4.3</strong> (declared <code>^4.4.3</code>), and the
        published schemas parse fine on 4.4.3, so that pin is not a floor the
        code needs either. Exact pins that happen to match a transitive
        resolution are the kind that break quietly: the next{" "}
        <code>@copilotkit/react-core</code> bump can move{" "}
        <code>@ag-ui/core</code> underneath a project that never named it.
      </Callout>

      <Callout tone="warn" title="The recipe says it renders shared agent state; the shared-state page defines that as two-way">
        The callout at the top of the recipe says &ldquo;This recipe renders{" "}
        <a
          href="https://docs.copilotkit.ai/agno/shared-state"
          target="_blank"
          rel="noreferrer"
          className="underline underline-offset-4"
        >
          shared agent state
        </a>
        &rdquo;. Shared State opens with &ldquo;Create a two-way connection
        between your UI and agent state&rdquo; and shows both halves:{" "}
        <code>useAgent</code> with an explicit{" "}
        <code>updates: [UseAgentUpdate.OnStateChanged]</code> to read, and{" "}
        <code>agent.setState</code> from a UI handler to write, &ldquo;without
        going through the chat thread&rdquo;. The Jev recipe does only the read
        half, with a bare <code>useAgent({"{ agentId: \"picker\" }"})</code>, and
        routes every user action back as a chat message. So &ldquo;renders
        shared agent state&rdquo; is accurate and the link under it is not: a
        reader following it arrives at a two-way API this recipe never uses.
        This repo&apos;s own shared-state implementation is the two-way one, on{" "}
        <code>/custom-look-and-feel/programmatic-control</code>. And{" "}
        <code>/agno/shared-state</code> is not tracked here — it sits in{" "}
        <code>sitemap.knownUnmapped</code> — so this is another link out of the
        tested set, like §9 #21 and #22.
        <pre className="mt-3 overflow-x-auto rounded bg-slate-900 p-3 text-xs text-slate-100">
          {SHARED_STATE}
        </pre>
      </Callout>

      <Callout tone="warn" title="Published under /agno, with nothing Agno in it">
        The recipe never mentions Agno, never starts the Python agent this
        section is about, and never uses <code>@ag-ui/agno</code>. It builds its
        own <code>AbstractAgent</code> subclass inside the Next process and
        registers that. The same page is served under the other framework
        prefixes; under this one it is a cookbook entry for a section whose
        whole premise is an external Agno service. Same shape as §9 #19, where
        the Agno page&apos;s adapter table has no Agno row.
      </Callout>

      <Callout tone="warn" title="Two files are only valid concatenated, and one of them does not say so">
        <code>lib/choose-panel.ts</code> is published as three blocks with the
        instruction &ldquo;Build <code>lib/choose-panel.ts</code> from the
        following three blocks, in order. The first opens{" "}
        <code>choosePanel</code>, and the last closes it.&rdquo; That is clear.{" "}
        <code>app/page.tsx</code> is published as three blocks under the same
        title with only &ldquo;build <code>app/page.tsx</code> from the
        following blocks in order&rdquo;, and its first block ends inside the
        body of <code>Picker</code>, after <code>const busy = ...</code>, with a
        trailing blank line inside the fence. Copying any single block of either
        file gives a syntax error, and the copy button on a doc page copies one
        block.
      </Callout>

      <Callout tone="warn" title="The base recipe prompts Jev about guidance it always sends empty">
        <code>choosePanel</code>&apos;s control question says &ldquo;Apply
        relevant publishedGuidance within these rules&rdquo; and every score
        question asks &ldquo;How well does candidate X fit the request and
        relevant publishedGuidance?&rdquo;. In the base recipe{" "}
        <code>respond</code> calls{" "}
        <code>choosePanel(message, state, [], signal)</code> — an empty array,
        always, until the optional Automatic Learning section at the bottom
        replaces it. The prompts ship referring to a value the recipe never
        populates, and nothing says the base version is running with the
        guidance clause dead.
      </Callout>

      <Callout tone="warn" title="The optional Learning extension names an undefined identifier and pins backwards">
        Two problems in the closing section. It says to &ldquo;attach{" "}
        <code>createSkillRegistryMiddleware({"{ registry }"})</code> and invoke
        the result of <code>skills.wrapAgent(agent)</code>&rdquo; — neither{" "}
        <code>skills</code> nor <code>createSkillRegistryMiddleware</code> is
        ever defined or imported anywhere on the page, and the only registry it
        does define is called <code>registry</code>. And it says to install{" "}
        <code>@copilotkit/intelligence-langgraph@1.71.2</code>{" "}
        &ldquo;alongside the pinned stack above&rdquo;, which is the 1.73.0
        stack: an exact pin two minors behind the exact pins it is told to sit
        beside. That package is absent here, and the section also needs
        Intelligence, persisted Threads and a Learning container with published
        Skills — none of which this project has (§9 #17, #19, #24).
      </Callout>

      <Callout tone="info" title="Two smaller things, both recorded rather than acted on">
        The env block sets <code>OPENAI_MODEL=gpt-5.4</code> and{" "}
        <code>explain</code> defaults to <code>&quot;gpt-5.4&quot;</code>, the
        same model id §9 #4 records from the Quickstart and the same one this
        repo overrides to <code>gpt-4o</code>. And the runtime file here is
        titled with the catch-all path and exports four handlers, agreeing with
        Quickstart, Copilot Runtime and Thread &amp; History Lifecycle and
        disagreeing with the landing page&apos;s two-export{" "}
        <code>app/api/copilotkit/route.ts</code> — §9 #18, now four pages to
        one.
      </Callout>

      <Panel title="Source">
        <SourceCode file="frontend/src/app/cookbook/jev-generative-ui/workspaces.ts" />
        <div className="mt-4">
          <SourceCode file="frontend/src/app/cookbook/jev-generative-ui/choose-panel.ts" />
        </div>
        <div className="mt-4">
          <SourceCode file="frontend/src/app/cookbook/jev-generative-ui/picker-agent.ts" />
        </div>
        <div className="mt-4">
          <SourceCode file="frontend/src/app/cookbook/jev-generative-ui/runtime-route.ts" />
        </div>
        <div className="mt-4">
          <SourceCode file="frontend/src/app/cookbook/jev-generative-ui/learned-guidance.ts" />
        </div>
        <div className="mt-4">
          <SourceCode file="frontend/src/app/cookbook/jev-generative-ui/demo-chat/page.tsx" />
        </div>
      </Panel>
    </>
  );
}
