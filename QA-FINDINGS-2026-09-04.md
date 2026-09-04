# QA findings — 2026-09-04 sync

**Repo:** Agno-react · **Docs:** <https://docs.copilotkit.ai/agno>

**Versions pinned for every finding below:**

| Package | Declared | Installed |
| --- | --- | --- |
| `@copilotkit/react-core` | — | 1.x (v2 entrypoint) |
| `zod` | — | **4.4.3** |
| `agno` | — | see `backend/pyproject.toml` |

6 pages drifted. Two findings here are not about the docs at all — they are
defects in this harness that the pipeline could never have caught.

---

## 1. Two frontend tools were never handed to the agent — HIGH (harness bug)

`backend/tools/frontend_tools.py` has defined four `external_execution=True`
tools since the first commit. `backend/tools/__init__.py` put **two** of them in
`FRONTEND_TOOLS`.

The model cannot call a tool it has not been given. So:

- **`/human-in-the-loop` could never pause for a choice.** The route, the global
  `useHumanInTheLoop` registration, and the recorder action that clicks an
  option were all correct and all unreachable.
- **`addBookmark` on App Control could never fire.**

Neither failed loudly. No error, no console warning — the model simply answered
in prose, which reads exactly like a model choosing not to use a tool. Drift
passed. Recording passed. The clips showed a working chat doing the wrong thing.

This is the "silent failure" case the brief says the pipeline cannot catch,
sitting in the repo's own wiring rather than in the docs.

The tell was a comment in `global-frontend-tools.tsx` asserting *"the Agno agent
declares all four with `external_execution=True`"*. It was false.

**Fixed.** All tools are now in `FRONTEND_TOOLS`; verified by importing
`ALL_TOOLS` and listing the registered names.

**Consequence for the record:** any prior `/human-in-the-loop` clip is invalid.
It did not show the feature failing — it showed the harness never asking for it.

---

## 2. Governed Action Approval UI — new page, HIGH

**Page:** `/agno/human-in-the-loop/governed-actions`, added 2026-09-04
**Route:** `/human-in-the-loop/governed-actions` (new)

Found only by running the sitemap comparison by hand — see §5.

### 2a. `z.record(z.unknown())` does not compile on zod 4

The page publishes the tool schema with `arguments: z.record(z.unknown())`.
That is the zod 3 signature. This repo runs **zod 4.4.3**, where `z.record`
requires both a key schema and a value schema:

> `TS2554: Expected 2-3 arguments, but got 1`

The page names no zod version. The identical snippet compiles unchanged in the
Mastra harness on zod 3.25.76. **Whether the published code works depends
entirely on a dependency the page never mentions.**

Translated here to `z.record(z.string(), z.unknown())`, and only because this
registration is mounted at the app root: left failing it would take down every
route rather than demonstrate anything. The departure is marked in the source.

### 2b. The model decides the verdict — which the page's own guardrail forbids

`verdict` sits in the tool *parameters*, so the value deciding whether an action
is allowed, denied, or needs approval is produced by the model from the prompt.

The page's first guardrail says the opposite: *"Check policy on the server
before presenting the approval, not only in the browser."*

Nothing in the tool-call variant does that, and nothing on the page reconciles
the two. Followed as written, the approval UI asks the user to ratify a verdict
the model invented — which is the failure mode a governed-action gate exists to
prevent.

### 2c. The other guardrails are prose only

A stable `id` and `reference` to prevent replay, treating `deny` as terminal,
logging the decision — none are implemented. `handleApproval`, which compares
`actionId` and `reference`, is defined and wired to nothing; the tool variant
never calls it.

### 2d. The auto-verdict effect omits the handlers it calls

`GovernedActionCard` auto-approves on `allow` and auto-blocks on `deny` from a
`useEffect` keyed on `[action.id, action.verdict]`, while calling `onApprove`
and `onBlock`. Linted verbatim:

> React Hook useEffect has missing dependencies: 'onApprove' and 'onBlock'.

### 2e. The `useInterrupt` half is not implementable

