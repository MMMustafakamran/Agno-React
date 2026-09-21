"use client";

import { useEffect, useRef, useState } from "react";
import { useAgent, useCopilotKit } from "@copilotkit/react-core/v2";

import { DemoFrame } from "@/components/demo-frame";
import {
  PanelSchema,
  StateSchema,
  candidates,
  clarificationOptions,
} from "../workspaces";

/**
 * Jev: fast generative UI, step 4 — `app/page.tsx`, verbatim, plus a bench.
 *
 * WHAT RUNS HERE: the schemas in `../workspaces.ts` and the prepared controls
 * below — the published `Picker`, its form, its panel markup and its two button
 * message formats. All of it is this page's own React and zod; none of it needs
 * the vendor SDK.
 *
 * WHAT DOES NOT: the Jev decision itself. `choosePanel` needs
 * `@typesafe-ai/sdk` (absent) and a `TYPESAFE_API_KEY` from TypeSafe, and
 * `PickerAgent` needs it plus `@langchain/openai` (absent), so no `picker`
 * agent is registered on this runtime. `useAgent({ agentId: "picker" })` below
 * is the published call against an id this runtime does not serve, and pressing
 * "Find options" is the published `send`, which is where that shows.
 *
 * The bench above the picker is NOT a Jev decision and does not pretend to be.
 * It writes a state object into the agent directly so the published panel
 * markup has something to render. The two panel literals are the ones
 * `choose-panel.ts` builds, parsed through the published `PanelSchema`; what is
 * missing is `control.choice`, which selects between them, and `ranked`, which
 * orders the comparison options. Both are Jev's output. The comparison here is
 * therefore in catalog order, not ranked order, and the buttons are labelled
 * as constructed locally.
 *
 * DEVIATION FROM THE PUBLISHED SNIPPET, one, and it is not in `Picker`:
 * the page's `app/page.tsx` opens with
 *
 *   export default function Page() {
 *     return <CopilotKitProvider runtimeUrl="/api/copilotkit"><Picker /></CopilotKitProvider>;
 *   }
 *
 * This app already mounts exactly one `CopilotKitProvider runtimeUrl="/api/copilotkit"`
 * at the root (`src/components/providers.tsx`), so `<Picker />` is rendered
 * directly rather than inside a second one. Recorded in the README's §9.
 */

/** The two panel objects `choose-panel.ts` parses, minus Jev's choice. */
const PREPARED = {
  clarification: PanelSchema.parse({
    type: "clarification",
    title: "What kind of work are you doing?",
    options: clarificationOptions,
  }),
  comparison: PanelSchema.parse({
    type: "comparison",
    title: "Choose a workspace",
    options: candidates.map(({ id, name, details }) => ({
      id,
      label: `${name}: ${details}`,
    })),
  }),
};

function Bench() {
  const { agent } = useAgent({ agentId: "picker" });
  const [, bump] = useState(0);

  const show = (key: keyof typeof PREPARED | "clear") => {
    agent.setState(
      StateSchema.parse(
        key === "clear"
          ? {}
          : {
              panel: PREPARED[key],
              selectedId: null,
              note:
                "Panel written locally. Jev was not called — choosePanel needs @typesafe-ai/sdk and a TypeSafe key.",
            },
      ),
    );
    bump((n) => n + 1);
  };

  return (
    <div
      data-testid="jev-bench"
      className="shrink-0 border-b border-amber-300 bg-amber-50 px-4 py-3 text-xs dark:border-amber-900 dark:bg-amber-950/40"
    >
      <p className="font-semibold text-amber-900 dark:text-amber-100">
        No Jev decision runs here
      </p>
      <p className="mt-1 max-w-3xl text-amber-900/80 dark:text-amber-100/80">
        The buttons below put one of the two panel objects{" "}
        <code>choose-panel.ts</code> constructs into agent state, through the
        published <code>PanelSchema.parse</code>, so the published panel markup
        has something to draw. <code>control.choice</code>, which picks between
        them, and <code>ranked</code>, which orders the comparison, are Jev
        answers and are absent.
      </p>
      <div className="mt-2 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => show("clarification")}
          className="rounded-md border border-amber-500 px-2.5 py-1 font-medium text-amber-900 dark:text-amber-100"
        >
          Show the clarification panel
        </button>
        <button
          type="button"
          onClick={() => show("comparison")}
          className="rounded-md border border-amber-500 px-2.5 py-1 font-medium text-amber-900 dark:text-amber-100"
        >
          Show the comparison panel (catalog order, not ranked)
        </button>
        <button
          type="button"
          onClick={() => show("clear")}
          className="rounded-md border border-amber-500 px-2.5 py-1 font-medium text-amber-900 dark:text-amber-100"
        >
          Clear
        </button>
      </div>
    </div>
  );
}

