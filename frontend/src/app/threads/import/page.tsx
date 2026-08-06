import { RouteHeader } from "@/components/route-header";
import { Callout, CodeBlock, Panel } from "@/components/ui";

const DRY_RUN = `# Preview what would be imported — no writes.
npx copilotkit@latest import --source adk --dry-run
npx copilotkit@latest import --source langgraph --dry-run`;

export default function Page() {
  return (
    <>
      <RouteHeader path="/threads/import" />

      <Callout tone="premium" title="Not runnable from this repo">
        Import moves existing conversations into a licensed Enterprise
        Intelligence project. There is no such project here, and the documented
        sources are Google ADK and LangGraph — neither of which this Agno repo
        has history in. Running it would have nothing to read and nowhere to
        write, so this route documents the operation rather than performing it.
      </Callout>

      <Panel title="What import is for">
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          Threads only start capturing conversations once an app is connected to
          the platform. Anything that happened before that — or in a framework&apos;s
          own session store — is invisible to the thread list. Import backfills
          that history into the same store so users can resume old and new
          conversations through one UI.
        </p>
        <p className="mt-3 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          Native storage stays where it is. Import copies history into the thread
          store for the Rich Threads experience; runs that were already going
          through native durable persistence continue to do so.
        </p>
      </Panel>

      <Panel title="The commands">
        <CodeBlock filename="Terminal" language="bash" code={DRY_RUN} />
        <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
          Always start with <code>--dry-run</code>. It reports what would be
          imported without writing anything, which is the only safe way to check
          the scope before backfilling a real project.
        </p>
      </Panel>

      <Panel title="If you wanted to try it here">
        <ol className="list-decimal space-y-1.5 pl-5 text-sm text-slate-700 dark:text-slate-300">
          <li>
            Create a free developer account and run{" "}
            <code>npx copilotkit@latest login</code>.
          </li>
          <li>
            Select or create a project with{" "}
            <code>npx copilotkit@latest project select</code>. This writes{" "}
            <code>.copilotkit/project.json</code> and the Intelligence env vars.
          </li>
          <li>
            Point <code>--source</code> at a framework you actually have history
            in. Agno is not currently a documented import source.
          </li>
        </ol>
      </Panel>
    </>
  );
}
