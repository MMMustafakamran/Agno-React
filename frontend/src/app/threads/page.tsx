import Link from "next/link";

import { RouteHeader } from "@/components/route-header";
import { Callout, Panel } from "@/components/ui";

const HANDLED: [string, string][] = [
  ["Durable event storage and replay", "Your agent's behaviour and tools"],
  ["Replay-to-live stream reconnection", "The conversation layout and experience"],
  ["Realtime thread metadata sync", "Which thread actions users can reach"],
  ["Naming, pagination, archive, delete", "Authorization and permissions"],
  ["Runtime-to-platform plumbing and locks", "Mapping to native framework sessions"],
];

export default function Page() {
  return (
    <>
      <RouteHeader path="/threads" />

      <Callout tone="premium" title="What 'partial' means on these routes">
        Rich Threads are a platform feature, not an Agno feature. The React code
        in this section is real and complete; what is missing without a license
        key is the server that stores and replays the conversations. Each thread
        route says what you should see in both cases.
      </Callout>

      <Panel title="What threads actually persist">
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          A thread stores the AG-UI event history, not a chat transcript. That
          distinction is the whole point: replaying events restores generative UI
          and tool activity as they originally rendered, reattaches multimodal
          inputs, and lets a conversation reconnect to a run that is still in
          progress — none of which a saved list of message strings could do.
        </p>
        <ul className="mt-3 space-y-1.5 text-sm text-slate-700 dark:text-slate-300">
          <li>• Durable history across reloads, sessions, and devices</li>
          <li>• Replay before reconnecting to a live run</li>
          <li>• Generative UI restored as part of the history</li>
          <li>• Realtime thread-list updates without polling</li>
          <li>• Generated names, plus rename, archive, and delete</li>
          <li>• Thread locks that stop concurrent runs interleaving</li>
        </ul>
      </Panel>

      <Panel title="Division of responsibility">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[34rem] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500 dark:border-slate-700">
                <th className="pb-2 pr-4 font-medium">CopilotKit handles</th>
                <th className="pb-2 font-medium">You control</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {HANDLED.map(([theirs, yours]) => (
                <tr key={theirs}>
                  <td className="py-2 pr-4 text-slate-700 dark:text-slate-300">
                    {theirs}
                  </td>
                  <td className="py-2 text-slate-600 dark:text-slate-400">
                    {yours}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      <Panel title="Two ways to build the UI">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg border border-slate-200 p-4 dark:border-slate-700">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Threads Drawer
            </h3>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              A prebuilt switcher with archive, delete, and pagination already
              wired to the chat. No active-thread state of your own.
            </p>
            <Link
              href="/threads/drawer"
              className="mt-2 inline-block text-sm text-[var(--accent)] underline underline-offset-4"
            >
              Open the drawer route →
            </Link>
          </div>
          <div className="rounded-lg border border-slate-200 p-4 dark:border-slate-700">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Headless Threads
            </h3>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              <code>useThreads</code> with your own markup, when you need a
              different layout, permission model, or rename support.
            </p>
            <Link
              href="/threads/headless"
              className="mt-2 inline-block text-sm text-[var(--accent)] underline underline-offset-4"
            >
              Open the headless route →
            </Link>
          </div>
        </div>
        <p className="mt-4 text-sm text-slate-600 dark:text-slate-400">
          Both sit on the same persistence, replay, and locking infrastructure.
          Headless means custom UI, not custom backend.
        </p>
      </Panel>

      <Panel title="Threads are not Agno sessions">
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          CopilotKit threads live in CopilotKit Intelligence and are
          separate from any session or checkpoint store the agent framework keeps.
          Renaming or deleting a CopilotKit thread does not touch Agno&apos;s own
          storage. If a backend needs both, it keeps a stable mapping between the
          two ids — the active <code>threadId</code> is passed through to the
          agent over AG-UI, so it is available to map.
        </p>
      </Panel>
    </>
  );
}
