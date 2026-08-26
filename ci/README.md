# `ci/` — the recording pipeline

Everything that builds, starts, checks and records this repo lives here. The
only piece outside this folder is `.github/workflows/daily-recorder.yml`, because
GitHub requires that path.

## Layout

```
ci/
├── automate.mjs          entry point — one process, start to finish
├── INCIDENTS.md          failures this pipeline hit, and why
├── check-doc-drift.mjs   compares doc-snapshot/ against the live docs
├── list-pages.mjs        prints the recorder's page ids
├── validate-pages.mjs    rejects unknown ids before a run starts
├── resolve-selection.mjs expands dispatch checkboxes + ids into a page list
├── run-name.mjs          names the run's artifacts (Agno-react-18Aug2026-0612UTC)
└── lib/
    ├── config.mjs        paths, ports, URLs
    ├── env.mjs           loads .env files the way backend/main.py does
    ├── pages.mjs         reads page ids from the recorder's config
    ├── preflight.mjs     port, credential and warmup checks
    ├── probe-openai.py   proves the backend's Python env can reach OpenAI
    ├── mux.mjs           voiceover muxing (the only implementation)
    └── report.mjs        RUN_REPORT.md / .json
```

## Commands

| Command | What it does |
|---|---|
| `npm run automate` | Full pipeline: drift → preflight → deps → servers → record |
| `npm run automate:pull` | Same, after `git pull` |
| `npm run automate:upgrade` | Same, upgrading dependencies first |
| `npm run drift` | Doc drift check on its own |
| `npm run drift:sync` | Update `doc-snapshot/` to match live docs |
| `npm run ci:pages` | List valid page ids |

Anything not consumed by `automate.mjs` is forwarded to the recorder:

```bash
node ci/automate.mjs --pages=quickstart,ag-ui
node ci/automate.mjs --shard=1/3
node ci/automate.mjs --limit=3 --ignore-doc-drift
```

## Flags

| Flag | Effect |
|---|---|
| `--pull` | `git pull` first |
| `--upgrade` | Upgrade deps instead of installing the lockfile |
| `--skip-install` | Skip dependency installation |
| `--ignore-doc-drift` / `--force` | Record even if the live docs moved |
| `--allow-port-reuse` | Record against servers that are already running |
| `--skip-credential-check` | Skip the model-credential preflight |

## What runs, in order

1. **Doc drift** — compares each `doc-snapshot/pages/*.md` hash against the live
   page. Drift halts the run with exit code 2 unless `--ignore-doc-drift`.
2. **Preflight** — loads `.env`, then refuses to continue if a port is already
   held or the model credential is missing/rejected. Both checks are cheap and
   both have cost a full run before.
3. **Dependencies** — `uv sync` for the backend, `npm install` for the frontend
   and recorder.
4. **Backend reachability** — runs `lib/probe-openai.py` through `uv run`, so the
   check uses the same interpreter, resolver and TLS stack the agent will. It has
   to come after `uv sync`, because the venv does not exist before that. A
   Node-side check is not a substitute: a run passed the Node check and then
   failed every demo with `API connection error from OpenAI API`.
5. **Servers** — backend (Agno AgentOS) and frontend, spawned from this process,
   logging to `autorecorder/videos/logs/`.
6. **Health + warmup** — poll until both answer, then compile the heaviest routes
   and `/api/copilotkit` so the recorder is not racing a cold Turbopack build.
7. **Record** — hand off to the recorder with the forwarded flags.
8. **Mux + report** — always runs, success or failure.

## Why one process

Each `run:` step in a GitHub Actions job is a separate subshell. A server
started with `&` in one step is reaped before the next step begins. Spawning
both servers from inside `automate.mjs` keeps them alive for the whole run,
which is why the pipeline is a Node program and not a sequence of YAML steps.

## Page selection

`autorecorder/config/pages.config.ts` is the single source of truth for which
demos exist. `lib/pages.mjs` reads the ids from it, `list-pages.mjs` prints
them, and `validate-pages.mjs` checks a selection against them.

The workflow does **not** restate the list. It used to, in two more places, and
they drifted whenever a page was renamed.

### Choosing pages on a manual run

The dispatch form has a checkbox per **doc section** plus a free-text field for
exact ids. Tick sections, type ids, or both — the two are combined.

| Checkbox | Pages |
|---|---|
| Getting Started | quickstart, prebuilt-components |
| Custom Look & Feel | programmatic-control, inspector, slots, headless-ui |
| Generative UI | display-only, interactive, tool-rendering |
| App Control | frontend-tools, human-in-the-loop |
| Rich Threads | threads-drawer, threads-headless, threads-lifecycle |
| Backend & Troubleshooting | copilot-runtime, ag-ui, error-debugging |

Nothing ticked and nothing typed means **all pages** — what the nightly schedule
does.

**Why sections rather than one checkbox per page:** GitHub allows a
`workflow_dispatch` at most **10 inputs**. Seventeen page checkboxes plus the
options came to 22, which made the workflow invalid — every manual run failed
before a job started. Six section checkboxes plus four options is exactly 10, so
the form is now at the cap: adding an input means removing one.

The section map lives in `PAGE_GROUPS` in `lib/pages.mjs`, and a run fails if any
page belongs to no section, so nothing can quietly become unreachable.

