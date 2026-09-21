import { RouteHeader } from "@/components/route-header";
import { SourceCode } from "@/components/source-code";
import { Callout, Panel, TryIt } from "@/components/ui";

const IMPORT_FIX = `- import { useMemories } from "@copilotkit/react-core";       # until 2026-09-21
+ import { useMemories } from "@copilotkit/react-core/v2";    # published now

Before: TS2305 (no such export at the package root), plus TS7006 on the
        .map callback, plus a Turbopack compile error under Next 16 for any
        route importing the file.
After:  the file compiles and the demo mounts it directly.`;

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

      <Callout tone="success" title="Fixed upstream: the import now points at /v2">
        The React snippet used to import <code>useMemories</code> from{" "}
        <code>@copilotkit/react-core</code>, which has no such export; it ships
        only from <code>@copilotkit/react-core/v2</code>. The 2026-09-21 sync
        publishes the <code>/v2</code> path, so the verbatim file compiles and
        this route mounts it instead of the private copy the demo used to carry.
        Nothing else on the page changed, so the runtime findings below still
        stand.
        <pre className="mt-3 overflow-x-auto rounded bg-slate-900 p-3 text-xs text-slate-100">
          {IMPORT_FIX}
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

      <Callout tone="warn" title="The page's own success check does not pass here">
        The 2026-09-17 sync added &quot;Set up Memory manually&quot;, which ends
        with <em>Save and recall a memory</em>: save one for the signed-in user,
        recall it with a related query in a new conversation, and confirm it
        comes back. This demo cannot complete that step. The agent in the take
        answers &quot;I&apos;ll keep my responses brief&quot; — it has no memory
        tools here, and nothing tells the user nothing was saved. The page
        still shows reading and forgetting from React but never saving, though
        the hook has <code>addMemory</code>; saving is shown only over REST and
        MCP.
      </Callout>

      <Callout tone="warn" title="Smaller gaps">
        <code>realtimeStatus</code> stayed <code>connecting</code> on both
        runtimes and never reached the <code>unavailable</code> the page
        describes. The REST examples post to{" "}
        <code>https://your-deployment</code> without saying that managed users
        call <code>api.intelligence.copilotkit.ai</code>.
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
