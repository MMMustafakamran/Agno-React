"use client";

import { CopilotChat, useAgent } from "@copilotkit/react-core/v2";
import { useState } from "react";

import { DemoFrame } from "@/components/demo-frame";

/**
 * Watching a threadId get minted, and survive (or not) a remount.
 *
 * Remounting with a new React key is the failure mode the docs warn about: the
 * fallback id is computed with `useMemo`, so a remount silently starts a new
 * conversation. Pinning an explicit `threadId` prop is the fix.
 */
export default function Page() {
  const { agent } = useAgent({ agentId: "default" });
  const [explicitId, setExplicitId] = useState<string | undefined>();
  const [remountKey, setRemountKey] = useState(0);

  return (
    <DemoFrame
      parentPath="/threads/lifecycle"
      subtitle="minting, pinning, and remounting a threadId"
    >
      <div className="flex h-full flex-col">
        <div className="shrink-0 space-y-3 border-b border-slate-200 p-3 dark:border-slate-800">
          <dl className="grid grid-cols-[minmax(0,10rem)_1fr] gap-x-4 gap-y-1 text-xs">
            <dt className="text-slate-500">Shared agent threadId</dt>
            <dd className="break-all">
              <code>{agent.threadId ?? "—"}</code>
            </dd>
            <dt className="text-slate-500">Explicit id passed</dt>
            <dd className="break-all">
              <code>{explicitId ?? "none — chat mints its own"}</code>
            </dd>
            <dt className="text-slate-500">Remount count</dt>
            <dd>{remountKey}</dd>
          </dl>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setRemountKey((k) => k + 1)}
              className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium dark:border-slate-600"
            >
              Remount chat (new key)
            </button>
            <button
              type="button"
              onClick={() => setExplicitId(crypto.randomUUID())}
              className="rounded-md bg-[var(--accent)] px-3 py-1.5 text-sm font-medium text-white"
            >
              Mint + pin an explicit id
            </button>
            <button
              type="button"
              onClick={() => setExplicitId(undefined)}
              className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium dark:border-slate-600"
            >
              Clear explicit id
            </button>
          </div>
        </div>

        <div className="min-h-0 flex-1">
          <CopilotChat key={`${remountKey}-${explicitId}`} threadId={explicitId} />
        </div>
      </div>
    </DemoFrame>
  );
}
