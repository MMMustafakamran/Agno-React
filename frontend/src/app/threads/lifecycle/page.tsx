import { RouteHeader } from "@/components/route-header";
import { SourceCode } from "@/components/source-code";
import { Callout, CodeBlock, Panel, TryIt } from "@/components/ui";

const IDENTIFY_SNIPPET = `import { CopilotKitIntelligence, CopilotRuntime } from "@copilotkit/runtime/v2";

// \`apiKey\` is the only required field. The key scopes the project, so there is
// no separate project or organization id to pass.
const intelligence = new CopilotKitIntelligence({
  apiKey: process.env.INTELLIGENCE_API_KEY!,
});

const runtime = new CopilotRuntime({
  agents: { default: agent },
  intelligence,
  identifyUser: async (request) => {
    const session = await verifyAppSession(request); // your server-side auth
    if (!session?.user) throw new Error("Unauthorized");
    return { id: session.user.id, name: session.user.name };
  },
});`;

const STAGES: [string, string][] = [
  ["Mint", "A chat mounting without a threadId generates a UUID v4 on the client."],
  [
    "Run",
    "Messages and tool calls stream under that id, persisted only if a server-side store exists.",
  ],
  ["Hydrate", "Mounting with a known id calls connectAgent() and replays the stored history."],
  ["Switch / start", "Changing the id restores another conversation; starting fresh clears the view."],
];

export default function Page() {
  return (
    <>
      <RouteHeader path="/threads/lifecycle" />

      <Panel title="The four stages">
        <p className="mb-3 text-sm text-slate-600 dark:text-slate-400">
          Minting and switching are client-side, so they are observable in this
          install. Hydration is the one stage that needs a server-side store.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[32rem] text-left text-sm">
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {STAGES.map(([stage, desc]) => (
                <tr key={stage}>
                  <td className="w-40 py-2 pr-4 font-medium text-slate-800 dark:text-slate-100">
                    {stage}
                  </td>
                  <td className="py-2 text-slate-600 dark:text-slate-400">
                    {desc}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4">
          <TryIt
            prompts={[
              "Send a message, then press Remount chat",
              "Pin an explicit id, send a message, then remount",
            ]}
            expect="With no explicit id, remounting clears the conversation — a new id was minted. With an explicit id pinned, the id survives the remount."
            fail="The explicit id changes on remount, which would mean the prop is not being honoured."
          />
        </div>
      </Panel>

      <Panel title="Source">
        <SourceCode file="frontend/src/app/threads/lifecycle/demo-chat/page.tsx" />
      </Panel>

      <Callout tone="premium" title="Replay needs a store">
        Pinning an id keeps it stable, but reloading will not bring the messages
        back in this install. Replay reads from a server-side store — the
        CopilotKit Intelligence, or a persisting{" "}
        <code>AgentRunner</code> — and this repo configures neither. The Agno
        agent does not persist CopilotKit threads.
      </Callout>

      <Panel title="Thread id precedence">
        <ol className="list-decimal space-y-1 pl-5 text-sm text-slate-700 dark:text-slate-300">
          <li>
            An explicit <code>threadId</code> prop — authoritative, and it also
            disables the welcome screen.
          </li>
          <li>An active-thread override, e.g. a picked drawer row.</li>
          <li>An id inherited from a parent configuration provider.</li>
          <li>A non-authoritative seed.</li>
          <li>Otherwise a freshly minted UUID.</li>
        </ol>
        <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
          There is no v2 <code>useCopilotChat</code> and no{" "}
          <code>initialMessages</code>. Read from{" "}
          <code>useAgent().agent.messages</code> and mutate with{" "}
          <code>agent.setMessages()</code> or <code>agent.addMessage()</code>.
        </p>
      </Panel>

      <Panel
        title="Scoping threads to a user"
        description="Server-side contract — thread lists are scoped by the identity the runtime resolves, never by anything the client sends."
      >
        <CodeBlock filename="identifyUser" language="ts" code={IDENTIFY_SNIPPET} />
        <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
          This repo does not implement <code>identifyUser</code> — it is
          single-user and unlicensed, so there is no thread scope to divide. A
          static value would be wrong in any multi-user app: every user would
          share one thread list.
        </p>
      </Panel>
    </>
  );
}
