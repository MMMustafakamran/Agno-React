import Link from "next/link";

import { BackendHealth } from "@/components/backend-health";
import { RouteHeader } from "@/components/route-header";
import { Callout, KeyValue, Panel, TryIt } from "@/components/ui";
import { DOCS_ROOT, NAV } from "@/lib/nav-config";
import { DocDriftPanel } from "@/components/doc-drift-panel";

/** Dynamic: the doc-sync readouts below read the snapshot off disk. */
export const dynamic = "force-dynamic";

export default function Page() {
  const counts = NAV.flatMap((g) => g.routes).reduce<Record<string, number>>(
    (acc, r) => ({ ...acc, [r.status]: (acc[r.status] ?? 0) + 1 }),
    {},
  );

  return (
    <>
      <RouteHeader path="/" />


      <DocDriftPanel />

      <Panel title="What this is">
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          Every page in the Agno section of the CopilotKit docs has a route here,
          and each route runs the functionality that page describes against a real Agno
          agent.
        </p>
        <div className="mt-4">
          <KeyValue
            rows={[
              [
                "Docs tracked",
                <a
                  key="d"
                  href={DOCS_ROOT}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[var(--accent)] underline underline-offset-4"
                >
                  {DOCS_ROOT}
                </a>,
              ]
            ]}
          />
        </div>
      </Panel>

      <Panel
        title="Connection check"
        description="Both processes must be up before any chat route will respond."
      >
        <BackendHealth />
      </Panel>

      <Panel title="How a message travels">
        <ol className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
          <li>
            <strong>1.</strong> A chat component posts to{" "}
            <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs dark:bg-slate-800">
              /api/copilotkit
            </code>{" "}
            in this Next app.
          </li>
          <li>
            <strong>2.</strong> The Copilot Runtime resolves the agent id and
            forwards the run to the Agno service over AG-UI.
          </li>
          <li>
            <strong>3.</strong> Agno executes the agent, calling OpenAI and any
            server-side tools.
          </li>
          <li>
            <strong>4.</strong> AG-UI events stream back as SSE. Browser-executed
            tools run here, and their results go back so the run can continue.
          </li>
        </ol>
      </Panel>

      <Panel title="Start here">
        <div className="space-y-3">
          <TryIt
            prompts={["What can you do?"]}
            expect={
              <>
                On{" "}
                <Link href="/quickstart" className="underline">
                  /quickstart
                </Link>
                , a streamed reply listing the agent&apos;s tools.
              </>
            }
            fail="An error banner, or no reply at all — check the connection panel above."
          />
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Sidebar dot colours mirror status: green working, amber partial, grey
            reference. The{" "}
            <Link
              href="/status"
              className="text-[var(--accent)] underline underline-offset-4"
            >
              status overview
            </Link>{" "}
            lists every route in one table.
          </p>
        </div>
      </Panel>
    </>
  );
}
