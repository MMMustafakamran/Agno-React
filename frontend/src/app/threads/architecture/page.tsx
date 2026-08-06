import { RouteHeader } from "@/components/route-header";
import { Callout, CodeBlock, Panel } from "@/components/ui";

const LOCK_SNIPPET = `const runtime = new CopilotRuntime({
  agents: { default: agent },

  // Auto-naming is on by default.
  // generateThreadNames: false,

  // Thread lock tuning:
  // lockTtlSeconds: 20,               // max 3600
  // lockHeartbeatIntervalSeconds: 15, // max 3000
  // lockKeyPrefix: "my-app",          // when sharing one Redis
});`;

const PIECES: [string, string][] = [
  [
    "Frontend thread API",
    "Lists, renames, archives, deletes. Paginates and stays in sync across tabs over WebSocket.",
  ],
  [
    "CopilotChat with threadId",
    "Connects to one thread, replays its history, and streams new events.",
  ],
  [
    "CopilotRuntime",
    "Executes agents, writes thread data to the platform, and relays events to clients.",
  ],
];

export default function Page() {
  return (
    <>
      <RouteHeader path="/threads/architecture" />

      <Callout tone="premium" title="Architecture, not a feature to run">
        This page explains the server-side model that the drawer and headless
        routes both sit on. There is nothing interactive to exercise without a
        licensed platform behind it.
      </Callout>

      <Panel title="Thread vs. run">
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          A <strong>thread</strong> is the durable container; a <strong>run</strong>{" "}
          is one agent execution inside it. Sending a message starts a new run,
          and the thread accumulates events across all of them. That is why the
          store is a growing event log rather than a message array.
        </p>
      </Panel>

      <Panel title="The three pieces">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[34rem] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500 dark:border-slate-700">
                <th className="pb-2 pr-4 font-medium">Piece</th>
                <th className="pb-2 font-medium">Role</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {PIECES.map(([piece, role]) => (
                <tr key={piece}>
                  <td className="py-2 pr-4 font-medium text-slate-800 dark:text-slate-100">
                    {piece}
                  </td>
                  <td className="py-2 text-slate-600 dark:text-slate-400">
                    {role}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
          You touch the first two. The runtime and platform handle persistence
          and sync.
        </p>
      </Panel>

      <Panel title="Replay, and what happens on reconnect">
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          The runtime writes each event as it happens — messages, tool calls,
          state updates — storing the raw stream rather than a final snapshot. A
          returning client can therefore be restored exactly where it left off,
          and can fetch only the events it missed instead of reloading
          everything.
        </p>
        <div className="mt-3 space-y-2 text-sm text-slate-700 dark:text-slate-300">
          <p>
            <strong>No active run:</strong> the platform returns historical
            events and the client replays them.
          </p>
          <p>
            <strong>Active run:</strong> it returns the history{" "}
            <em>and</em> opens a WebSocket. The client replays, then picks up
            live events mid-stream.
          </p>
        </div>
      </Panel>

      <Panel title="Auto-naming, archive, and locks">
        <ul className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
          <li>
            <strong>Auto-naming.</strong> After the first run completes, the
            runtime asks the model for a 2–5 word name. It runs asynchronously,
            so it never blocks the reply, and arrives via realtime sync.
          </li>
          <li>
            <strong>Archive</strong> is a reversible soft delete — hidden from
            the default list, restored by unarchiving.{" "}
            <strong>Delete</strong> is permanent. Neither confirms first.
          </li>
          <li>
            <strong>Locks.</strong> A run acquires a lock on its thread so
            concurrent runs cannot interleave their events.
          </li>
        </ul>
        <div className="mt-4">
          <CodeBlock filename="Runtime options" language="ts" code={LOCK_SNIPPET} />
        </div>
      </Panel>
    </>
  );
}
