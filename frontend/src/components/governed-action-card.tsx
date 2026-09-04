"use client";

import { useEffect } from "react";

/**
 * The approval card from the Governed Action Approval UI page, as published.
 *
 * Kept in its own module because the tool registration is global (see
 * `global-frontend-tools.tsx`) while the route page wants to show this source
 * on its own. The body is the page's `GovernedActionCard` unchanged, including
 * the effect whose dependency array omits the handlers it calls.
 */

// [1] governed actions: the action envelope
// [!code highlight]
export type GovernedAction = {
  id: string;
  summary: string;
  tool: string;
  reference: string;
  verdict: "allow" | "deny" | "require_approval";
  arguments: Record<string, unknown>;
};

// [2] governed actions: the approval card
// [!code highlight]
export function GovernedActionCard({
  action,
  onApprove,
  onReject,
  onBlock,
}: {
  action: GovernedAction;
  onApprove: () => void;
  onReject: () => void;
  onBlock: () => void;
}) {
  useEffect(() => {
    if (action.verdict === "allow") onApprove();
    if (action.verdict === "deny") onBlock();
  }, [action.id, action.verdict]);

  const status =
    action.verdict === "allow"
      ? "Allowed by policy"
      : action.verdict === "deny"
        ? "Blocked by policy"
        : "User approval required";

  return (
    <section className="my-2 rounded-lg border border-slate-200 p-4 shadow-sm dark:border-slate-700">
      <div className="space-y-1">
        <p className="text-sm font-medium">{status}</p>
        <h3 className="text-base font-semibold">{action.summary}</h3>
        <p className="text-sm text-slate-500">Tool: {action.tool}</p>
        <p className="text-sm text-slate-500">Reference: {action.reference}</p>
      </div>

      <pre className="mt-3 overflow-auto rounded bg-slate-950 p-3 text-xs text-slate-100">
        {JSON.stringify(action.arguments, null, 2)}
      </pre>

      {action.verdict === "require_approval" && (
        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onClick={onApprove}
            className="rounded-md bg-[var(--accent)] px-3 py-1.5 text-sm font-medium text-white"
          >
            Approve and run
          </button>
          <button
            type="button"
            onClick={onReject}
            className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium dark:border-slate-600"
          >
            Reject
          </button>
        </div>
      )}
    </section>
  );
}