It reads `interrupt?.metadata?.action`. `Interrupt.metadata` is a real optional
field, so the snippet is well-formed — but it needs a backend that pauses a run
and attaches an action, which the Agno agent does not. The page shows only the
consuming half.

---

## 3. The `/premium` → `/intelligence` move defeats drift detection — HIGH

This repo was the only one tracking a `/premium/*` page directly:
`/agno/premium/threads-explained`.

Both `/agno/premium/threads-explained` and
`/agno/intelligence/threads-explained` return **200 with byte-identical
markdown**. The old path is now **absent from the sitemap entirely** while still
being served — a delisted live duplicate, not a redirect.

So the drift check pinned to the old path saw nothing: no 404, no hash change,
nothing to report. It would have gone on reporting "no drift" however far the
two copies diverged.

**Fixed:** the snapshot file, the manifest key and the nav entry now follow
`/agno/intelligence/threads-explained`.

---

## 4. Credentials — HIGH

`INTELLIGENCE_API_KEY` → `CPK_INTELLIGENCE_API_KEY` across quickstart,
headless-threads, inspector, threads-import and threads-lifecycle. Placeholder
`your_license_key` → `cpk-...`, and the prose stopped calling it a license key.

Nothing says whether the old name still works, so both runtime routes read the
new name first and fall back to the old one.

### 4a. The rename covered only half a pair

`threads-import` now exports `CPK_INTELLIGENCE_API_KEY` on one line and
`INTELLIGENCE_API_URL` — untouched — on the line directly above it. The page
asks you to export one prefixed variable and one unprefixed one for the same
credential pair, and never says whether the URL was missed or is deliberately
unprefixed.

### 4b. The example key changed shape without a word

The sample value went from `cpk_...` to `cpk-...` — underscore to hyphen.
Elsewhere the docs describe "a project-scoped `cpk` runtime key" without pinning
the separator. One of the two is wrong and the page does not say which, so a
reader typing it by hand has a coin flip.

### 4c. Managed projects and the license token contradict each other

Headless Threads now states that managed project setup does *not* issue
`COPILOTKIT_LICENSE_TOKEN`, and that it is for offline or self-hosted licensing
only. The drawer still gates on a license status and stays locked without one.
Nothing reconciles these.

Also newly named and never defined: `SL_ENABLED`.

---

## 5. Tooling gap found while doing this sync — HIGH

`npm run drift:sync` compares hashes of pages already in the manifest. It never
fetches the sitemap, so a page appearing or disappearing upstream is invisible
to it — that comparison lives solely in the `/doc-sync` server action.

A clean CLI run prints **NO DOC DRIFT**, which reads as "the docs have not
moved" when it only means "the pages we already knew about have not moved".
`governed-actions` (§2) was invisible for exactly this reason, and so was the
delisting in §3.

Running the comparison by hand found 8 URLs under `/agno` neither tracked nor
previously recorded: 7 `/intelligence/*` renames plus `/webmcp`.

**Fixed:** the CLI script now prints its own scope on every run, and the
manifest's `sitemap` block is rebuilt from what the sitemap actually lists.

---

## Coverage after this sync

| Area | State |
| --- | --- |
| 6 drifted pages | implemented |
| `governed-actions` | new route, demo, backend tool, recorder action, tracked |
| `offerOptions` / `addBookmark` | now reachable — first time |
| `threads-explained` path | repointed to `/intelligence/` |
| Sitemap record | rebuilt, clean |
| `webmcp` | **not covered** — new top-level page, no route |
| `useInterrupt` variant of governed actions | **not covered** — no backend can emit the interrupt |
| Recordings | **not re-run.** |

**Re-record `/human-in-the-loop` first.** Its previous clip is invalid: the
agent had no `offerOptions` tool, so whatever it did on film, it was not the
feature the page documents. This is the highest-value recording in the repo
right now.

`governed-actions` has a dedicated recorder action — the standard
prompt-and-wait would film an approval card nobody approves and end on a
spinner. It reads the arguments block, clicks **Approve and run**, then waits
for the agent to continue.
