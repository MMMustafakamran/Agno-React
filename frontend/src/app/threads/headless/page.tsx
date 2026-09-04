import { RouteHeader } from "@/components/route-header";
import { SourceCode } from "@/components/source-code";
import { Callout, Panel, TryIt } from "@/components/ui";

export default function Page() {
  return (
    <>
      <RouteHeader path="/threads/headless" />

      <Callout tone="premium" title="Needs a CopilotKit Intelligence license">
        Threads are stored by the platform, not by the Agno agent. Without{" "}
        <code>NEXT_PUBLIC_COPILOTKIT_LICENSE_KEY</code> the hook returns an
        empty list and the mutations have nothing to act on. Everything else —
        the UI, the wiring, the chat binding — is real and unchanged.
      </Callout>

      <Callout tone="warn" title="A managed project is now said to never get a license token">
        The page gained a paragraph this sync: &ldquo;Managed project setup does
        not issue <code>COPILOTKIT_LICENSE_TOKEN</code>. That token is only for
        offline or self-hosted licensing and does not replace the managed
        project API key.&rdquo; It does not then say what a managed-only project
        should do about the drawer, which gates on a license status and stays
        locked without one. Follow the current pages from scratch and you get a
        locked drawer with no explanation; the only reason it unlocks anywhere
        here is a token an older CLI wrote.
      </Callout>

      <Callout tone="info" title="Two more variables the CLI now writes">
        The same step lists <code>SL_ENABLED</code> and{" "}
        <code>CPK_TELEMETRY_ID</code> as written to <code>.env</code> by{" "}
        <code>init</code> and its <code>create</code> alias. Neither is
        explained beyond the telemetry id being &ldquo;a non-secret analytics
        identity&rdquo;; <code>SL_ENABLED</code> is named and never defined
        anywhere on the page. Nothing in this repo reads either.
      </Callout>

      <Panel title="What it demonstrates">
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          The same data layer the prebuilt drawer uses, exposed as a hook so you
          can build any thread UI you like. <code>useThreads</code> returns the
          list plus <code>renameThread</code>, <code>archiveThread</code>,{" "}
          <code>unarchiveThread</code>, <code>deleteThread</code>, and
          cursor-based pagination.
        </p>
        <p className="mt-3 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          Headless here means custom UI, not custom infrastructure — persistence,
          replay, realtime sync, and locking are identical to the drawer&apos;s.
          The list syncs over a WebSocket, so a thread created in another tab
          appears without polling.
        </p>
        <div className="mt-4">
          <TryIt
            prompts={["Hello — remember this conversation"]}
            expect="With a license: a thread appears, gets an auto-generated name after the first message, and reselecting it after a reload replays the history."
            fail="Without a license the list stays empty. That is the expected unlicensed result, not a bug."
          />
        </div>
      </Panel>

      <Panel title="Source">
        <SourceCode file="frontend/src/app/threads/headless/demo-chat/page.tsx" />
        <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
          Two behaviours worth knowing before shipping this: archive is a
          reversible soft delete while <strong>delete is permanent</strong>, and
          neither ships a confirmation dialog — the buttons above act
          immediately. Thread names are model-generated after the first message
          unless the runtime sets <code>generateThreadNames: false</code>.
        </p>
      </Panel>
    </>
  );
}
