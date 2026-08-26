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
