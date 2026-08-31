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
    <Callout tone="warn" title="Session storage is a stated prerequisite">
      The doc page now says Agno has to store the paused run before a frontend
      tool can hand its result back, and that the agent owning the tool needs a{" "}
      <code>db</code>. This harness configures it as published —{" "}
      <code>SqliteDb(db_file=&quot;tmp/agno.db&quot;)</code> in{" "}
      <code>backend/agent.py</code>, with <code>sqlalchemy</code> declared in{" "}
      <code>backend/pyproject.toml</code>.
      <p className="mt-2">
        Worth knowing while testing: every route below was already recorded
        working against an agent with no <code>db</code> at all, and the page
        does not say which versions make it mandatory. The published path is
        also relative to the directory the server was started from, which the
        page never states.
      </p>
    </Callout>
  );
}