## Adding a page

1. Add it to `autorecorder/config/pages.config.ts`.
2. Add its id to a section in `PAGE_GROUPS` (`ci/lib/pages.mjs`).

Skipping step 2 fails the run with the page named, rather than silently dropping
it from the form.

## The nightly run

`0 6 * * *` — 06:00 UTC, **11:00 AM PKT**, every day. Pakistan is UTC+5 with no
DST, so the local time never shifts.

A scheduled event carries no dispatch inputs, so the fallbacks in the record
step are the nightly policy:

| | Nightly | Manual dispatch |
|---|---|---|
| Pages | all 17, across 3 shards | whatever is ticked or typed |
| Dependencies | **upgraded** (`ncu -u --peer`, `uv sync --upgrade`) | the lockfiles, unless ticked |
| Doc drift | **fails the run** | records anyway, unless ticked |

The nightly is deliberately the strict one — it exists to catch a breaking
upstream release or a rewritten doc page, so it runs against the newest
dependencies and refuses to publish videos of docs that have since changed. A
manual run is the lenient one, because it is usually being used to look at a
specific page.

Two consequences worth knowing:

- **Drift halts before anything records.** Step 0 exits with code 2 and all
  three shards fail, so a drifted night produces no videos at all. Resolve it
  with `npm run drift:sync`, or re-run manually leaving the drift box unticked.
- **An upgraded run is not the lockfile.** `--upgrade` re-resolves on the
  runner, so a nightly failure may be a new dependency rather than a new bug.
  Re-run manually with the box unticked to tell the two apart — if that passes,
  the upgrade is the cause. `ncu --peer` already withholds anything that would
  break a peer dependency.

## CI shape

`prepare` resolves the run name and page list once. Three workers each record a
third of the pages under `xvfb-run`, then `consolidate-recordings` merges the
artifacts.

```
            ┌─ Worker 1/3 ─┐
prepare ────┼─ Worker 2/3 ─┼─→ consolidate-recordings
            └─ Worker 3/3 ─┘
```

## Artifact names

Every artifact is named for the project and the moment the run started:

```
Agno-react-18Aug2026-0612UTC             ← consolidated, all clips
Agno-react-18Aug2026-0612UTC-shard-1     ← one worker's output
```

`prepare` computes the stamp once (`ci/run-name.mjs`) and passes it to the other
jobs, so all four names agree. Change the prefix via `PROJECT_SLUG` in
`lib/config.mjs`.

## Secrets and variables

| Name | Kind | Purpose |
|---|---|---|
| `OPENAI_API_KEY` | secret | Model provider key |
| `AZURE_OPENAI_API_KEY` / `AZURE_OPENAI_ENDPOINT` | secret | Azure instead of OpenAI |
| `COPILOTKIT_LICENSE_TOKEN` / `NEXT_PUBLIC_COPILOTKIT_LICENSE_KEY` | secret | Unlocks the Rich Threads pages |
| `INTELLIGENCE_API_KEY` | secret | Managed thread store |
| `OPENAI_MODEL` | variable | Model override (default `gpt-4o`) |
| `OPENAI_CONNECT_TIMEOUT` | variable | Seconds to wait for a socket to OpenAI (default 30) |
| `OPENAI_REQUEST_TIMEOUT` / `OPENAI_MAX_RETRIES` | variable | Read budget and retry count (default 600 / 5) |
| `INTELLIGENCE_API_URL` / `INTELLIGENCE_GATEWAY_WS_URL` | variable | Endpoint overrides |

Without the Intelligence pair the three Rich Threads pages still record, but the
drawer stays locked and mutations return 422.

## Troubleshooting

**"Ports already in use"** — a previous run's servers survived. Stop the listed
PIDs, or pass `--allow-port-reuse` to record against them. Do not ignore this:
Windows lets a second process bind a port another is already listening on, and
requests then land on whichever accepts first, so a stale server holding old
environment variables can answer instead of the new one.

**"OPENAI_API_KEY is missing or still the placeholder"** — set a real key in
`backend/.env` or the repo-root `.env`. Note the precedence: `backend/.env` is
read first, so an uncommented placeholder there shadows a real key at the root.

**"Agent never produced a response" and `API connection error from OpenAI API`
in `backend.log`** — that pairing is a *connect* timeout, not a dead network.
The OpenAI SDK defaults to a 5-second connect budget and agno only overrides it
when asked, so on a runner busy compiling Next.js and driving Chromium the agent
gave up before the socket opened, while the Node credential check — which runs
earlier, on an idle machine, with a 20-second budget — passed in the same job.
`backend/agent.py` now sets the budget explicitly; raise
`OPENAI_CONNECT_TIMEOUT` if a slower environment still trips it.

**Server died mid-run** — read `autorecorder/videos/logs/backend.log` and
`frontend.log`. They are uploaded with the CI artifacts.

See [`INCIDENTS.md`](INCIDENTS.md) for the failures behind these checks —
including the ones whose symptom named the wrong cause — and for the hypotheses
already ruled out.

**Recorder aborts on preflight** — the frontend was still compiling. The warmup
step covers the usual routes; a page added to `WARMUP_ROUTES` in `lib/config.mjs`
gets the same treatment.
