import { RouteHeader } from "@/components/route-header";
import { SourceCode } from "@/components/source-code";
import { Callout, Panel, TryIt } from "@/components/ui";

const TSC_OUTPUT = `$ npx tsc --noEmit        # memory-list.tsx with the @ts-expect-error lines removed
src/app/intelligence/memories/memory-list.tsx: error TS2305:
  Module '"@copilotkit/react-core"' has no exported member 'useMemories'.
src/app/intelligence/memories/memory-list.tsx: error TS7006:
  Parameter 'memory' implicitly has an 'any' type.`;

const PROBE = `As documented   GET  /api/copilotkit/memories          → 404 (runtime)
                POST /api/copilotkit/memories          → 404
                useMemories(): isAvailable false · "Memory is not available for this runtime."

memory.access   GET  /api/copilotkit-memory/memories   → 403 MEMORY_NOT_ENTITLED (platform)
                POST /api/copilotkit-memory/memories   → 403
                useMemories(): isAvailable TRUE · list renders empty · error "Failed to fetch memories: 403"

Both            realtimeStatus stays "connecting" for the whole session`;

export default function Page() {
  return (
    <>
      <RouteHeader path="/intelligence/memories" />

      <Panel title="What it demonstrates">
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          Long-term memory: short statements about a user or project that
          outlive any one thread and are recalled into later ones. The page
          explains the model (three kinds, two scopes, supersede-not-patch,
          retire-not-delete), how access is entitled, and how to read and write
          memories from React, REST and MCP. This route runs its React half
          against this repo&apos;s real Intelligence runtime.
        </p>
        <div className="mt-4">
          <TryIt
            prompts={["Please remember that I prefer concise status updates."]}
            expect="Per the page: the list shows this user's memories, and Save adds one."
            fail="What actually happens — see below: the list says memory is unavailable, the save 404s, and the agent claims it will remember anyway."
          />
        </div>
      </Panel>

      <Callout tone="warn" title="The React snippet imports a hook that is not there">
        <code>import {"{ useMemories }"} from &quot;@copilotkit/react-core&quot;</code>{" "}
        — the package root is the v1 surface and has no such export, on the
        lockfile&apos;s 1.69.2 or CI&apos;s 1.71.0. It ships only from{" "}
        <code>@copilotkit/react-core/v2</code>. Under Next 16 a missing named
        export is a Turbopack compile error, so a route that imports the file
        does not build at all. The verbatim file is kept, errors acknowledged,
        and imported by nothing; the demo runs the same component with the
        import moved to <code>/v2</code>.
        <pre className="mt-3 overflow-x-auto rounded bg-slate-900 p-3 text-xs text-slate-100">
          {TSC_OUTPUT}
        </pre>
      </Callout>

      <Callout tone="warn" title="Set up as the page says, memory is always unavailable">
        The page says memory &quot;is not a feature flag&quot; and that{" "}
        <code>isAvailable: false</code> is what an unentitled deployment looks
        like. On runtime 1.71.0 there is a gate in front of entitlement: every{" "}
        <code>/memories/*</code> route 404s at the runtime unless it is built
        with <code>memory: {"{ access }"}</code> (or the deprecated{" "}
        <code>exposeMemoryRoutes: true</code>). The page never mentions either.
        So a reader who follows it gets <code>isAvailable: false</code> whatever
        their organization is entitled to, and the page tells them that means
        they are not entitled.
      </Callout>

      <Callout tone="warn" title="…and unentitled does not look like the page says">
        With the routes opened (the second runtime on the demo), the request
        reaches the platform, which answers{" "}
        <code>403 MEMORY_NOT_ENTITLED</code> for this project. The hook only
        flips <code>isAvailable</code> on 404 or 501, so it now reports{" "}
        <code>isAvailable: true</code>, and the page&apos;s{" "}
        <code>MemoryList</code> — which never reads <code>error</code> — renders
        an empty list. An unentitled user sees &quot;no memories yet&quot;, not
        &quot;memory is not available&quot;.
      </Callout>

      <Callout tone="warn" title="Smaller gaps">
        <code>realtimeStatus</code> stayed <code>connecting</code> on both
        runtimes and never reached the <code>unavailable</code> the page
        describes. The page shows reading and forgetting from React but never
        saving, though the hook has <code>addMemory</code>; saving is shown only
        over REST and MCP. The REST examples post to{" "}
        <code>https://your-deployment</code> without saying that managed users
        call <code>api.intelligence.copilotkit.ai</code>. And the agent in the
        take answers &quot;I&apos;ll keep my responses brief&quot; — it has no
        memory tools here, and nothing tells the user nothing was saved.
      </Callout>

      <Panel title="What the demo observed (1.71.0)">
        <pre className="overflow-x-auto rounded bg-slate-900 p-3 text-xs text-slate-100">
          {PROBE}
        </pre>
      </Panel>

      <Panel title="Source">
        <SourceCode file="frontend/src/app/intelligence/memories/memory-list.tsx" />
        <div className="mt-4">
          <SourceCode file="frontend/src/app/api/copilotkit-memory/[[...slug]]/route.ts" />
        </div>
        <div className="mt-4">
          <SourceCode file="frontend/src/app/intelligence/memories/demo-chat/page.tsx" />
        </div>
      </Panel>
    </>
  );
}
