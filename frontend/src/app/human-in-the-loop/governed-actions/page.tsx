import { RouteHeader } from "@/components/route-header";
import { SourceCode, SourceCodeGroup } from "@/components/source-code";
import { Callout, Panel, TryIt } from "@/components/ui";

export default function Page() {
  return (
    <>
      <RouteHeader path="/human-in-the-loop/governed-actions" />

      <Panel title="What it demonstrates">
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          A checkpoint in front of a side-effecting action. The agent proposes
          one — send an email, update a record, apply a discount — and the run
          stops on a card showing what it wants to do, which policy reference
          produced the verdict, and the exact arguments. It runs only if you
          approve.
        </p>
        <div className="mt-4">
          <TryIt
            prompts={[
              "Send an invoice reminder to acme@example.com — ask me to approve it first",
              "Now propose one that policy should block",
            ]}
            expect="An approval card appears in the chat and the run stops on it. Approving returns an approved response and the agent continues; rejecting returns a refusal."
            fail="The agent describes the action in prose and never calls the tool."
          />
        </div>
      </Panel>

      <Callout tone="info" title="New page, first covered in this sync">
        <code>/agno/human-in-the-loop/governed-actions</code> appeared in the
        sitemap on 2026-09-04. It was invisible to{" "}
        <code>npm run drift:sync</code>, which only re-hashes pages already in
        the manifest — the sitemap comparison that finds new pages lives solely
        in the <code>/doc-sync</code> action. Found by running that comparison
        by hand.
      </Callout>

      <Callout tone="warn" title="`z.record(z.unknown())` does not compile on zod 4">
        <p>
          The page publishes the tool schema with{" "}
          <code>arguments: z.record(z.unknown())</code>. That is the zod 3
          signature. This repo runs <strong>zod 4.4.3</strong>, where{" "}
          <code>z.record</code> requires a key schema and a value schema, and
          the published form is a compile error:{" "}
          <code>TS2554: Expected 2-3 arguments, but got 1</code>.
        </p>
        <p className="mt-2">
          The page names no zod version. The same snippet compiles unchanged in
          the Mastra harness, which is on zod 3.25.76 — so whether the published
          code works depends entirely on a dependency the page never mentions.
        </p>
        <p className="mt-2">
          Translated here to <code>z.record(z.string(), z.unknown())</code>, and
          only because the registration is mounted at the app root: left
          failing, it would take down every route rather than demonstrate
          anything. The departure is marked in the source.
        </p>
      </Callout>

      <Callout tone="warn" title="The model decides the verdict — which the page's own guardrail forbids">
        The tool schema puts <code>verdict</code> in the{" "}
        <em>parameters</em>, so the value that decides whether an action is
        allowed, denied, or needs approval is produced by the model, from the
        prompt. The page&apos;s first guardrail says the opposite: &ldquo;Check
        policy on the server before presenting the approval, not only in the
        browser.&rdquo; Nothing in the tool-call variant does that, and nothing
        on the page reconciles the two. Followed as written, the approval UI
        asks the user to ratify a verdict the model invented.
      </Callout>

      <Callout tone="warn" title="Nothing enforces the other guardrails either">
        The page lists a stable <code>id</code> and <code>reference</code> so an
        approval cannot be replayed, showing exact arguments, treating{" "}
        <code>deny</code> as terminal, and logging the decision. Only the
        arguments display is implemented in the snippets. The{" "}
        <code>handleApproval</code> function that compares{" "}
        <code>actionId</code> and <code>reference</code> is defined and never
        wired to anything — the tool variant never calls it. Follow the page and
        you get an approval UI with no replay protection and no audit trail.
      </Callout>

      <Callout tone="warn" title="The verdict shortcut fires from an effect with a stale dep list">
        <code>GovernedActionCard</code> auto-approves on <code>allow</code> and
        auto-blocks on <code>deny</code> from a <code>useEffect</code> keyed on{" "}
        <code>[action.id, action.verdict]</code>, while calling{" "}
        <code>onApprove</code> and <code>onBlock</code>, neither of which is in
        the dependency array. Linted verbatim,{" "}
        <code>react-hooks/exhaustive-deps</code> reports both as missing.
      </Callout>

      <Callout tone="warn" title="The `useInterrupt` half is not implementable here">
        The page leads with a <code>useInterrupt</code> variant reading{" "}
        <code>interrupt?.metadata?.action</code>.{" "}
        <code>Interrupt.metadata</code> is a real optional field on the AG-UI
        type, so the snippet is well-formed — but it needs a backend that pauses
        a run and attaches an action to it, and the Agno agent here does not.
        The page shows only the consuming half: nothing says which backends can
        emit such an interrupt, or how the action reaches{" "}
        <code>metadata</code>.
      </Callout>

      <Panel title="Source">
        <SourceCodeGroup
          files={[
            { file: "frontend/src/components/governed-action-card.tsx" },
            {
              file: "frontend/src/components/global-frontend-tools.tsx",
              region: "governed-action",
            },
            { file: "backend/tools/frontend_tools.py", region: "governed-action" },
          ]}
        />
      </Panel>

      <Panel title="The demo's page">
        <SourceCode file="frontend/src/app/human-in-the-loop/governed-actions/demo-chat/page.tsx" />
      </Panel>
    </>
  );
}
