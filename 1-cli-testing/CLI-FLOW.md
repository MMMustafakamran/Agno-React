# `npx copilotkit@latest create` — interactive flow spec (Agno)

Working map of every prompt the CLI is expected to show, in order, with the
keystroke that answers it. This is the input contract for automating the CLI run
(see [Automation notes](#automation-notes)); it is not a doc summary.

The CLI is entirely keyboard-driven — no mouse anywhere in the flow.

---

## ⚠ Status: PREDICTED, not observed

**Nobody has run `npx copilotkit@latest create` in this repo and watched it.**
Every prompt below is a prediction. Read the whole file that way.

Each step carries one of:

| Mark | Meaning |
|---|---|
| 🔵 **PREDICTED** | Carried over from the reference repo's real run of the *same* CLI against a *different* framework (`microsoft-agent-framework-py`), and expected to hold here because the prompt is framework-independent. Screen text has never been seen for Agno. |
| 🟠 **PREDICTED (framework-specific)** | The answer differs per framework, and this one is inferred from `npx copilotkit@latest framework list` rather than observed. |
| 🟢 **VERIFIED** | Checked in this repo today, by the means named in the step. |

Nothing here is 🟢 except where it says so, and no 🟢 mark covers *screen text* —
only facts checked outside the TUI.

### What actually was verified, and how

| Fact | How | When |
|---|---|---|
| The framework list has 23 rows; `agno` is one, `python`, accepting `-i --mock --channel` | `npx copilotkit@latest framework list`, output read in full | 2026-09-04 |
| `Agno` is a **unique** case-insensitive substring across all 23 row labels | Same output, compared row by row. Nearest neighbours (`AG2`, `A2A`, `AgentCore + LangGraph`, `AgentCore + Strands`) do not contain it | 2026-09-04 |
| Agno reads `OPENAI_API_KEY` | Same output, "Vendor keys each framework reads from .env" section | 2026-09-04 |
| The repo-root `.env` has `OPENAI_API_KEY` set | Read directly | 2026-09-04 |
| This account's Agno Intelligence project is `myapp1` (id 1559) | [.copilotkit/project.json](../.copilotkit/project.json) | 2026-09-04 |
| The Agno starter **does** ship `agent/` (a `uv`-managed Python agent) alongside `package.json`, `scripts/`, `src/`, `tsconfig.json` | The already-scaffolded copy at [yarn/app/](yarn/app/) | 2026-09-04 |
| The quickstart's CLI instructions live in the **"Start from scratch"** tab, not "Use an existing agent" | [doc-snapshot/pages/agno__quickstart.md](../doc-snapshot/pages/agno__quickstart.md) | 2026-09-04 |

**How to promote this file to observed:** run
`cd autorecorder && npm run capture -- --scaffold`, then read the cast it writes
into `autorecorder/casts/`. That file is the literal screen. Replace the
predictions with what it says, and change these marks.

---

## The keystroke script

The whole run, in order, as
[autorecorder/config/cli.config.ts](../autorecorder/config/cli.config.ts)
encodes it. Details and expected screen text per step below.

| # | Prompt | Keys | Mark |
|---|---|---|---|
| 1 | *(shell)* | `npx copilotkit@latest create --project myapp1` | 🟢 |
| 2 | `Ok to proceed? (y)` | `y` `Enter` — only if not npx-cached | 🔵 |
| 3 | banner | — | 🔵 |
| 4 | `App name` | `app` `Enter` | 🔵 |
| 5 | `Select agent framework` | walk to the row labelled **Agno**, `Enter` | 🟠 |
| 6 | sign-in / account link | `Enter` if it asks; otherwise nothing | 🔵 |
| 7 | `Select a project` | skipped — `--project myapp1` was passed | 🔵 |
| 8 | `Connect this project to a chat platform?` | walk to **Not now**, `Enter` | 🟠 |
| 9 | `Want me to install the dependencies…? [Y/n]` | `n` — **no Enter** | 🔵 |
| 10 | model API key | `Enter` — leave empty, CLI exits | 🔵 |

The model key is **not** supplied through the CLI. It is copied into the
generated project afterwards by `npm run capture -- --distribute`, from the
repo-root `.env`; the automation's job ends when the CLI exits.

---

## Preconditions

| Thing | Why it matters |
|---|---|
| Node + npx on PATH | The whole flow is `npx`-driven |
| Network | Downloads the `copilotkit` package and talks to Intelligence |
| A signed-in CopilotKit CLI session | `create` reuses an existing session and only opens browser sign-in when there is none — and refuses outright in a shell with no terminal. This is why the flow is local-only and not CI-able. Run `npm run capture -- --login` once first |
| Working directory | The app folder is created *under the cwd* — this folder — named at step 4 |

---

## The flow

### 1 · Launch 🟢 *(command), 🔵 (everything it prints)*

```
PS C:\Users\QS\Desktop\Fiqros\Agno-react\1-cli-testing> npx copilotkit@latest create --project myapp1
```

`--project` is passed deliberately, not as a shortcut. In the reference repo the
interactive project picker sat on "Verifying authentication…" until the step
timed out, twice, on a network where `copilotkit project list` answered
instantly. Naming the project skips the step that hangs; every other prompt stays
interactive and driven, which is the thing being QA'd.

`create` is an alias of `init`; both are documented and behave identically.

---

### 2 · npx package-install confirmation 🔵 *(conditional)*

```
Need to install the following packages:
copilotkit@<version>
Ok to proceed? (y)
```

**Input:** `y`, then `Enter`.
**Conditional:** this is npx's own prompt, not CopilotKit's. It only appears when
`copilotkit@latest` is not already in the npx cache, so the step is marked
`optional: true` — the driver waits for *either* this prompt or the banner in
step 3 and never sends `y` unconditionally.

---

### 3 · Banner 🔵 *(no input)*

Expected to be the same welcome block the reference repo recorded — an ASCII logo
over a short "Every app includes CopilotKit Intelligence" list. It stays pinned at
the top of the screen for the rest of the run, so it is a poor anchor for "which
step am I on" — always match on the question text instead. A rotating `Tip:` line
sits at the bottom, so "the buffer stopped changing" is not a valid ready-signal
either.

---

### 4 · App name 🔵

```
App name
Names your new app and its folder — lowercase, numbers, hyphens, max 30
> app
```

**Input:** type `app`, then `Enter`. The field starts empty in the reference
recording, so the driver types the name directly with no clearing step.
**Constraints:** lowercase letters, digits, hyphens; max 30 chars.
`app` is the name used throughout this repo, hence `<pm>/app`.

---

### 5 · Agent framework picker 🟠

**This is the step where this repo differs from the reference, and the one most
likely to go wrong silently.**

The picker opens with the highlight on row #1 and shows roughly six rows at a
time; the list scrolls under the highlight and **wraps** at the end.

**Input: walk down until the highlighted row reads `Agno`, then `Enter`.**
CLI id `agno`. The framework must match this repo's backend — any other selection
scaffolds a different agent framework and the whole matrix records the wrong
thing while reporting success.

`cli.config.ts` encodes this as:

```ts
select: { label: 'Agno', max: 40 }
```

not a keypress count. That is not a style preference: the reference repo's own
spec recorded "`ArrowDown` × 12" for its framework, and a single new integration
inserted above that row would move it. **Never write a count here.**
`npm run doctor` rejects a step that sends more than one arrow key without a
`select`.

**The 23 rows, from `npx copilotkit@latest framework list` (2026-09-04) 🟢:**

| id | runtime | label | flags |
|---|---|---|---|
| `a2a` | typescript | 🤖 A2A | `-i --channel` |
| `a2ui` | python | 🎨 A2UI | `-i --channel` |
| `adk` | python | 🤖 ADK | `-i --channel` |
| `adk-angular` | python | 🔺 Angular + ADK | `-i` |
| `ag2` | python | 🤖 AG2 | — |
| `agentcore-langgraph` | python | ⛅ AgentCore + LangGraph | `-i` |
| `agentcore-strands` | python | ⛅ AgentCore + Strands | `-i` |
| **`agno`** | **python** | **🧠 Agno** ← this repo | **`-i --mock --channel`** |
| `aws-strands-py` | python | 🧬 AWS Strands (Python) | `-i --channel` |
| `aws-strands-ts` | typescript | 🧬 AWS Strands (TypeScript) | `-i --mock --channel` |
| `claude-sdk-python` | python | 🔆 Claude Agent SDK (Python) | `-i --channel` |
| `claude-sdk-typescript` | typescript | 🔆 Claude Agent SDK (TypeScript) | `-i --channel` |
| `flows` | python | 👥 CrewAI Flows | `-i --channel` |
| `langgraph-fastapi` | python | 🦜 LangGraph (Python, FastAPI) | `-i` |
| `langgraph-js` | typescript | 🦜 LangGraph (JavaScript) | `-i --mock --channel` |
| `langgraph-py` | python | 🦜 LangGraph (Python) | `-i --mock --channel` |
| `llamaindex` | python | 🦙 LlamaIndex | `-i --mock --channel` |
| `mastra` | typescript | 🌑 Mastra | `-i --mock --channel` |
| `mcp-apps` | typescript | 🧩 MCP Apps | `-i --channel` |
| `microsoft-agent-framework-dotnet` | dotnet | 🟦 Microsoft Agent Framework (.NET) | `-i --channel` |
| `microsoft-agent-framework-py` | python | 🟦 Microsoft Agent Framework (Python) | `-i --channel` |
| `opengenui` | python | ✨ Open Generative UI | `-i --channel` |
| `pydantic-ai` | python | 🔼 Pydantic AI | `-i --mock --channel` |

Note the ordering above is `framework list`'s (alphabetical by id). **The TUI
picker's order is not known to be the same** — the reference repo's recording
showed a different order for the same 23 entries. That is precisely why the label
is named rather than the position counted, and why no row number appears here.

Behaviour observed *in the reference repo's* picker 🔵 and assumed to hold:
viewport of about six rows, the list scrolls under the highlight, the list wraps
from the last row back to the first, the highlight glyph is `❯`, and unselected
rows carry a per-framework emoji that is not stable text to match on.

---

### 6 · CopilotKit Intelligence sign-in / account link 🔵 *(conditional)*

Fires after the framework is chosen. No meaningful input — the operator waits for
auth to complete. Screen text was never captured even in the reference repo; it
falls in an unrecorded window there.

`cli.config.ts` sends a single `Enter` here, `optional: true`, matching
`Sign in with your browser|Verifying authentication`. Cheap either way: if the
screen is only a spinner the keypress is harmless, and if it is waiting for
acknowledgement nothing else was going to send it.

There is **no** Intelligence yes/no question: `-i, --intelligence` is a
deprecated no-op because Intelligence now ships with every supported framework —
`framework list` shows `-i` against `agno`. Agno's quickstart doc still presents
it as a choice; see [doc drift](#doc-vs-cli-drift).

**This is the step that decides whether the run can be unattended.** Run
`npm run capture -- --login` once beforehand and it becomes a precondition rather
than a mid-run pause.

---

### 7 · Intelligence project picker 🔵 *(skipped by `--project`)*

Normally never shown, because `--project myapp1` is passed at step 1. The step is
kept in `cli.config.ts` as `optional: true` so that dropping the flag — or a CLI
version that ignores it — still produces a driven run rather than a hang.

If it does appear, the driver walks to the row labelled `myapp1` rather than
pressing a bare `Enter`. `myapp1` is this account's Agno project 🟢
([.copilotkit/project.json](../.copilotkit/project.json), id 1559); the account
also holds `myapp`, `2` and `newproj`, so a bare `Enter` would bind the app to
whichever happens to sit at the top.

---

### 8 · Chat platform 🟠

```
Connect this project to a chat platform?

> 1. Slack
  2. Microsoft Teams
  3. Not now

You can add one later with `copilotkit channels add`
```

**Input:** walk to **Not now**, then `Enter`.

**Expected to appear here.** This prompt only shows for frameworks whose starter
ships a managed Channel host — `framework list` marks those `--channel`, and
`agno` is one 🟢, so it should always be asked. Five of the 23 (`ag2`,
`adk-angular`, `agentcore-langgraph`, `agentcore-strands`, `langgraph-fastapi`)
skip it entirely.

The step is nonetheless `optional: true`. The `--channel` flag says the starter
*can* host a channel, not that this CLI version prompts for it, and an optional
step that never matches is skipped rather than failed — whereas a required step
that never matches burns its whole timeout and then blames itself.

Corroborating evidence that the starter is channel-capable 🟢: the scaffolded
copy at [yarn/app/](yarn/app/) has a `channel` script and a
`tsconfig.channel.json`.

---

### 9 · Install dependencies 🔵

```
Want me to install the dependencies for you now? (npm install) [Y/n]
```

**Input: `n` — a single keypress, no `Enter`.** This prompt acts on the keystroke
immediately, unlike the text fields at steps 4 and 10. A driver that sends `n` +
`Enter` here leaks a stray `Enter` into step 10 and answers the key prompt before
it renders.

`Y` is the default, so a bare `Enter` would install. Dependencies are installed
separately afterwards, once per package manager — that is the entire point of
this folder, and letting the CLI run `npm install` here defeats it.

**Extra weight for Agno specifically 🟢:** this starter's `postinstall` runs
`install:agent`, which shells out to
`./scripts/setup-agent.sh || scripts\setup-agent.bat` to `uv sync` the Python
agent. So "install" here is not only a JS install, and letting the CLI do it
would put one manager's Python venv into the tree that all four copies are made
from.

---

### 10 · Model API key 🔵 *(text uncaptured)*

The CLI asks for a model API key as its last question. For `agno` that is
`OPENAI_API_KEY` 🟢.

**Input: `Enter` on an empty field.** The CLI then exits. The key is seeded into
the copies afterwards by `npm run capture -- --distribute`, into both `.env` and
`agent/.env`, so no recording ever contains a secret.

Exact prompt wording was not captured even in the reference repo, so the step
matches a loose `/API key/i` and is `optional: true`.

---

## Non-interactive flag surface

Every prompt above has a flag, so the same scaffold can be produced with no TUI
at all:

```bash
copilotkit create -n app -f agno --project myapp1 --channel none --no-install
```

| Flag | Answers |
|---|---|
| `-n, --name <name>` | Step 4 |
| `-f, --framework <id>` | Step 5 (`agno`) |
| `--project <slug\|id>` / `--create <name>` | Step 7 — pass one, never both |
| `--channel slack\|teams\|none` | Step 8; with the flag the offer is never shown |
| `-y` / `--install` / `--no-install` | Step 9 |
| `--no-banner` | Step 3 |

Sign-in (step 6) is the one answer no flag supplies.

These are **not** a replacement for the interactive run — typing through the
menus is the thing being QA'd. They are useful as a control: if the flag run
scaffolds cleanly and the TUI run does not, the bug is in the prompts, not the
templates.

---

## Post-conditions to assert

`cli.config.ts` asserts these after the scaffold flow, and they are 🟢 —
confirmed against the already-scaffolded [yarn/app/](yarn/app/):

- `1-cli-testing/app/package.json` exists
- `1-cli-testing/app/agent` exists — **Agno is a Python starter**, so its scaffold
  ships a `uv`-managed agent. A Node-agent framework (Mastra, LangGraph JS,
  Claude SDK TS) has none, and asserting it there would fail a scaffold that
  worked
- no dependencies are installed
- the project ships **without** a model key — expected, not a failure

---

## Automation notes

**This flow is implemented.** The steps above are encoded in
[autorecorder/config/cli.config.ts](../autorecorder/config/cli.config.ts) and
driven by [autorecorder/core/cli/](../autorecorder/core/cli/):

```bash
cd autorecorder
npm run selftest                  # prove the driver works on this machine
npm run selftest:demo             # prove the whole demo path works

npm run capture -- --login        # once; sign-in opens a browser
npm run capture -- --scaffold     # run the CLI, once
npm run capture -- --distribute   # copy it ×4, seed the model key
npm run capture -- --install-npm  # install per manager (…pnpm, yarn, bun)

npm run render -- --all           # videos 1 and 2 of all four sets
npm run record -- --demo-npm      # video 3, per manager
```

That produces twelve videos — three per package manager: the CLI creating the
app, that manager installing it, and its copy running and answering.

**Run the two selftests first.** They drive fixtures, not the real CLI, and they
are how you find out whether the PTY works on this machine at all. If they fail,
nothing in `cli.config.ts` will run and the failure will look like the target CLI
misbehaving.

The notes below are why it is built the way it is — keep them in mind when
editing the config.

- **Playwright cannot drive a terminal directly.** The CLI runs under a PTY
  (`node-pty`, native ConPTY on Windows) and the captured session is replayed in
  an `xterm.js` window for the camera. Capture and render are separate commands
  so a re-shoot never re-runs the CLI.
- **Gate every keystroke on its prompt text**, never on a timer. Steps 2 and 6
  vary in duration by minutes (cache state, sign-in).
- **Know which prompts consume `Enter` and which don't.** Steps 4 and 10 are text
  fields that need it; step 9 is a single-keypress y/n that does not. Getting
  this wrong shifts every later keystroke by one.
- **Match labels, not counts or positions.** Applies to steps 5, 7 and 8.
- **Poll the rendered buffer, not the DOM**, if driving through xterm.js — it
  virtualizes rows, so off-screen text is not in the DOM.
- **Strip ANSI** before matching. Prompts are colored and lists redraw in place on
  every arrow key.
- **Arrow keys must reach the PTY as escape sequences** (`\x1b[B` for down). A
  literal string write will not move the highlight.
- **`@latest` moves under you.** Each run may fetch a newer CLI than whatever was
  current when this file was written, changing the framework list and prompt
  wording without warning. Log the resolved version with every run so a failure
  can be attributed to a CLI change rather than to the driver; pin an exact
  version when a run must be reproducible.
- **CI: out of scope by design.** Step 6 needs interactive browser sign-in, and
  the CLI refuses to run in a shell with no terminal.

---

## Doc vs CLI drift

The [Agno quickstart](https://docs.copilotkit.ai/agno/quickstart) describes the
CLI as walking through **Project name → CopilotKit Intelligence (Yes/No) →
Framework** — the snapshot at
[doc-snapshot/pages/agno__quickstart.md](../doc-snapshot/pages/agno__quickstart.md)
says "Choose **Yes** to scaffold a project pre-wired for the platform … or **No**
for a standard Agno setup" 🟢.

There is no such yes/no in the CLI: `-i, --intelligence` is a deprecated no-op
and Intelligence ships with every supported framework. `framework list` confirms
`agno` carries `-i` 🟢. The order the automation expects is
name → framework → sign-in → project → channel → install → key.

Worth carrying into the README's known-issues section.

---

## Open questions

Everything the reference repo left open, plus what is specific to this port:

1. **Does the picker order match `framework list`'s?** `framework list` is
   alphabetical by id; the reference repo's TUI recording was not. Irrelevant to
   the automation, which names the row — but it decides how far the walk has to
   go, and hence `select.max` (currently 40, comfortably over 23).
2. What does step 6 actually print, and does it still appear when a CLI session
   is already cached?
3. What is the exact wording of the key prompt at step 10, and does it appear at
   all when install is accepted with `Y`?
4. Do digit keys select directly in the numbered menu at step 8?
5. What happens when the target folder already exists — overwrite, error, or
   re-prompt? This folder already contains `yarn/app`, though not `app`.
6. Does the Agno starter's `postinstall` (`uv sync` via
   `scripts/setup-agent.sh || scripts\setup-agent.bat`) survive all four package
   managers' shells? The reference repo found that **bun** mangles the backslash
   in exactly that line for its own starter. The same line is present here 🟢 —
   `1-cli-testing/yarn/app/package.json` line 11 — so the same failure is
   plausible and is the first thing to check when `--install-bun` runs.
