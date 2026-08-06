import { RouteHeader } from "@/components/route-header";
import { SourceCode } from "@/components/source-code";
import { Callout, Panel, TryIt } from "@/components/ui";

const PROPS: [string, string][] = [
  ["agentId", "Whose threads to list. Defaults to the chat configuration's agent."],
  ["label", 'Accessible name for the drawer region. Defaults to "Threads".'],
  ["recentLabel", 'Heading above the list. Defaults to "Recent Conversations".'],
  ["onThreadSelect", "Take over selection instead of letting the drawer drive the chat."],
  ["onNewThread", 'Handle the "New Conversation" row yourself.'],
  ["renderRow", "Custom content per row, keeping the row chrome and kebab menu."],
  ["limit", 'Page size. Adds a "Load more" control while more remain.'],
];

export default function Page() {
  return (
    <>
      <RouteHeader path="/threads/drawer" />

      <Callout tone="premium" title="Locked without a license key">
        The drawer renders a locked view in place of the thread list when no
        license key is present. Seeing that locked panel is the correct
        unlicensed outcome — it proves the component mounted and detected the
        missing license, rather than failing to render.
      </Callout>

      <Panel title="What it demonstrates">
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          A drop-in conversation sidebar. The notable part is how little you
          write: placing the drawer and the chat inside one{" "}
          <code>CopilotChatConfigurationProvider</code> is the entire
          integration. A hand-rolled sidebar would have you track the active{" "}
          <code>threadId</code> yourself and thread selection handlers between
          the list and the chat; here the shared configuration holds that state.
        </p>
        <div className="mt-4">
          <TryIt
            prompts={["Start a conversation, then pick another thread"]}
            expect="With a license: selecting a row replays that conversation, and the New Conversation row resets the chat to a fresh welcome screen."
            fail="Without a license the list area shows the locked view. A blank drawer with no locked state would mean the component failed to mount."
          />
        </div>
      </Panel>

      <Panel title="Source">
        <SourceCode file="frontend/src/app/threads/drawer/demo-chat/page.tsx" />
      </Panel>

      <Panel title="Props">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[34rem] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500 dark:border-slate-700">
                <th className="pb-2 pr-4 font-medium">Prop</th>
                <th className="pb-2 font-medium">Purpose</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {PROPS.map(([prop, desc]) => (
                <tr key={prop}>
                  <td className="py-2 pr-4 font-mono text-xs text-slate-800 dark:text-slate-100">
                    {prop}
                  </td>
                  <td className="py-2 text-slate-600 dark:text-slate-400">
                    {desc}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
          Rename is absent by design — the row menu covers archive and delete
          only. The{" "}
          <a
            href="/threads/headless"
            className="text-[var(--accent)] underline underline-offset-4"
          >
            headless route
          </a>{" "}
          implements rename with <code>useThreads</code>.
        </p>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          The drawer renders inside a shadow root with self-contained styles, so
          it inherits light/dark automatically. Customisation is limited to three
          deliberate escape hatches: <code>slot</code> children,{" "}
          <code>renderRow</code>, and CSS parts plus{" "}
          <code>--cpk-drawer-*</code> tokens.
        </p>
      </Panel>
    </>
  );
}
