import { Callout } from "./ui";

/**
 * The "Configure session storage" precondition added to four doc pages on
 * 2026-08-30 (frontend-tools, human-in-the-loop, and both your-components
 * pages).
 *
 * Shared because the docs repeat the same callout verbatim on all four, and
 * because all four routes here are driven by the one agent in
 * `backend/agent.py` — so there is one `db` to point at, not four.
 */
export function SessionStorageCallout() {
  return (
    <Callout tone="warn" title="Session storage — required, and it really is">
      Agno has to persist the paused run before a frontend tool can hand its
      result back, so the agent that owns the tool needs a <code>db</code>.
      Without one, the browser half works and then the run dies with{" "}
      <em>Frontend tool resume requires a database</em> — which is exactly what
      this harness hit on this route before the requirement was documented.
      <p className="mt-2">
        Configured as published:{" "}
        <code>SqliteDb(db_file=&quot;tmp/agno.db&quot;)</code> in{" "}
        <code>backend/agent.py</code>, with <code>sqlalchemy</code> declared in{" "}
        <code>backend/pyproject.toml</code>. Note the published path is relative
        to the directory the server was started from, which the doc page never
        states.
      </p>
    </Callout>
  );
}
