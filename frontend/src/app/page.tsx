import Link from "next/link";

import { BackendHealth } from "@/components/backend-health";
import { RouteHeader } from "@/components/route-header";
import { Callout, CodeBlock, KeyValue, Panel, TryIt } from "@/components/ui";
import { DOCS_ROOT, NAV } from "@/lib/nav-config";
import { DocDriftPanel } from "@/components/doc-drift-panel";

/** Dynamic: the doc-sync readouts below read the snapshot off disk. */
export const dynamic = "force-dynamic";

/**
 * The landing page's "connect" snippet, added 2026-09-21, the first code the
 * section's front door has ever published. Verbatim, and quoted rather than
 * shipped: its filename is `app/api/copilotkit/route.ts`, a plain route file in
 * the same folder where every other page publishes the optional catch-all
 * `app/api/copilotkit/[[...slug]]/route.ts`. Next.js cannot serve both from one
 * folder, so this harness cannot hold the two filenames at once. The catch-all
 * is the one that is shipped, because it is what the Quickstart and the Copilot
 * Runtime page build and what the runtime's sub-routes need.
 */
const LANDING_ROUTE_SNIPPET = `import {
  CopilotRuntime,
  createCopilotRuntimeHandler,
} from "@copilotkit/runtime/v2";
import { AgnoAgent } from "@ag-ui/agno";

const runtime = new CopilotRuntime({
  agents: {
    my_agent: new AgnoAgent({ url: "http://localhost:8000/agui" }),
  },
});

const handler = createCopilotRuntimeHandler({
  runtime,
  basePath: "/api/copilotkit",
});

export const GET = handler;
export const POST = handler;`;

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

      <Panel
        title="What the landing page now publishes"
        description="The /agno front door carried no code until 2026-09-21. It carries this."
      >
        <CodeBlock
          filename="app/api/copilotkit/route.ts"
          language="ts"
          code={LANDING_ROUTE_SNIPPET}
        />
        <div className="mt-4">
          <Callout tone="warn" title="Two filenames for one route, and Next.js takes only one">
            This block is titled{" "}
            <code>app/api/copilotkit/route.ts</code>. The Quickstart, the
            Copilot Runtime page and Thread Lifecycle all title the same file{" "}
            <code>app/api/copilotkit/[[...slug]]/route.ts</code>, and the
            Copilot Runtime page is explicit that it &ldquo;lives at a{" "}
            <strong>catch-all</strong> path&rdquo; so the runtime can serve{" "}
            <code>/info</code>, agent runs and threads. A plain{" "}
            <code>route.ts</code> cannot sit beside an optional catch-all in the
            same folder, so a reader who starts at the landing page and then
            follows the Quickstart has to notice the difference and delete one.
            This repo ships the catch-all at{" "}
            <code>frontend/src/app/api/copilotkit/[[...slug]]/route.ts</code>.
          </Callout>
        </div>
        <div className="mt-4">
          <Callout tone="warn" title="It also drops the handlers and the key the other pages require">
            The snippet exports <code>GET</code> and <code>POST</code> only,
            while the Copilot Runtime page publishes four exports including{" "}
            <code>PATCH</code> and <code>DELETE</code>. It registers{" "}
            <code>my_agent</code>, while the Quickstart&apos;s provider snippet
            asks for <code>my_agent</code> but its runtime is also wired with{" "}
            <code>intelligence</code> and <code>identifyUser</code>, neither of
            which appears here. The landing page never says it is showing a
            reduced version.
          </Callout>
        </div>
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
