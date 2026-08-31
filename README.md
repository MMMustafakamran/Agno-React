# CopilotKit + Agno Test Suite

A navigable, working test harness covering every page of the CopilotKit Agno documentation — each doc page is a route that actually runs the thing it describes.

|                         |                                                                                                                                                                       |
| ----------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Doc sync date**       | Machine-maintained — `doc-snapshot/manifest.json` → `syncedAt`, rewritten on every sync                                                                               |
| **CopilotKit packages** | `@copilotkit/react-core` 1.66.2 · `@copilotkit/runtime` 1.66.2                                                                                                        |
| **AG-UI packages**      | `@ag-ui/agno` 0.0.5 · `@ag-ui/client` 0.0.57                                                                                                                          |
| **Frontend**            | Next.js 16.3.0 (App Router) · React 19.2 · TypeScript · Tailwind 4                                                                                                    |
| **Backend**             | Python 3.12 · Agno 2.8.6 · FastAPI/AgentOS                                                                                                                            |
| **Build status**        | No CI. Locally verified: 21 doc routes + 15 demo routes, live agent run ✅, rendered source byte-matches disk ✅. **Typecheck currently failing** — see Known issues. |

---

## 2. Overview

[Agno](https://docs.agno.com) is a Python agent framework. Its `AgentOS` server can expose an agent over [AG-UI](https://ag-ui.com), the event protocol CopilotKit speaks, which is what lets a React app drive an Agno agent with streaming, tool calls, and generative UI.

This repo is a **living test harness** for that integration. Each route implements what its doc page teaches — not a restatement of it. It covers a deliberately scoped subset of `https://docs.copilotkit.ai/agno`: the CLI, Build-with-agents, MCP Apps, A2UI, Intelligence Platform, Common Issues, and Migration-guide sections are intentionally out of scope and have no route. Routes that cannot work locally (licensed features, or ones needing a service this repo doesn't ship) are clearly labelled and explain exactly what's missing, rather than being faked.

Tracks: **<https://docs.copilotkit.ai/agno>**

---

## 3. Architecture

```
Browser (React 19)
  │  @copilotkit/react-core/v2 — CopilotKitProvider, CopilotChat, hooks
  │  POST /api/copilotkit
  ▼
Next.js 16 App Router  ·  localhost:3000
  │  Copilot Runtime  (@copilotkit/runtime)
  │  agents: { default, agno_agent } → new AgnoAgent({ url })
  │  POST http://localhost:8000/agui   ← AG-UI over SSE
  ▼
Agno AgentOS  ·  localhost:8000        ← Python / FastAPI
  │  AgentOS(agents=[agent], interfaces=[AGUI(agent=agent)])
  ▼
OpenAI  (gpt-4o by default)
```

Three points worth noting:

- **The backend for this framework is Python.** Agno is a Python library; the agent runs under `uvicorn`, not Node.
- **The runtime lives inside the Next app**, at `frontend/src/app/api/copilotkit/[[...slug]]/route.ts`. There is no third server.
- **The model key never reaches the browser.** Only the Agno process holds it, and the browser never talks to Agno directly.

---

## 4. Prerequisites

| Requirement                        | Version                | Notes                                               |
| ---------------------------------- | ---------------------- | --------------------------------------------------- |
| Node.js                            | 20+ (built on 24.16.0) | Next.js 16 requires 20+.                            |
| npm                                | 10+ (built on 12.0.1)  | Or pnpm/yarn/bun.                                   |
| Python                             | 3.9+ (built on 3.12.3) | Per the Agno quickstart.                            |
| [`uv`](https://docs.astral.sh/uv/) | 0.11+                  | Used for the backend. `pip` works too.              |
| OpenAI API key                     | —                      | Required.                                           |
| CopilotKit license key             | —                      | **Optional.** Only unlocks the Rich Threads routes. |

No framework-specific CLI is required. The CopilotKit CLI (`npx copilotkit@latest`) scaffolds new projects and signs into the licensed platform; this repo is already scaffolded, so you don't need it.

---

## 5. Setup

**1. Clone**

```bash
git clone <this-repo> agno && cd agno
```

**2. Install frontend deps**

```bash
cd frontend && npm install && cd ..
```

**3. Install backend deps**

```bash
cd backend && uv sync && cd ..
```

**4. Configure the environment**

```bash
cp .env.example backend/.env
```

Then edit `backend/.env`:

| Variable                             | Where                 | What it does                                                                 |
| ------------------------------------ | --------------------- | ---------------------------------------------------------------------------- |
| `OPENAI_API_KEY`                     | `backend/.env`        | **Required.** The model key. The backend refuses to start without it.        |
| `OPENAI_MODEL`                       | `backend/.env`        | Model id. Defaults to `gpt-4o`.                                              |
| `AGENT_PORT`                         | `backend/.env`        | Agno's port. Defaults to `8000`.                                             |
| `AGENT_CORS_ORIGINS`                 | `backend/.env`        | Origins allowed to hit the agent directly. Not needed on the normal path.    |
| `AGNO_AGENT_URL`                     | `frontend/.env.local` | Where the runtime finds the agent. Defaults to `http://localhost:8000/agui`. |
| `NEXT_PUBLIC_COPILOTKIT_LICENSE_KEY` | `frontend/.env.local` | Browser-safe `ck_pub_…` key. Unlocks Rich Threads. Optional.                 |

> Next.js does not read the repo-root `.env`. Frontend variables belong in `frontend/.env.local`. The defaults are correct for a standard local run, so in practice you only need `OPENAI_API_KEY`.

**Default ports:** frontend **3000**, backend **8000**.

**5. Updating packages to latest versions (optional)**

To update dependencies to their latest versions:

- **Frontend (`frontend/`)**:

  ```bash
  cd frontend

  # Option A: Update all dependencies to latest major/minor versions
  npx npm-check-updates -u && npm install

  ```

  > **Note:** If `@ag-ui/*` packages are updated, verify the versions in the `overrides` section in `frontend/package.json` match to prevent version mismatches.

- **Backend (`backend/`)**:

  ```bash
  cd backend
  # Using uv (recommended) — upgrade uv.lock and sync:
  uv lock --upgrade ; uv sync

  ```

---

## 6. Running the project

Two processes, two terminals.

**Terminal 1 — the agent:**

```bash
cd backend
uv run main.py
```

Success looks like:

```
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
INFO:     Application startup complete.
```

If `OPENAI_API_KEY` is missing it exits immediately with a message telling you so — deliberately, rather than starting and failing on the first message.

**Terminal 2 — the app:**

```bash
cd frontend
npm run dev
```

Success looks like:

```
▲ Next.js 16.3.0 (Turbopack)
- Local:   http://localhost:3000
✓ Ready in 1.2s
```

Open **<http://localhost:3000>**. The home page probes the agent server-side and shows a connection panel — check it first if anything misbehaves.

---

## 7. What to expect — walkthrough per section

Every route shows a status badge and a link to the doc page it tests. "Pass" and "Fail" below are what a tester should look for.

### How each route is split

Routes with a live feature are split in two:

|                         |                                                                                                                                                    |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| **`<route>`**           | Notes, pass/fail criteria, and **the exact source** of the implementation, read off disk at render time. No live chat here.                        |
| **`<route>/demo-chat`** | Just the running feature, with no sidebar or page chrome — built for screen recording. Reached via the **Open demo ↗** button in the route header. |

Two consequences worth knowing:

- **The code on a page is never a re-typed approximation.** Each page reads real files from the repo (`frontend/src/lib/source.ts`), so what you compare against the doc is what actually runs. Some excerpts use `#region` markers, which stay visible in the source file and are labelled with their line numbers.
- **Demo routes share the app-wide provider**, so a conversation started in a demo continues on any other route. That's deliberate — `/custom-look-and-feel/headless-ui/demo-chat` and `/custom-look-and-feel/programmatic-control/demo-chat` show the _same_ conversation through two completely different UIs.

15 of the 21 doc routes have a demo: quickstart, prebuilt-components, the three interactive thread routes, all four Custom Look and Feel routes, display-only, tool-rendering, frontend-tools, human-in-the-loop, both Backend routes, and error-debugging. The remaining 6 are reference pages with nothing to run (or, in the case of Interactive, a doc page with nothing in it).

### Getting Started

**`/` — Introduction**
Orientation plus a live connection check. **Try:** load the page. **Pass:** "Agno agent" shows a green dot and `200 from http://localhost:8000/status`. **Fail:** a red dot and "unreachable" — the agent isn't running.

**`/quickstart` — Quickstart**
The minimum viable path: provider, runtime route, one chat. **Try:** `Can you tell me a joke?` **Pass:** tokens stream in one at a time and render as markdown. **Fail:** nothing streams, or an error banner appears.

### Basics

**`/prebuilt-components` — Prebuilt Components**
`CopilotChat`, `CopilotSidebar`, and `CopilotPopup` in tabs — only one mounts at a time, since the sidebar and popup both use fixed positioning. **Try:** `What is CopilotKit?`, then switch tabs. **Pass:** all three drive the same agent, and the conversation survives tab switches (one shared provider). **Fail:** a component renders blank, or the sidebar/popup never appears.

### Rich Threads — all require a license key

**`/threads` — Overview.** Reference: what threads persist and why it's an event log, not a transcript.

**`/threads/drawer` — Threads Drawer.** `CopilotThreadsDrawer` beside a chat in a shared `CopilotChatConfigurationProvider`. **Pass (licensed):** selecting a row replays that conversation with no state written by you. **Pass (unlicensed):** a _locked panel_ — that's the correct result, and proves the component mounted and detected the missing license. **Fail:** a blank area with no locked state.

**`/threads/headless` — Headless Threads.** A thread list built by hand on `useThreads`, including **rename**, which the prebuilt drawer doesn't expose. **Pass (licensed):** threads list, and rename/archive/delete take effect. **Pass (unlicensed):** an empty list with an explanatory note.

**`/threads/lifecycle` — Thread & History Lifecycle.** _Partly testable without a license._ **Try:** send a message, press "Remount chat". **Pass:** the conversation clears — a new `threadId` was minted. Pin an explicit id and remount: the id survives. **Fail:** a pinned id changes on remount.

**`/threads/import` — Synchronize Thread History.** Reference. Import targets ADK and LangGraph history; Agno isn't a documented source.

**`/threads/architecture` — Persistence Architecture.** Reference: replay, reconnection, auto-naming, locks.

### Custom Look and Feel

**`/custom-look-and-feel/programmatic-control`**
Drives the agent with no chat component. **Try:** type a message, press Run. **Pass:** status flips to Running, the message count climbs, tokens stream into the transcript; Stop halts it mid-stream. **Fail:** Run does nothing.

**`/custom-look-and-feel/inspector`**
The debugging overlay, mounted by the provider (never by hand — see §9). **Try:** send a message, open the inspector docked at the window edge. **Pass:** the event list fills, and Frontend Tools lists all four browser tools with schemas. **Fail:** no inspector at all — it is force-disabled in production builds, so confirm you're on `npm run dev`. If it appears but says _"CopilotKit core not attached"_, something is rendering `<CopilotKitInspector />` without a `core` prop.

**`/custom-look-and-feel/slots`** _(page live but absent from the doc sidebar)_
Three override levels against one chat. **Pass:** level 1 tints the message area; level 2 auto-focuses the input; level 3 shows a custom header, custom layout, and a custom streaming cursor. **Fail:** all three tabs look identical.

**`/custom-look-and-feel/headless-ui`** _(live but absent from the sidebar)_
A chat with zero CopilotKit chrome. **Try:** `What's the weather in London?` **Pass:** messages stream into hand-written bubbles and tool calls still render through the registry. **Fail:** Send does nothing.

### Generative UI

**`/generative-ui/your-components/display-only`**
Registering a React component as a tool the agent can render — `useComponent`, no handler, no interaction. **Try:** `Show the weather card for Tokyo: 77 degrees, clear`. **Pass:** a bordered weather card renders inline in the chat with the agent's values. **Fail:** a plain-text answer with no card — the tool wasn't called.

**`/generative-ui/your-components/interactive`** — 🚧 **Intentionally empty.** The upstream doc page is a stub (its whole body is a `<SharedContent />` placeholder), so there's nothing to implement. The route exists to keep the nav and status table complete.

**`/generative-ui/tool-rendering`**
A named renderer for `get_weather` plus a wildcard fallback. **Try:** `What's the weather in Tokyo?` then `What's the price of NVDA?` **Pass:** weather renders the bordered card, transitioning "Checking…" → result; the stock call renders the plain monospace fallback. **Fail:** raw JSON, or nothing.

### App Control

**`/frontend-tools` — Frontend Tools**
Three tools that run in the browser and change this page. **Try:** `Say hello to Malaika`, `Change the theme to violet`, `Bookmark the CopilotKit docs at https://docs.copilotkit.ai`. **Pass:** each panel updates the moment the call completes; the theme change follows you across every route. **Fail:** the agent claims success but nothing changes — the tool names have drifted apart.

**`/human-in-the-loop`** _(live but absent from the sidebar)_
**Try:** `Can you show me two good options for a restaurant name?` **Pass:** two buttons render in the message stream and **nothing further streams until you click one**. **Fail:** two options as plain text, or the agent continues without waiting.

### Backend

**`/backend/copilot-runtime`**
Live agent routing between two ids (`default` and `agno_agent`) that resolve to the same process. **Pass:** both stream, and each id keeps its own conversation. **Fail:** one errors with agent-not-found.

**`/backend/ag-ui`**
A live capture of the raw AG-UI event stream, with pause and clear. **Try:** `What's the weather in Tokyo?` **Pass:** `RUN_STARTED` → `TEXT_MESSAGE_CONTENT` burst → `TOOL_CALL_START`/`END` → `TOOL_CALL_RESULT` → `RUN_FINISHED`. **Fail:** the log stays empty while the chat streams.

### Troubleshooting

**`/troubleshooting/error-debugging`** — A **live error log** fed by the provider-level `onError`. **Try:** stop the Agno process, send a message. **Pass:** an entry appears with an `agent_run_failed`-style code. **Fail:** silent failure with nothing logged.

**`/status`** — Every route and its status in one table.

---

## 8. Testing checklist / current status

Verified 2026-08-05 against a live stack (real OpenAI key, no license key, no MCP server). Doc snapshot synced 2026-08-30; `/frontend-tools` and `/generative-ui/your-components/display-only` re-recorded 2026-08-31 after the session-storage fix (#12).

| Doc page                                           | Route                                         | Status         | Notes                                                                                  |
| -------------------------------------------------- | --------------------------------------------- | -------------- | -------------------------------------------------------------------------------------- |
| `/agno`                                            | `/`                                           | ✅ Working     | Server-side agent probe.                                                               |
| `/agno/quickstart`                                 | `/quickstart`                                 | ✅ Working     | Verified end-to-end: streamed reply from gpt-4o.                                       |
| `/agno/prebuilt-components`                        | `/prebuilt-components`                        | ✅ Working     | All three components. Doc page itself is a component stub (142 bytes of raw markdown). |
| `/agno/threads`                                    | `/threads`                                    | ⚠️ Partial     | Premium.                                                                               |
| `/agno/prebuilt-components/copilot-threads-drawer` | `/threads/drawer`                             | ⚠️ Partial     | Premium; renders the locked view, which is the expected unlicensed result.             |
| `/agno/headless-threads`                           | `/threads/headless`                           | ⚠️ Partial     | Premium; `useThreads` returns empty. UI incl. rename fully implemented.                |
| `/agno/threads-lifecycle`                          | `/threads/lifecycle`                          | ⚠️ Partial     | Mint/switch testable now; replay needs a store.                                        |
| `/agno/threads-import`                             | `/threads/import`                             | 📖 Reference   | Premium; Agno is not a documented import source.                                       |
| `/agno/premium/threads-explained`                  | `/threads/architecture`                       | 📖 Reference   | Premium.                                                                               |
| `/agno/programmatic-control`                       | `/custom-look-and-feel/programmatic-control`  | ✅ Working     | run/stop/state/messages.                                                               |
| `/agno/inspector`                                  | `/custom-look-and-feel/inspector`             | ✅ Working     | Dev-only by design.                                                                    |
| `/agno/custom-look-and-feel/slots`                 | `/custom-look-and-feel/slots`                 | ✅ Working     | **Not in the doc sidebar**, but the page resolves (HTTP 200).                          |
| `/agno/custom-look-and-feel/headless-ui`           | `/custom-look-and-feel/headless-ui`           | ✅ Working     | **Not in the doc sidebar**; resolves.                                                  |
| `/agno/generative-ui/your-components/display-only` | `/generative-ui/your-components/display-only` | ✅ Working     | `useComponent`; needs no backend declaration. Same resume failure as frontend-tools until `db` was configured (#12); re-recorded clean.            |
| `/agno/generative-ui/your-components/interactive`  | `/generative-ui/your-components/interactive`  | 🚧 Not started | Upstream doc page is still a stub; its only content is the 30 Aug session-storage callout (#12), which this route mirrors.            |
| `/agno/generative-ui/tool-rendering`               | `/generative-ui/tool-rendering`               | ✅ Working     | Named + wildcard renderers; tool call verified over the wire.                          |
| `/agno/frontend-tools`                             | `/frontend-tools`                             | ✅ Working     | Was dying at the resume with "requires a database"; fixed by configuring `db` (#12) and re-recorded clean.            |
| `/agno/human-in-the-loop`                          | `/human-in-the-loop`                          | ✅ Working     | **Not in the doc sidebar**; linked from Quickstart and resolves. Covered by the shared `db` (#12).            |
| `/agno/copilot-runtime`                            | `/backend/copilot-runtime`                    | ✅ Working     | Two agent ids verified via the runtime's `info` method.                                |
| `/agno/ag-ui`                                      | `/backend/ag-ui`                              | ✅ Working     | Live event panel.                                                                      |
| `/agno/troubleshooting/error-debugging`            | `/troubleshooting/error-debugging`            | ✅ Working     | Live error log.                                                                        |

**Legend:** ✅ Working · ⚠️ Partial (blocked by something outside this repo) · 📖 Reference (intentionally not a live feature) · ❌ Broken · 🚧 Not started

Not implemented as routes: `/agno/(other)/telemetry` (a config note, covered by `COPILOTKIT_TELEMETRY_DISABLED` in `.env.example`).

---

## 9. Known issues / doc-vs-implementation discrepancies

Found while building against `@copilotkit/react-core` **1.66.2**. In every case the shipped `.d.ts` was correct and the prose was stale.

Note that #2 and #9 interact: choosing `CopilotKitProvider` to get the documented error `code` silently disables the inspector, because the two providers gate it with different props and different defaults. Whichever you pick, check both.

**1. Tool rendering: `args` → `parameters`, and the schema is mandatory**
[Tool Rendering](https://docs.copilotkit.ai/agno/generative-ui/tool-rendering) shows `render: ({ status, args })` with no `parameters` field. The shipped named `useRenderTool` overload is `{ name, parameters: StandardSchemaV1, render }`, the render prop is `parameters` (not `args`), and statuses are `inProgress | executing | complete`. The doc sample does not compile.

**2. `onError` gives `code` on `CopilotKitProvider`, not on `CopilotKit`**
[Error Debugging](https://docs.copilotkit.ai/agno/troubleshooting/error-debugging) shows `event.code` on `<CopilotKit>`. But `CopilotKitProps` is `Omit<CopilotKitProviderProps, "children" | "onError">` with `onError` redeclared as the legacy `CopilotErrorHandler`, whose event is `{ type, timestamp, context, error }` — **no `code`**. Only `<CopilotKitProvider>` has the documented `{ error, code, context }` shape. This repo uses `CopilotKitProvider` for that reason.

**3. Slots: a plain component isn't assignable to most slots**
[Slots](https://docs.copilotkit.ai/agno/custom-look-and-feel/slots) shows passing an arbitrary component to `messageView.userMessage`. `SlotValue<C> = C | string | Partial<ComponentProps<C>>`, so a replacement must match the default component's _type_ — including attached statics like `CopilotChatUserMessage.Container`. A bare function component fails to typecheck. It works for slots whose default is a plain function (e.g. `cursor`), which is what this repo demonstrates. Relatedly, the doc's `"data-testid"` in a props-override object isn't in `ComponentProps` and is rejected.

**4. Model id in the Quickstart**
[Quickstart](https://docs.copilotkit.ai/agno/quickstart) code uses `OpenAIChat(id="gpt-5.4")` while its own callout says "GPT-4o by default". `gpt-5.4` isn't available on every account, so this repo defaults to `gpt-4o`, overridable via `OPENAI_MODEL`.

**5. `@ag-ui/client` is not a required frontend install**
The Quickstart troubleshooting box says to verify `@ag-ui/client` is installed in the frontend. [Migrate to V2](https://docs.copilotkit.ai/agno/troubleshooting/migrate-to-v2) states its types are re-exported from `@copilotkit/react-core/v2` and a separate install isn't needed.

**6. The `/info` troubleshooting check targets an older layout**
[Common Issues](https://docs.copilotkit.ai/agno/troubleshooting/common-issues) suggests `curl -d '{}' http://localhost:8000/copilotkit/info`. Agno's `AgentOS` exposes AG-UI at `POST /agui` with no `/copilotkit/info`. Use `curl -s -o /dev/null -w '%{http_code}' http://localhost:8000/status` instead, or the connection panel on the home page.

**7. `python-multipart` is an undocumented backend requirement**
The Quickstart's `uv add agno fastapi uvicorn openai ag-ui-protocol` is insufficient: `AgentOS` mounts form-data routes and FastAPI raises `RuntimeError: Form data requires "python-multipart" to be installed` at import. Added to this repo's dependencies.

**8. `prebuilt-components` has no readable source**
`https://docs.copilotkit.ai/agno/prebuilt-components.md` is 142 bytes — the content is generated by a `<PrebuiltComponents />` component. Component details came from the rendered page and the installed types.

**9. The Inspector's on/off prop depends on which provider you use — and the provider defaults to off**
[Inspector](https://docs.copilotkit.ai/agno/inspector) says the inspector is enabled by default and that `enableInspector={false}` disables it. That holds for `<CopilotKit>`, where `enableInspector` feeds `shouldShowDevConsole()` and defaults to on-for-localhost. `<CopilotKitProvider>` has **no `enableInspector` prop at all** — it reads `showDevConsole`, which **defaults to `false`**. Because this repo uses the provider (see #2), the inspector was silently off until it opted in with `showDevConsole="auto"`.

Related, and easy to trip over: the provider already renders `<CopilotKitInspector core={copilotkit} />` itself when enabled. Mounting `<CopilotKitInspector />` by hand does _not_ work — its signature is `({ core, ...rest })` and it forwards `core ?? null`, so a bare instance renders **"CopilotKit core not attached"**. Passing an explicit `null` also defeats the `window.__COPILOTKIT_CORE__` auto-attach fallback that the warning itself recommends.

**10. Frontend tools do not need a Python declaration**
[Frontend Tools](https://docs.copilotkit.ai/agno/frontend-tools) shows registering `useFrontendTool` on the client _and_ declaring a matching `@tool(external_execution=True)` stub in the Agno agent. The Python stub turns out to be optional: CopilotKit forwards frontend tools to the agent in the AG-UI run input, so the model can call them regardless. Verified on this stack — a tool present only in the run input (`showWeather`, never declared in `agent.py`) was called normally, as were `offerOptions` and `addBookmark` after their Python stubs were deleted.

The stub still has a purpose — it makes the tool visible to the agent's own instructions, which is how you steer _when_ the model reaches for it — but it is not required for the call to work. Note the inverse still bites: a tool declared in Python with **no** frontend handler registered will hang the run forever, which is why this repo registers all browser-executed tools at the app root.

**11. Three pages resolve but are missing from the sidebar**
`human-in-the-loop`, `custom-look-and-feel/slots`, and `custom-look-and-feel/headless-ui` all return HTTP 200 and are linked from other pages, but none appear in the doc nav. All three are implemented here and flagged "Not in doc sidebar".

**12. The "Configure session storage" callout documents a real bug this repo had already hit — late**
On 30 Aug, [Frontend Tools](https://docs.copilotkit.ai/agno/frontend-tools), [Human in the Loop](https://docs.copilotkit.ai/agno/human-in-the-loop), [Display Only](https://docs.copilotkit.ai/agno/generative-ui/your-components/display-only) and [Interactive](https://docs.copilotkit.ai/agno/generative-ui/your-components/interactive) each gained the same callout: "Agno must store the paused run before a frontend tool can return its result," prescribing `pip install sqlalchemy` and `SqliteDb(db_file="tmp/agno.db")` on the `Agent`.

This one is confirmed on this stack, and the confirmation predates the doc. `/frontend-tools` and `/generative-ui/your-components/display-only` both ended in **"Frontend tool resume requires a database"** — the browser tool ran, the panel updated, the answer streamed, and then the run died. Their recorder handlers were written around that failure (see `autorecorder/Reported-errors.md`). Configuring `db=SqliteDb(db_file="tmp/agno.db")` on the agent fixes both: re-recorded 2026-08-31 on `agno` 2.8.6 / `@copilotkit/react-core` 1.66.2, the tool runs, the reply completes, and the browser reports nothing.

The finding is therefore about *where* the requirement was documented, not whether it is true. A prerequisite that silently kills every frontend-tool run belongs in the Quickstart that builds the agent, not in a callout added months later to four downstream pages — the Quickstart still builds an `Agent` with no `db`, so anyone following the docs in order builds the broken version first.

Three smaller problems in the callout itself:

- `db_file="tmp/agno.db"` is **relative to the process working directory**, which the page never states. Started from the repo root instead of `backend/`, it silently writes a second database somewhere else. This repo keeps the published path verbatim (`backend/tmp/agno.db` when run per section 6) and gitignores it.
- `pip install sqlalchemy` contradicts the Quickstart on the same doc tree, which sets the backend up with `uv`. This repo declares `sqlalchemy` in `backend/pyproject.toml`.
- The callout's own two paths disagree — the snippet says `tmp/agno.db`, the sentence below it says the deployed showcase uses `/tmp/agno.db` — without saying which one a reader should copy.

---

## 10. Troubleshooting

| Symptom                                                | Cause                                                                                 | Fix                                                                                                                                                                                                     |
| ------------------------------------------------------ | ------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Chat sends, nothing streams back                       | Agno process down, or `AGNO_AGENT_URL` wrong                                          | Check the home page connection panel; run `uv run main.py`.                                                                                                                                             |
| A run starts, then hangs forever                       | The agent called a browser tool with no registered handler, so no result ever returns | Every `external_execution=True` tool in `backend/tools/frontend_tools.py` needs a matching `useFrontendTool`/`useHumanInTheLoop`. This repo registers all four at the app root for exactly this reason. |
| Tool runs but custom UI doesn't render                 | Renderer name ≠ tool name                                                             | `useRenderTool({ name })` must equal the Python function name exactly, including case. That's why the Python frontend tools are camelCase.                                                              |
| Connection errors mentioning `localhost`               | DNS resolving to IPv6 while the server binds IPv4                                     | Use `127.0.0.1` in `AGNO_AGENT_URL`.                                                                                                                                                                    |
| Thread list empty, drawer shows a lock                 | No license key                                                                        | Expected — not a bug. Set `NEXT_PUBLIC_COPILOTKIT_LICENSE_KEY`.                                                                                                                                         |
| Backend exits: `Form data requires "python-multipart"` | Missing transitive dep                                                                | `uv add python-multipart` (already in this repo).                                                                                                                                                       |
| Backend exits: `OPENAI_API_KEY is not set`             | No key                                                                                | Copy `.env.example` → `backend/.env`. Failing fast is intentional.                                                                                                                                      |
| Inspector never appears                                | Production build                                                                      | It is disabled unconditionally in production. Use `npm run dev`.                                                                                                                                        |

---

## Doc drift detection

`/doc-sync` keeps this repo honest about the docs it mirrors. Press **Sync docs now** (on the landing page or on `/doc-sync`) and it fetches the markdown source behind all 21 tracked doc pages, diffs each against the copy stored in `doc-snapshot/`, replaces that copy, and reports what moved — ranked by whether the change can actually break an implementation.

Doc pages are fetched by appending `.md` to their URL, which returns the authored MDX rather than 250 KB of rendered HTML. Every response is checked for `text/markdown` before it is allowed near the snapshot: a URL that misses the markdown handler still answers `200` with the HTML app shell, and writing that in would destroy the baseline and report the whole corpus as rewritten on the next run. A run commits all pages or none.

**Severity is decided by where the edit landed**, not how big it was:

| Level      | Trigger                                                                                                                |
| ---------- | ---------------------------------------------------------------------------------------------------------------------- |
| **High**   | a changed line inside a fenced code block, a changed fence count, or a page that now 404s and is gone from the sitemap |
| **Medium** | a changed heading, changed frontmatter `title`/`description`, or prose in the same section as changed code             |
| **Low**    | other prose                                                                                                            |

**Sections checked** lists every tracked page in nav order with a mark — `✓` unchanged, `!` changed, `+` stored, `✗` 404, `~` unstable, `·` not checked. Expanding a row shows the comparison: for a changed page the diff (`−` existing snapshot, `+` newly fetched), and for an unchanged one the two matching hashes, which is the evidence the check ran.

**`doc-snapshot/CHANGELOG.md`** is the record that survives a re-sync. Because syncing replaces the copy it just compared against, the run _after_ a change reports nothing — so the changelog is written at the moment of discovery and never rewritten later. Only changed pages are recorded; a clean run does not touch the file. It keeps the three most recent dated entries, counted rather than aged, so a change from six weeks ago still shows if nothing has happened since.

**One sync date.** `syncedAt` in `doc-snapshot/manifest.json`, rewritten on every run and shown on `/`, `/status` and `/doc-sync`. There is no hand-maintained date to keep in step with it.

**To test it**, edit any `doc-snapshot/pages/*.md` file and press the button — a line inside a code fence for High, a `##` heading for Medium, a sentence for Low. The comparison reads the stored file itself, so nothing else needs changing. Both `/doc-sync` and the changelog label the result as a local snapshot edit rather than upstream drift.

Commit `doc-snapshot/` — `pages/`, `manifest.json` and `CHANGELOG.md` are the baseline every diff is taken against. `reports/` is gitignored derived data.

---

## 11. Project structure

```
agno/
├── CLAUDE.md                  # build instructions this repo was produced from
├── README.md
├── .env.example               # every variable, with what it does
├── .gitignore
│
├── autorecorder/              # screen-recording suite — one demo video per doc page
│   ├── ADAPT.md               # the porting contract; read before editing
│   ├── cli.ts
│   ├── config/                # ★ the only framework-specific files
│   ├── actions/               # ★ what to do on each demo page
│   ├── core/                  # frozen — shared across framework repos
│   └── videos/                # output; gitignored
│
├── frontend/                  # Next.js 16 app — also hosts the Copilot Runtime
│   ├── AGENTS.md              # auto-generated by next dev; points at bundled docs
│   └── src/
│       ├── app/
│       │   ├── layout.tsx             # providers + chrome; imports v2 styles
│       │   ├── page.tsx               # / — intro + connection check
│       │   ├── status/page.tsx        # status overview table
│       │   ├── api/copilotkit/[[...slug]]/route.ts # ★ CopilotRuntime + AgnoAgent binding
│       │   └── <doc route>/
│       │       ├── page.tsx           # notes + exact source (server component)
│       │       └── demo-chat/page.tsx # ★ the running feature, chrome-free
│       ├── components/
│       │   ├── providers.tsx          # ★ CopilotKitProvider, onError → error log
│       │   ├── global-frontend-tools.tsx  # ★ all 4 browser-executed tools
│       │   ├── harness-state.tsx      # accent/greeting/bookmarks/error log
│       │   ├── app-chrome.tsx         # sidebar layout, skipped on /demo-chat
│       │   ├── demo-frame.tsx         # thin bar + back link for demo routes
│       │   ├── source-code.tsx        # ★ renders a repo file verbatim
│       │   ├── nav-sidebar.tsx        # nav built from nav-config
│       │   ├── route-header.tsx       # title + status badge + doc + demo link
│       │   ├── backend-health.tsx     # server component; probes the agent
│       │   └── ui.tsx                 # Panel, Callout, CodeBlock, TryIt
│       └── lib/
│           ├── nav-config.ts          # ★ single source of truth: routes, docs, status
│           ├── source.ts              # ★ server-only reader behind SourceCode
│           └── health.ts              # server-only agent probe
│
└── backend/                   # Python agent — Agno AgentOS over AG-UI
    ├── pyproject.toml
    ├── main.py                # ★ AgentOS + AGUI interface → POST /agui on :8000
    ├── agent.py               # model, instructions, tool registration
    └── tools/
        ├── backend_tools.py   # executed server-side (get_weather, …)
        └── frontend_tools.py  # external_execution=True — executed in the browser
```

The nav, every route header, the demo links, and the status table above all derive from `frontend/src/lib/nav-config.ts`, so a route's status is stated once.

### Autorecorder

`autorecorder/` produces one demo video per doc page: it opens the live doc page
and scrolls it, switches to a simulated VS Code showing **this repo's own source**
for that feature, then switches to the browser and drives the real demo route.
It is a portable folder shared across CopilotKit framework repos and is adapted
here for Agno — `autorecorder/config/` and `autorecorder/actions/` hold everything
Agno-specific; `autorecorder/core/` is shared and must not be edited.

Both services must be running first, because a video of a dead page is worse than
no video — the recorder refuses to start otherwise.

```bash
cd autorecorder
npm install && npx playwright install chromium

npm run doctor            # static: config, files, line ranges, handlers
npm run doctor:online     # also probes every demo route, doc URL, and selector
npm run record -- --list  # what will be recorded
npm run record            # all 16, in nav order
npm run manifest          # record what was produced — run this after every recording
```

Output lands in `autorecorder/videos/` as `AGNO-react-<NN>-<Name>.webm`, numbered
in nav order. **The clips are gitignored on purpose** (by `autorecorder/videos/.gitignore`)
— recordings are build output, reproducible from the folder, and committing them
bloats history badly. Publish them as release assets instead.

`npm run doctor` exiting 0 is the definition of a working configuration; it is
what catches an IDE line range that drifted after someone edited a demo page.

**Tracking which clips are current.** Since the videos are not versioned and each
run overwrites the same filenames, `npm run manifest` writes
`autorecorder/videos/manifest.json` and `MANIFEST.md` — ~12KB of committed text
recording, per clip, when it was made and whether the source it demonstrates has
changed since. Those two files are the QA record for the recordings, the way the
table in §8 is for the routes: commit them, and the diff shows what each run
changed. `npm run manifest:check` exits 1 if any clip is stale or missing. Note it
tracks freshness, not correctness — a failed run still writes a video.

**Only the 16 routes with a `demo-chat` page are recorded.** The five reference
routes — `/`, `/threads`, `/threads/import`, `/threads/architecture`, and
`/generative-ui/your-components/interactive` — have nothing to drive, and the
recorder has no way to register a page without a demo URL. See
[`autorecorder/README.md`](autorecorder/README.md#scope-in-this-repo).

Two cold-start effects, one handled and one not. The **frontend** kind is
absorbed: a dev server compiles page chunks lazily and API routes on first
request, so the recorder waits for the demo route to settle and warms
`/api/copilotkit` before typing anything — without that, a prompt goes into an
input nothing is wired to yet. The **agent** kind is not: the first model call
after starting the backend can take ~60s, longer than the recorder's 30s response
window, so it fails that page. Send one message in the app by hand — or record a
single page first — before running the full suite.

---

## 12. References

**Getting Started** — [Introduction](https://docs.copilotkit.ai/agno) · [Quickstart](https://docs.copilotkit.ai/agno/quickstart)

**Basics** — [Prebuilt Components](https://docs.copilotkit.ai/agno/prebuilt-components)

**Rich Threads** — [Overview](https://docs.copilotkit.ai/agno/threads) · [Threads Drawer](https://docs.copilotkit.ai/agno/prebuilt-components/copilot-threads-drawer) · [Headless Threads](https://docs.copilotkit.ai/agno/headless-threads) · [Thread & History Lifecycle](https://docs.copilotkit.ai/agno/threads-lifecycle) · [Synchronize Thread History](https://docs.copilotkit.ai/agno/threads-import) · [Threads & Persistence Architecture](https://docs.copilotkit.ai/agno/premium/threads-explained)

**Custom Look and Feel** — [Programmatic Control](https://docs.copilotkit.ai/agno/programmatic-control) · [Inspector](https://docs.copilotkit.ai/agno/inspector) · [Slots](https://docs.copilotkit.ai/agno/custom-look-and-feel/slots) † · [Headless UI](https://docs.copilotkit.ai/agno/custom-look-and-feel/headless-ui) †

**Generative UI** — [Your Components · Display-only](https://docs.copilotkit.ai/agno/generative-ui/your-components/display-only) · [Your Components · Interactive](https://docs.copilotkit.ai/agno/generative-ui/your-components/interactive) † · [Tool Rendering](https://docs.copilotkit.ai/agno/generative-ui/tool-rendering)

**App Control** — [Frontend Tools](https://docs.copilotkit.ai/agno/frontend-tools) · [Human in the Loop](https://docs.copilotkit.ai/agno/human-in-the-loop) †

**Backend** — [Copilot Runtime](https://docs.copilotkit.ai/agno/copilot-runtime) · [AG-UI](https://docs.copilotkit.ai/agno/ag-ui)

**Troubleshooting** — [Error Debugging & Observability](https://docs.copilotkit.ai/agno/troubleshooting/error-debugging)

**External** — [Agno docs](https://docs.agno.com) · [AG-UI protocol](https://ag-ui.com) · [AG-UI event types](https://docs.ag-ui.com/concepts/events)

† Resolves but is absent from the doc sidebar as of the sync date.