// [8] jev: the picker, reading agent state
function Picker() {
  const { agent, isReady } = useAgent({ agentId: "picker" });
  const { copilotkit } = useCopilotKit();
  const [text, setText] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const sending = useRef(false);
  const parsed = StateSchema.safeParse(agent.state);
  const state = parsed.success ? parsed.data : StateSchema.parse({});
  const busy = pending || agent.isRunning;

  useEffect(() => {
    if (!isReady) return;
    const subscription = agent.subscribe({ onRunErrorEvent: ({ event }) => setError(event.message) });
    return () => subscription.unsubscribe();
  }, [agent, isReady]);

  // [9] jev: turn typed requests and button clicks into user messages
  /* [!code highlight] */
  async function send(content: string) {
    if (!isReady || sending.current || agent.isRunning || !content.trim()) return;
    sending.current = true;
    setPending(true);
    setError(null);
    agent.addMessage({ id: crypto.randomUUID(), role: "user", content });
    try { await copilotkit.runAgent({ agent }); }
    catch { setError("The request failed. Try again."); }
    finally { sending.current = false; setPending(false); }
  }

  return <main>
    <h1>Find a workspace</h1>
    <form onSubmit={(event) => { event.preventDefault(); void send(text); }}>
      <label htmlFor="request">What do you need?</label>
      <input id="request" value={text} onChange={(event) => setText(event.target.value)} />
      <button disabled={!isReady || busy}>Find options</button>
    </form>
    {busy && <button onClick={() => agent.abortRun()}>Cancel</button>}
    {error && <p role="alert">{error}</p>}
    <p aria-live="polite">{state.note}</p>
    <p>Selected workspace: {state.selectedId ?? "None"}</p>
    {state.panel && <section aria-label={state.panel.title}>
      <h2>{state.panel.title}</h2>
      {state.panel.options.map((option) => <button key={option.id} disabled={busy || !isReady}
        onClick={() => void send(state.panel?.type === "clarification"
          ? `Clarification answer: ${option.id}` : `Select workspace: ${option.id}`)}>
        {option.label}
      </button>)}
    </section>}
  </main>;
}

/** Reports what the runtime knows about the `picker` id the recipe registers. */
function AgentProbe() {
  const { agent, isReady } = useAgent({ agentId: "picker" });

  return (
    <div className="shrink-0 border-t border-slate-200 px-4 py-2 dark:border-slate-800">
      <table data-testid="jev-agent-probe" className="w-full text-left text-[11px]">
        <tbody className="font-mono">
          <tr>
            <th className="w-56 py-1 pr-3 font-medium text-slate-500">
              useAgent(&#123; agentId: &quot;picker&quot; &#125;).isReady
            </th>
            <td
              data-testid="jev-agent-ready"
              className={isReady ? "text-emerald-600" : "text-rose-600 dark:text-rose-400"}
            >
              {String(isReady)}
              {!isReady &&
                " — no `picker` agent is registered on this runtime; PickerAgent needs @typesafe-ai/sdk and @langchain/openai"}
            </td>
          </tr>
          <tr className="border-t border-slate-200 dark:border-slate-800">
            <th className="py-1 pr-3 font-medium text-slate-500">agent.state</th>
            <td className="break-all py-1 text-slate-700 dark:text-slate-300">
              {JSON.stringify(agent.state)}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

export default function Page() {
  return (
    <DemoFrame
      parentPath="/cookbook/jev-generative-ui"
      subtitle="prepared controls run · the Jev decision layer does not"
    >
      <div className="flex h-full flex-col">
        <Bench />
        <div className="min-h-0 flex-1 overflow-auto p-4 [&_button]:mr-2 [&_button]:rounded [&_button]:border [&_button]:border-slate-400 [&_button]:px-2 [&_button]:py-1 [&_h1]:text-lg [&_h1]:font-semibold [&_h2]:mt-2 [&_h2]:font-medium [&_input]:ml-2 [&_input]:rounded [&_input]:border [&_input]:border-slate-400 [&_input]:px-2 [&_input]:py-1 [&_p]:my-2 [&_p]:text-sm">
          <Picker />
        </div>
        <AgentProbe />
      </div>
    </DemoFrame>
  );
}
