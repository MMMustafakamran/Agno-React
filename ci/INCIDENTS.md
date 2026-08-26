# CI incidents

Failures this pipeline actually hit, what caused them, and what changed. Each
entry exists because the symptom did not name the cause — that gap is the whole
reason to write it down.

Newest first.

---

## The agent gave up on OpenAI after 5 seconds

`748dde5`

**Symptom** — Every demo on GitHub Actions failed with `Agent never produced a
response within 30s`. `backend.log`:

```
ERROR  API connection error from OpenAI API: Connection error.
```

Local runs passed. Same repo, same key, same lockfile.

**Cause** — `openai._constants.DEFAULT_TIMEOUT` is
`Timeout(timeout=600, connect=5.0)`, and agno forwards a timeout to the client
only when one is given (`_get_client_params` filters `None` out). `agent.py`
gave none, so opening the socket had a 5-second budget. `APIConnectionError`
stringifies a wrapped `ConnectTimeout` as `Connection error.`, which names
nothing.

Three shards each build the app with Turbopack, install Playwright and drive
Chromium under `xvfb`. The runner is saturated exactly when the agent first
calls out. Locally, connecting takes ~100ms.

**Why the Node check passed in the same job** — it allows 20 seconds and runs
*before* that work starts, on an idle machine. Node succeeding while Python
failed looked like a Python-specific network fault. It was load and budget.

**Fix** — `agent.py` states the budget: connect 30s, read 600s, 5 retries, all
env-overridable. Connect stays separate from read, so a slow connect is waited
out while a hung one is not and streaming keeps a long read budget. Passed via
`client_params`, because agno's own `timeout=` field is a float and would apply
one value to both.

---

## A preflight check that could not fail

`c8361cc`, fixed in the same series

**Symptom** — `✅ [Preflight] Backend → OpenAI reachability` on a run whose
demos then failed to reach OpenAI.

**Cause** — The probe was an inlined multi-line `python -c "..."` string. It did
not survive the shell: the command half-ran and exited 0. The check reported
success without ever contacting OpenAI.

**Fix** — The probe is a file (`ci/lib/probe-openai.py`) run through `uv run`,
and its own `OK` token is asserted in the output. A false green is worse than no
check.

**Rule this earned** — test the failure path of every check you add. A check
only verified against a healthy system is not a check.

---

## `drift:sync` reported success and wrote nothing

`786f26a`

**Symptom** — `npm run drift:sync` claimed the snapshot was updated. The next
drift run reported the same drift.

**Cause** — `applyDocUpdates()` was ported without `checkPage()` returning
`fullHash` / `fetchedText` / `bytes` / `lines`, so it had nothing to write — and
still stamped `syncedAt`, which made the snapshot look fresh.

**Fix** — `checkPage` returns the fetched content; `syncedAt` is refused when no
file was written.

---

## Manual runs failed before any job started

`16d44ad`

**Symptom** — Every `workflow_dispatch` failed instantly. No job, no log.

**Cause** — GitHub allows a `workflow_dispatch` at most **10 inputs**. One
checkbox per page came to 22 (25 in the sibling repo). The workflow was invalid,
and an invalid workflow fails before it runs.

**Fix** — Six checkboxes per doc *section* plus four options — exactly 10. The
section→page map is `PAGE_GROUPS` in `ci/lib/pages.mjs`, and a run fails if any
page belongs to no section, so a new page cannot quietly become unreachable.

The form is at the cap: adding an input means removing one.

---

## Servers died between steps

`16d44ad`

**Symptom** — Health checks timed out against servers the previous step had
started successfully.

**Cause** — Each `run:` step in a GitHub Actions job is a separate subshell. A
server started with `&` in one step is reaped before the next begins.

**Fix** — `ci/automate.mjs` spawns both servers itself and holds them for the
whole run. That is why the pipeline is one Node process and not a sequence of
YAML steps.

---

## The recorder raced a cold build

**Symptom** — The recorder aborted on its own preflight, reporting a dead
frontend that was demonstrably up.

**Cause** — Next.js compiles routes on demand. The first hit on a route — and
separately on the `/api/copilotkit` runtime endpoint — pays the Turbopack build,
which outlasts the recorder's timeout.

**Fix** — `warmFrontendRoutes()` and `warmRuntimeEndpoint()` compile both before
the recorder starts. A GET against the POST-only runtime route answers 405; that
is a compiled route.

---

## A stale server answered for the new one

**Symptom** — A run used an API key that had been changed, or behaved like code
that had been edited.

**Cause** — Windows lets a second process bind a port another is already
listening on. Requests land on whichever accepts first, so a leftover server
carrying old environment variables is indistinguishable from the new one.

Related: killing `main.py` can leave the port held. Uvicorn's `reload=True`
spawns a child that inherits the listening socket and outlives its parent.

**Fix** — `assertPortsFree()` refuses to start on a bound port and names the
PIDs. `--allow-port-reuse` records against them deliberately. Do not skip past
this one.

---

## The report printed the project's own name as a version

`16d44ad`

**Symptom** — `agno: agno-copilotkit-backend` in `RUN_REPORT.md`.

**Cause** — The dependency regex matched the bare name, so `agno` also matched
`name = "agno-copilotkit-backend"` on line 2 of `pyproject.toml`.

**Fix** — The version specifier is required in the match:
`["']${name}\s*([<>=~!][^"']*)["']`.

---

## Known traps

Not incidents yet. Each one has already cost time.

**`--upgrade` runs code you have never run.** It re-resolves dependencies on
the runner instead of installing the committed lock. Today
`uv lock --upgrade --prerelease=allow --dry-run` moves `openai` 3.3.1 → 3.4.0.

The nightly does this on purpose — catching a breaking upstream release is the
point of a canary — so a nightly failure has two possible causes and they look
identical. Re-run manually with the upgrade box unticked before debugging: if
the locked run passes, the dependency is the story, not the code.

**`openai` 3.x uses `httpx2`, agno uses `httpx`.** agno type-checks
`http_client` against `httpx` 0.28, so handing it an `httpx.AsyncClient` passes
its isinstance check and then reaches a client that no longer speaks that type.
Configure the client through `client_params` and `openai.Timeout` — never by
constructing an httpx client.

**`backend/.env` shadows the repo-root `.env`.** It is read first, so an
uncommented placeholder there beats a real key at the root.

**A secret pasted with a trailing newline is not a 401.** It becomes an illegal
HTTP header value and surfaces as the same generic connection error. The key is
stripped in `agent.py` and checked in `main.py` at startup.

---

## Ruled out, so nobody re-chases them

Recorded because each looked plausible and cost a round trip.

| Hypothesis | Disproved by |
|---|---|
| Key invalid, or no `gpt-4o` access | Live `models.list()` and a billed completion both succeeded |
| Quota exhausted | A real completion billed 11 tokens; exhaustion raises `RateLimitError`, not `APIConnectionError` |
| Runtime could not reach the agent | `POST /api/copilotkit/agent/default/run 200` in the frontend log |
| Prerelease `httpx` resolution | `uv lock --upgrade --dry-run` moved only `click` |
| The runner's Python has no network egress | The failure was a 5s connect timeout under load; raw TCP to `api.openai.com` connects |
| IPv6 with no route on the runner | `api.openai.com` resolves IPv4-only here; the probe reports per-family TCP results if it ever matters |
