# CopilotKit + Agno Test Suite

A navigable, working test harness covering every page of the CopilotKit Agno documentation — each doc page is a route that actually runs the thing it describes.

|                         |                                                                                                                                                                       |
| ----------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Doc sync date**       | Machine-maintained — `doc-snapshot/manifest.json` → `syncedAt`, rewritten on every sync                                                                               |
| **CopilotKit packages** | `@copilotkit/react-core` 1.72.0 · `@copilotkit/runtime` 1.72.0                                                                                                        |
| **AG-UI packages**      | `@ag-ui/agno` 0.0.6 · `@ag-ui/client` 0.0.59                                                                                                                          |
| **Frontend**            | Next.js 16.3.0 (App Router) · React 19.2 · TypeScript · Tailwind 4                                                                                                    |
| **Backend**             | Python 3.12 · Agno 2.8.6 · FastAPI/AgentOS                                                                                                                            |
| **Build status**        | No CI. Locally verified: 24 doc routes + 17 demo routes, live agent run ✅, rendered source byte-matches disk ✅. **Typecheck currently failing** — see Known issues. |

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
| `CPK_INTELLIGENCE_API_KEY`           | `frontend/.env.local` | Server-side managed-project key. Unlocks Rich Threads. Optional.             |
| `COPILOTKIT_LICENSE_TOKEN`           | `frontend/.env.local` | Self-hosted/OSS license token only. Not issued for managed projects.         |

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

22 of the 28 doc routes have a demo: quickstart, prebuilt-components, the three interactive thread routes, all five Custom Look and Feel routes, display-only, tool-rendering, frontend-cards, frontend-tools, governed-actions, human-in-the-loop, both Backend routes, error-debugging, intelligence/memories, learning, and cookbook/jev-generative-ui. The other 6 have nothing to run: `/`, `/threads`, `/threads/import` and `/threads/architecture` are reference pages; `/generative-ui/your-components/interactive` is a doc page with nothing in it; `/webmcp` is tracked for drift with the demo deliberately not built (see below).

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

**`/threads/lifecycle` — Thread & History Lifecycle.** One button per lifecycle claim on the page, with the chat's resolved state read back from its `CopilotChatConfigurationProvider`, so the readouts are the chat's own. **Try:** send a message, press "Remount chat", then "Open conversation", "New chat", "Pin a threadId prop" and "New chat" again. **Pass:** the remount gives a new id and an empty chat; "Open conversation" returns to the first id with its messages replayed from the runtime's `InMemoryAgentRunner`; with the id pinned, "New chat" changes nothing and the amber line shows the `Ignoring startNewThread()` warning; the pinned id survives a remount. **Fail:** the re-opened thread shows 0 messages (nothing replayed). The ledger lists every id the chat has been on. See §9 #28.

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

**`/custom-look-and-feel/markdown` — Markdown Rendering.** New upstream, tracked 2026-09-21. The `markdownRenderer` slot three ways, all verbatim: a Streamdown `components` map, a class string, and a bare component that replaces the renderer. **Try:** `Reply in markdown with an '## Overview' heading and a link to https://docs.copilotkit.ai.` on each tab. **Pass:** the probe row under the chat shows level 1's anchor carrying `class="my-link"`, `href`, `target="_blank"` and `rel="noopener noreferrer"` and **no** `node` attribute; level 2 restyles the block with Streamdown's own `data-streamdown` markup intact; level 3 shows a `pre` of raw markdown with no `a` or `h2` at all. **Fail:** a `node="[object Object]"` attribute anywhere, level 1 losing `target`/`rel`, or three identical tabs. All three snippets typecheck as published — including the bare component that §9 #3 says most slots reject. See §9 #26.

### Generative UI

**`/generative-ui/your-components/display-only`**
Registering a React component as a tool the agent can render — `useComponent`, no handler, no interaction. **Try:** `Show the weather card for Tokyo: 77 degrees, clear`. **Pass:** a bordered weather card renders inline in the chat with the agent's values. **Fail:** a plain-text answer with no card — the tool wasn't called.

**`/generative-ui/your-components/interactive`** — 🚧 **Intentionally empty.** The upstream doc page is a stub (its whole body is a `<SharedContent />` placeholder), so there's nothing to implement. The route exists to keep the nav and status table complete.

**`/generative-ui/tool-rendering`**
A named renderer for `get_weather` plus a wildcard fallback. **Try:** `What's the weather in Tokyo?` then `What's the price of NVDA?` **Pass:** weather renders the bordered card, transitioning "Checking…" → result; the stock call renders the plain monospace fallback. **Fail:** raw JSON, or nothing.

**`/generative-ui/frontend-cards`** — ✅ **Working**, with a silent-loss finding. New upstream 2026-09-11. A card pushed into the transcript from frontend code as a `role: "activity"` message, which is stripped from every run. **Try:** click **Simulate: deployment finished**, then ask `Have you been shown any deployment card?` **Pass:** the card renders; the probe row reads `agent.messages = activity, user, assistant` and `run payload = user` (read off the request that left the browser); the agent says it saw no card. **Fail:** no card, or `activity` in the payload row. The three snippets are verbatim; step 3's `<DeploymentWatcher />` is mounted inside step 2's provider, which the page never says to do, and its `wss://example.com` socket never delivers, so the button fires the same `addMessage`. See §9 #15.

### App Control

**`/frontend-tools` — Frontend Tools**
Three tools that run in the browser and change this page. **Try:** `Say hello to Malaika`, `Change the theme to violet`, `Bookmark the CopilotKit docs at https://docs.copilotkit.ai`. **Pass:** each panel updates the moment the call completes; the theme change follows you across every route. **Fail:** the agent claims success but nothing changes — the tool names have drifted apart.

**`/human-in-the-loop/governed-actions` — Governed Action Approval**
An approval checkpoint in front of a side-effecting action, showing the policy verdict and the exact arguments before anything runs. **Try:** `Send an invoice reminder to acme@example.com. Ask me to approve it first.` **Pass:** a card renders with the verdict and the JSON arguments, and the run holds until Approve or Reject. **Fail:** the agent reports the reminder sent with no card.

**`/human-in-the-loop`** _(live but absent from the sidebar)_
**Try:** `Can you show me two good options for a restaurant name?` **Pass:** two buttons render in the message stream and **nothing further streams until you click one**. **Fail:** two options as plain text, or the agent continues without waiting.

**`/webmcp`** — 🚧 **Tracked, not implemented.** The doc adds a `webmcp` flag to a frontend tool so browser agents can discover it. Its own test procedure needs Chrome 149+ with the WebMCP origin trial (or `chrome://flags/#enable-webmcp-testing`) and Chrome's Model Context Tool Inspector; CopilotKit no-ops where `document.modelContext` is absent, so a demo here would register nothing and still look green.

### Backend

**`/backend/copilot-runtime`**
Live agent routing between two ids (`default` and `agno_agent`) that resolve to the same process. **Pass:** both stream, and each id keeps its own conversation. **Fail:** one errors with agent-not-found.

**`/backend/ag-ui`**
A live capture of the raw AG-UI event stream, with pause and clear. **Try:** `What's the weather in Tokyo?` **Pass:** `RUN_STARTED` → `TEXT_MESSAGE_CONTENT` burst → `TOOL_CALL_START`/`END` → `TOOL_CALL_RESULT` → `RUN_FINISHED`. **Fail:** the log stays empty while the chat streams.

### Troubleshooting

**`/troubleshooting/error-debugging`** — A **live error log** fed by the provider-level `onError`. **Try:** stop the Agno process, send a message. **Pass:** an entry appears with an `agent_run_failed`-style code. **Fail:** silent failure with nothing logged.

**`/status`** — Every route and its status in one table.

### Intelligence

**`/intelligence/memories`** — ❌ **Broken as documented.** New upstream 2026-09-11. **Try:** `Please remember that I prefer concise status updates.`, then **Save**, then switch to the second runtime and **Save** again. **What happens:** on the documented runtime the list reads "Memory is not available for this runtime." and the save 404s — at this repo's runtime, not the platform, because memory routes are off unless the runtime is built with `memory: { access }`, which the page never mentions. On the second runtime (the same one plus that option) the platform answers `403 MEMORY_NOT_ENTITLED`, the hook reports `isAvailable: true`, and the page's `MemoryList` renders an empty list. The page's React snippet itself does not compile — see §9 #16.

**`/learning`** — ⚠️ **Partial.** New upstream 2026-09-11. The page's runtime snippet, verbatim, on its own mount at `/api/copilotkit-learning`. **Try:** on `expense-agent`, `Review this expense: $42 team lunch, receipt attached.`; then on `default`, `Say hello in five words.` **What happens:** `expense-agent` never answers — its Thread is assigned to the page's example container `expense-review`, which does not exist in this project, and the run fails with "Failed to initialize thread" while the chat shows nothing. `default` answers. The dashboard and CLI half of the page (create a container, Run Learning, approve a Skill, `copilotkit skills download`) is behind a login and not exercised. See §9 #17.

### Cookbook

**`/cookbook/jev-generative-ui` — Jev: fast generative UI.** ⚠️ **Partial**, and deliberately so. New upstream, tracked 2026-09-21. The recipe has two halves and only one can exist here. **What runs:** the published `lib/workspaces.ts` schemas and the published `app/page.tsx` picker — its form, its panel markup and its two button message formats — all verbatim. **What cannot:** the Jev decision. `lib/choose-panel.ts` needs `@typesafe-ai/sdk` (absent) and a `TYPESAFE_API_KEY` from TypeSafe, a third-party vendor; `lib/picker-agent.ts` needs that plus `@langchain/openai` (absent). Both ship verbatim, imported by nothing, with the unresolvable imports acknowledged in place. **Try:** press **Show the clarification panel**, then **Show the comparison panel**. **Pass:** the published panel markup draws both prepared controls out of `PanelSchema.parse`, the probe row reads `isReady: false` for `useAgent({ agentId: "picker" })`, and pressing **Find options** does nothing — the published `send` returns early on `!isReady`. **Fail:** any panel that claims a Jev decision was made, or a picker that answers a typed request. Nothing here can produce either, and if it did, something would be standing in for the vendor. See §9 #27.

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
| `/agno/threads-lifecycle`                          | `/threads/lifecycle`                          | ⚠️ Partial     | Mint, remount, replay, switch, pin all observed; `existingId` undefined — §9 #28.      |
| `/agno/threads-import`                             | `/threads/import`                             | 📖 Reference   | Premium; Agno is not a documented import source.                                       |
| `/agno/intelligence/threads-explained`             | `/threads/architecture`                       | 📖 Reference   | Premium.                                                                               |
| `/agno/programmatic-control`                       | `/custom-look-and-feel/programmatic-control`  | ✅ Working     | run/stop/state/messages.                                                               |
| `/agno/inspector`                                  | `/custom-look-and-feel/inspector`             | ✅ Working     | Dev-only by design.                                                                    |
| `/agno/custom-look-and-feel/slots`                 | `/custom-look-and-feel/slots`                 | ✅ Working     | **Not in the doc sidebar**, but the page resolves (HTTP 200).                          |
| `/agno/custom-look-and-feel/headless-ui`           | `/custom-look-and-feel/headless-ui`           | ✅ Working     | **Not in the doc sidebar**; resolves.                                                  |
| `/agno/custom-look-and-feel/markdown`              | `/custom-look-and-feel/markdown`              | ✅ Working     | New upstream, tracked 2026-09-21. All three snippets verbatim and all three typecheck; the bare-component slot that §9 #3 rules out elsewhere is accepted here — §9 #26. |
| `/agno/generative-ui/your-components/display-only` | `/generative-ui/your-components/display-only` | ✅ Working     | `useComponent`; needs no backend declaration. Same resume failure as frontend-tools until `db` was configured (#12); re-recorded clean.            |
| `/agno/generative-ui/your-components/interactive`  | `/generative-ui/your-components/interactive`  | 🚧 Not started | Upstream doc page is still a stub; its only content is the 30 Aug session-storage callout (#12), which this route mirrors.            |
| `/agno/generative-ui/tool-rendering`               | `/generative-ui/tool-rendering`               | ✅ Working     | Named + wildcard renderers; tool call verified over the wire.                          |
| `/agno/generative-ui/frontend-cards`               | `/generative-ui/frontend-cards`               | ✅ Working     | New 2026-09-11. Card renders; run payload carries no `activity`. A card added before the runtime connects is silently lost — §9 #15. |
| `/agno/frontend-tools`                             | `/frontend-tools`                             | ✅ Working     | Was dying at the resume with "requires a database"; fixed by configuring `db` (#12) and re-recorded clean.            |
| `/agno/human-in-the-loop/governed-actions`         | `/human-in-the-loop/governed-actions`         | ✅ Working     | Approval card with the policy verdict. Its `z.record` call had to be translated for zod 4 — see §9 #14.            |
| `/agno/human-in-the-loop`                          | `/human-in-the-loop`                          | ✅ Working     | **Not in the doc sidebar**; linked from Quickstart and resolves. Covered by the shared `db` (#12).            |
| `/agno/webmcp`                                     | `/webmcp`                                     | 🚧 Not started | Tracked for drift. Needs Chrome 149+ and the WebMCP origin trial.                       |
| `/agno/copilot-runtime`                            | `/backend/copilot-runtime`                    | ✅ Working     | Two agent ids verified via the runtime's `info` method.                                |
| `/agno/ag-ui`                                      | `/backend/ag-ui`                              | ✅ Working     | Live event panel.                                                                      |
| `/agno/troubleshooting/error-debugging`            | `/troubleshooting/error-debugging`            | ✅ Working     | Live error log.                                                                        |
| `/agno/intelligence/memories`                     | `/intelligence/memories`                     | ❌ Broken      | New 2026-09-11. Import path wrong; routes 404 without an undocumented runtime option; unentitled shows as an empty list — §9 #16. |
| `/agno/learning`                                  | `/learning`                                  | ⚠️ Partial     | New 2026-09-11. A missing container ID makes every run on the assigned agent fail silently; dashboard/CLI steps not exercised — §9 #17. |
| `/agno/cookbook/jev-generative-ui`                 | `/cookbook/jev-generative-ui`                 | ⚠️ Partial     | New upstream, tracked 2026-09-21. Prepared controls and schemas run verbatim; the Jev decision layer needs an uninstalled vendor SDK and a TypeSafe key — §9 #27. |

**Legend:** ✅ Working · ⚠️ Partial (blocked by something outside this repo) · 📖 Reference (intentionally not a live feature) · ❌ Broken · 🚧 Not started

Not implemented as routes: `/agno/(other)/telemetry` (a config note, covered by `COPILOTKIT_TELEMETRY_DISABLED` in `.env.example`).

**Tracked without a demo.** `/agno/webmcp` carries a route, a nav entry and a snapshot so drift is watched, but nothing is implemented behind it and the recorder does not touch it. The reason is on the route’s page and in §7. The rest of `/agno/intelligence/` (including `/agno/intelligence/quickstart`, whose route was removed on 2026-09-17) is the old `/agno/premium/` set under a new prefix and stays in `doc-snapshot/manifest.json`’s `knownUnmapped` list.

---

## 9. Known issues / doc-vs-implementation discrepancies

Found while building against `@copilotkit/react-core` **1.66.2**. In every case the shipped `.d.ts` was correct and the prose was stale.

Note that #2 and #9 interact: choosing `CopilotKitProvider` to get the documented error `code` silently disables the inspector, because the two providers gate it with different props and different defaults. Whichever you pick, check both.

**1. Tool rendering: `args` → `parameters`, and the schema is mandatory**
[Tool Rendering](https://docs.copilotkit.ai/agno/generative-ui/tool-rendering) shows `render: ({ status, args })` with no `parameters` field. The shipped named `useRenderTool` overload is `{ name, parameters: StandardSchemaV1, render }`, the render prop is `parameters` (not `args`), and statuses are `inProgress | executing | complete`. The doc sample does not compile.

**2. `onError` gives `code` on `CopilotKitProvider`, not on `CopilotKit`**
[Error Debugging](https://docs.copilotkit.ai/agno/troubleshooting/error-debugging) shows `event.code` on `<CopilotKit>`. But `CopilotKitProps` is `Omit<CopilotKitProviderProps, "children" | "onError">` with `onError` redeclared as the legacy `CopilotErrorHandler`, whose event is `{ type, timestamp, context, error }` — **no `code`**. Only `<CopilotKitProvider>` has the documented `{ error, code, context }` shape. This repo uses `CopilotKitProvider` for that reason.

**3. Slots: a plain component isn't assignable to most slots**
[Slots](https://docs.copilotkit.ai/agno/custom-look-and-feel/slots) shows passing an arbitrary component to `messageView.userMessage`. `SlotValue<C> = C | string | Partial<ComponentProps<C>>`, so a replacement must match the default component's _type_ — including attached statics like `CopilotChatUserMessage.Container`. A bare function component fails to typecheck. It works for slots whose default is a plain function (e.g. `cursor`), which is what this repo demonstrates — and, as #26 records, for `markdownRenderer`, whose default is a bare `React.FC`, so Markdown Rendering's "Replace the renderer" snippet compiles as published. Read this finding as "most slots", not "all slots". Relatedly, the doc's `"data-testid"` in a props-override object isn't in `ComponentProps` and is rejected.

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

**13. `agent.threadId` is not stable across a server render, and nothing says so**
CopilotKit mints a fresh thread id on every render, the SSR pass included — three consecutive `curl`s of the same route return three different ids. Any component that renders `agent.threadId` in server-rendered markup therefore throws *"Hydration failed because the server rendered text didn't match the client"* and has its subtree discarded and re-rendered. This repo's `/custom-look-and-feel/programmatic-control` demo hit exactly that by showing the thread id in its state panel.

A thread id being client state is reasonable; the gap is that no page covering `useAgent` mentions it, while the surrounding docs are Next-App-Router-first, where every component is server-rendered by default. Fixed here with `suppressHydrationWarning` on the one element that prints it — worth knowing before you render an id, a message count, or anything else off `agent` above the fold.

**14. Governed Actions publishes a zod 3 call into a zod 4 project**
[Governed Actions](https://docs.copilotkit.ai/agno/human-in-the-loop/governed-actions) declares the approval schema with `arguments: z.record(z.unknown())`. That single-argument form is zod 3. This repo is on **zod 4.4.3**, where `z.record` requires a key schema *and* a value schema, so the published call is `TS2554: Expected 2 arguments, but got 1`.

This is the one place in the repo where a published snippet was **not** taken verbatim: the registration lives in `frontend/src/components/global-frontend-tools.tsx`, which is mounted at the app root, so a type error there takes down every route rather than the one page being tested. It is written as `z.record(z.string(), z.unknown())` with the deviation marked in a comment beside it. The page states no zod version anywhere, and CopilotKit v2 ships zod 4 in its own peer range — so a reader following the page into a current project hits a compile error on the first snippet.

**15. Frontend-Driven Cards: a card added before the runtime connects is silently dropped**
[Frontend-Driven Cards](https://docs.copilotkit.ai/agno/generative-ui/frontend-cards) tells you to add cards through the agent `useAgent()` returns, and warns only against agents you construct yourself. Until the runtime's `/info` answers, `useAgent()` returns a *provisional* agent (`isReady: false`). `addMessage` on it succeeds and even updates `agent.messages`; when the real agent replaces it, the card is gone, with no error. Reproduced 3/3 with `/info` held back, and once unprompted on a cold first load. The page's own example is a WebSocket, which is exactly the kind of source that fires at startup. Two smaller gaps: step 3's component is never mounted in step 2's page, and its `wss://example.com/deployments` placeholder 404s. The central claim is sound — checked against the outgoing request, the run payload carried only `user` with a card in the transcript. Integration note: the bare `useAgent()` and `<CopilotChat />` resolve to `"default"`, which works here only because this runtime registers that id.

**16. Memories & Recall: the React snippet does not compile, and the runtime it runs on never exposes memory** _(first half fixed upstream 2026-09-21; see #25)_
[Memories & Recall](https://docs.copilotkit.ai/agno/intelligence/memories) imports `useMemories` from `@copilotkit/react-core`, which has no such export (1.69.2 and 1.71.0); it ships from `/v2`. The import is TS2305 plus a knock-on TS7006, and under Next 16 a Turbopack compile error for any route importing it — the verbatim file is kept, imported by nothing. With the import fixed, every `/memories` call 404s at the runtime: since 1.71.0 the routes are hidden unless `CopilotRuntime` gets `memory: { access }` (or the deprecated `exposeMemoryRoutes`), neither of which the page mentions — it says memory "is not a feature flag" and reads `isAvailable: false` as lack of entitlement. With the option added, the platform answers `403 MEMORY_NOT_ENTITLED` for this project; the hook flips `isAvailable` only on 404/501, so it reports `true` and the page's component, which never reads `error`, shows an empty list. `realtimeStatus` stayed `connecting` on both runtimes. Saving from React (`addMemory`) is never shown; the REST examples post to "your-deployment" without naming the managed host.

**17. Learning: a missing container breaks the chat, and the snippet leaves two identifiers undefined**
[Learning](https://docs.copilotkit.ai/agno/learning)'s runtime snippet returns `"expense-review"` for `expense-agent`. With no such container in the project, the platform refuses to create the Thread (`LEARNING_CONTAINER_NOT_FOUND`), the run returns 404 "Failed to initialize thread", and the chat shows the user's message and nothing else; `default` on the same runtime answers. The troubleshooting table's row for this — "A Thread never appears in the container" — describes a far milder failure. The snippet's `agents` and `identifyUser` are never defined on the page (supplied in `lib/learning-runtime.ts`, marked). `getLearningContainerId` exists only from runtime 1.70, a floor the page does not state; on 1.69.x it is a type error.

### Findings from the 2026-09-21 sync

Versions for every finding below, unless it names its own: `@copilotkit/runtime` and `@copilotkit/react-core` **installed 1.72.0, declared `^1.72.0`** (`frontend/package.json`, `frontend/package-lock.json`); `@copilotkit/core` **1.72.0, not declared** (transitive); `@ag-ui/agno` **0.0.6** (declared `^0.0.6`); `@ag-ui/client` **0.0.59** (declared `0.0.x`); `@ag-ui/core` **0.0.59, not declared**; `streamdown` **1.6.11, not declared** (transitive, `@copilotkit/react-core` declares `^1.3.0`); `rxjs` **7.8.1, not declared**; `@langchain/core` **1.2.11, not declared**; `next` **16.3.3**; `zod` **4.4.3** (declared `^4.4.3`). Absent entirely: `@typesafe-ai/sdk`, `@langchain/openai`, `@copilotkit/intelligence-langgraph`. The declared `^1.72.0` is the **working tree**; the committed `frontend/package.json` at `353ccb9` still reads `^1.69.2`, and that bump is an uncommitted edit belonging to someone else. The versions `frontend/VERSIONS.md` records are from the last recording run (react-core/runtime 1.71.0 against a declared `^1.69.2`) and are older than what is installed now.

**18. The landing page's new route snippet contradicts every other page's filename**
[The /agno landing page](https://docs.copilotkit.ai/agno) gained its first code block, titled `app/api/copilotkit/route.ts`. The [Quickstart](https://docs.copilotkit.ai/agno/quickstart), [Copilot Runtime](https://docs.copilotkit.ai/agno/copilot-runtime) and [Thread & History Lifecycle](https://docs.copilotkit.ai/agno/threads-lifecycle) pages all title the same file `app/api/copilotkit/[[...slug]]/route.ts`, and Copilot Runtime is explicit that it "lives at a **catch-all** path" so the runtime can serve `/info`, agent runs and threads. Next.js will not serve a plain `route.ts` beside an optional catch-all in the same folder, so the two published filenames cannot both exist in one app and the landing page never says which to keep. The snippet also exports `GET` and `POST` only, where Copilot Runtime publishes four exports including `PATCH` and `DELETE`, and it omits the `intelligence` and `identifyUser` options the Quickstart's version of the same file carries. This repo ships the catch-all and quotes the landing snippet on `/` rather than shipping both; **not verified by a build**, because the conflicting file cannot be added without taking every route down.

**19. `learnedSkills` on `BuiltInAgent` does not exist on the current runtime, and no version floor is given**
[Automatic learned skill delivery](https://docs.copilotkit.ai/agno/intelligence/learned-skills) added a `BuiltInAgent` row to its adapter table and a section configuring `learnedSkills` directly on the agent, "no wrapper or separate adapter package required". On the installed **`@copilotkit/runtime` 1.72.0** (declared `^1.72.0`) none of it compiles: `built-in-agent.ts(40,3): error TS2353: Object literal may only specify known properties, and 'learnedSkills' does not exist in type 'BuiltInAgentConfiguration'`, the same TS2353 at `(51,3)` for `'BuiltInAgentAISDKFactoryConfig | BuiltInAgentClassicConfig'`, and `(52,35): error TS2339: Property 'learnedSkills' does not exist on type 'AgentFactoryContext'`. `BuiltInAgentFactoryContext`, which the page tells you to import to annotate a factory context, is `TS2724: '"@copilotkit/runtime/v2"' has no exported member named 'BuiltInAgentFactoryContext'. Did you mean 'AgentFactoryContext'?`. All four land in **1.73.0**, published after this doc text; the page states no floor. Both snippets are verbatim in `frontend/src/app/intelligence/learned-skills/built-in-agent.ts`, errors acknowledged in place, imported by nothing. Separately, a `BuiltInAgent` runs the model from the runtime, so following this section in the Agno guide replaces the Agno agent rather than delivering skills to it, and the page does not mention that. Agno still has no row of its own.

**20. Quickstart moved the project key from `.env.local` to `.env` without saying so**
[Quickstart](https://docs.copilotkit.ai/agno/quickstart) step 1 became "Set up CopilotKit Intelligence" and now states that managed setup "does not issue `COPILOTKIT_LICENSE_TOKEN`". The runtime step adds `npx copilotkit@latest project select`, which "writes the server-side project API key to `.env`", and the env block that used to be titled `.env.local` is now titled `.env`. Next.js loads both: the installed `@next/env` orders them `.env.${mode}.local`, `.env.local`, `.env.${mode}`, `.env`, first value winning, so a key left in `.env.local` by the older instructions silently outranks the one the CLI writes. Nothing on the page mentions the move or the precedence. This repo keeps its key in `frontend/.env.local`, which is what its own setup table documents.

**21. The Inspector page fixed its credential snippet and now links out of the section**
[Inspector](https://docs.copilotkit.ai/agno/inspector) replaced `publicLicenseKey={process.env.NEXT_PUBLIC_COPILOTKIT_LICENSE_KEY}` with `runtimeUrl="/api/copilotkit"` in its disable snippet, and its prose now says `copilotkit project select` writes `CPK_INTELLIGENCE_API_KEY` to a server-side `.env` that the Runtime reads. That closes the contradiction recorded in the 2026-09-15 drift commit, where this page published a browser key while the Threads Drawer page said the credential was server-side configuration and not a prop. What it added instead is three links this section cannot follow: "See [Runtime endpoints](/agno/backend/runtime-endpoints) for the complete setup" points at a page with no snapshot and no route here, and its two Intelligence-setup links still point at `/agno/intelligence/quickstart`, live upstream but untracked here since that route was removed.

**22. Slots links to a Markdown Rendering page that is not in the tested set**
[Slots](https://docs.copilotkit.ai/agno/custom-look-and-feel/slots) changed exactly one table cell: `markdownRenderer` now reads "See [Markdown Rendering](/agno/custom-look-and-feel/markdown)". That page was live upstream with no snapshot, no route and no recorder entry here, and `npm run drift` reported it as a new upstream page together with `/agno/cookbook/jev-generative-ui`.

_Closed 2026-09-21._ Both pages are now tracked: `doc-snapshot/pages/agno__custom-look-and-feel__markdown.md` and `agno__cookbook__jev-generative-ui.md`, with manifest entries mapping them to `/custom-look-and-feel/markdown` and `/cookbook/jev-generative-ui`. `npm run drift` now reports `0 new` and `0 in-section link target(s) tracked nowhere`, and exits 0. Findings #26 and #27 are what the two pages produced. Note this was done by hand rather than by `drift:sync`: `applyDocUpdates` guards its manifest write with `if (manifest.pages[p.docPath])`, so `--update` refreshes tracked pages only and can never add one.

**23. "Which name identifies an agent" hands an Agno reader a non-Agno example**
[Copilot Runtime](https://docs.copilotkit.ai/agno/copilot-runtime) gained a section explaining that the frontend can only ask for a key of the runtime's `agents` map. Its example is `my_agent: new HttpAgent({ url: "http://localhost:8000/" })`. On the `/agno` copy of this page that is doubly wrong for the reader: Agno's AgentOS serves AG-UI at `/agui`, not at the root, and the landing page's own snippet for the same job uses `AgnoAgent` with `http://localhost:8000/agui`. `HttpAgent` is also unimported at that point in the page; the only import of it appears much further down, in the direct-connection section. The section's claims about discovery are implemented on `/backend/copilot-runtime`, which now offers the unregistered `my_agent` key beside the two this runtime registers and reads `GET /api/copilotkit/info`; **neither the discovery error nor the `/info` payload has been observed at runtime here**, because no server was started in this pass.

**24. Learning's new delivery steps stop at an adapter this section does not have**
[Learning](https://docs.copilotkit.ai/agno/learning) replaced its one-line pointer to learned skills with three steps ending in an agent-server env block (`CPK_INTELLIGENCE_API_KEY`, `CPK_INTELLIGENCE_LEARNING_CONTAINER_ID=expense-review`) and a sentence sending readers to "the framework adapter examples for LangGraph Python, LangGraph TypeScript, Mastra, Google ADK, or Microsoft Agent Framework". Agno is in neither list, so the steps become unfollowable exactly where they become concrete, and the new BuiltInAgent row that would sidestep the adapter question is not mentioned in the list. The container id also disagrees across the two pages for the same task: Learning says `expense-review`, learned-skills configures `containerId: "support-learning"`. The rest of the new material (a daily schedule defaulting to 02:00 UTC, a 15-eligible-Thread threshold the page then hedges, "Start manual run now", two new troubleshooting rows) is dashboard-only and is neither exercised nor contradicted here.

**25. Fixed upstream: the Memories React snippet now imports from `/v2`**
[Memories & Recall](https://docs.copilotkit.ai/agno/intelligence/memories) changed one line, `@copilotkit/react-core` to `@copilotkit/react-core/v2`, which retires the first half of finding #16: the published component compiles on the installed 1.72.0, `frontend/src/app/intelligence/memories/memory-list.tsx` no longer needs its two suppressions, and the demo mounts that file instead of the private copy it used to carry. The rest of #16 stands and is unverified against this sync: the runtime still hides `/memories/*` behind an undocumented `memory: { access }`, and the 403 behaviour was last observed on 1.71.0.

### Findings from the two pages tracked on 2026-09-21

Both were live upstream and tracked nowhere until this pass (see #22). They are now snapshotted, routed, and in the recorder.

**26. Markdown Rendering: every claim on the page checks out, and one of them contradicts this repo's #3**
[Markdown Rendering](https://docs.copilotkit.ai/agno/custom-look-and-feel/markdown) is the page the Slots `markdownRenderer` row started pointing at. All three of its techniques are shipped verbatim at `/custom-look-and-feel/markdown/demo-chat`, and all three typecheck on the installed **`@copilotkit/react-core` 1.72.0** / **`streamdown` 1.6.11**. Four things worth recording, none of them a straight defect:

- **"Replace the renderer" passes a bare component, and that is fine here.** #3 records that `SlotValue<C> = C | string | Partial<ComponentProps<C>>` makes a plain function component unassignable to most slots, because it must match the default's type including attached statics. `CopilotChatAssistantMessage.MarkdownRenderer` is a plain `React.FC` with no statics, and its props are a supertype of `{ content: string }`, so `const PlainText = ({ content }: { content: string }) => ...` is assignable by ordinary contravariance. Verified with `npx tsc --noEmit`. **#3 is therefore about which slots, not about slots in general** — worth narrowing, because as written it would tell a reader this page's third snippet cannot compile.
- **The custom-tag compile error is exactly what the page prints.** `custom-tag-probe.tsx(34,15): error TS2353: Object literal may only specify known properties, and '"reference-chip"' does not exist in type 'Components'.` — character for character what the page publishes. The reproduction is kept in `frontend/src/app/custom-look-and-feel/markdown/custom-tag-probe.tsx`, imported by nothing, as a `@ts-expect-error`, so if a release ever starts accepting custom keys the suppression goes unused and this repo's typecheck fails.
- **The link-hardening claim holds, from the pipeline rather than from the component.** "`target="_blank" rel="noopener noreferrer"` already applied by the renderer's link hardening" is true: `streamdown` 1.6.11's default rehype plugins include `rehype-harden`, which writes both attributes onto the parsed node before any component mapping, so a `components` override receives them and spreading keeps them. Streamdown's own default anchor writes the weaker `rel="noreferrer"` first and is overwritten by the hardened pair. This is a **static read of the installed packages, not a runtime observation** — no server was started in this pass. The demo's probe row prints every attribute on the last rendered `a`, `h2` and `pre` so a recording settles it.
- **The one gap: the `components` map is Streamdown's API, and Streamdown is nobody's declared dependency.** The page links to streamdown.ai but never says which Streamdown version the slot forwards to, or that the map's keys and prop shapes are that package's surface rather than CopilotKit's. Here it resolves to **1.6.11** purely as a transitive of `@copilotkit/react-core`, which declares `^1.3.0` — so the type a reader writes against can move under a caret range they never wrote. Nothing had to be installed for this page, which is the upside.

Not exercised: the page's claim that everything works the same on `CopilotSidebar`, `CopilotPopup` and `CopilotChatMessageView`. Plausible from the types, not run.

**27. Jev cookbook: half the recipe is vendor-gated, the CopilotKit pin is a minor above what anything needs, and its shared-state link points at an API it never uses**
[Jev: fast generative UI](https://docs.copilotkit.ai/agno/cookbook/jev-generative-ui). Implemented at `/cookbook/jev-generative-ui` split the way the recipe actually splits: the published `lib/workspaces.ts` schemas and the published `app/page.tsx` picker are shipped verbatim and run; `lib/choose-panel.ts`, `lib/picker-agent.ts`, the runtime registration and `lib/learned-guidance.ts` are shipped verbatim, imported by nothing, with their unresolvable imports acknowledged in place. Nothing was installed and no version was bumped.

- **The decision layer needs a third-party account.** `choosePanel` calls `TypeSafeClient.systemOne` from `@typesafe-ai/sdk@0.6.0` with `model: "jev-1.13.0"` and a `TYPESAFE_API_KEY` from docs.typesafe.ai. `choose-panel.ts(33,47): error TS2307: Cannot find module '@typesafe-ai/sdk' or its corresponding type declarations.` The page says this once, in the sentence after the install line; the five steps that follow read as ordinary Next.js work, and Jev is the part that makes any of them do something.
- **1.73.0 is pinned with no stated floor and nothing shown to need it.** The install line pins `@copilotkit/core@1.73.0 @copilotkit/react-core@1.73.0 @copilotkit/runtime@1.73.0`. All three are **1.72.0** here (react-core and runtime declared `^1.72.0` in the working tree, `^1.69.2` at `353ccb9`; `@copilotkit/core` declared nowhere). Every published line that does not touch an absent package compiles against 1.72.0 — `useAgent`, `useCopilotKit`, `agent.subscribe`, `agent.setState`, `agent.abortRun`, `copilotkit.runAgent`, `CopilotRuntime`, `createCopilotEndpoint`, and the `AbstractAgent` subclass against `@ag-ui/client` 0.0.59. So the pin is either an unstated floor or an over-pin, and a reader cannot tell which. The inverse of #19, where 1.73.0 genuinely is required and no floor is given at all.
- **Four of the ten pins name packages this project never declared.** `@ag-ui/core` 0.0.59, `rxjs` 7.8.1 and `@langchain/core` 1.2.11 all resolve here at exactly the pinned versions, transitively. `@ag-ui/client` is declared `0.0.x` and resolves to the pinned 0.0.59. `zod` is pinned at **4.6.5** against an installed **4.4.3** (declared `^4.4.3`), and the published schemas parse on 4.4.3, so that pin is not a floor either. `@langchain/openai@1.5.13` is absent: `picker-agent.ts(37,28): error TS2307: Cannot find module '@langchain/openai' or its corresponding type declarations.`
- **It says it renders shared agent state; [Shared State](https://docs.copilotkit.ai/agno/shared-state) defines that as two-way.** The recipe's opening callout links there. Shared State opens with "Create a two-way connection between your UI and agent state" and shows both halves — `useAgent({ agentId, updates: [UseAgentUpdate.OnStateChanged] })` to read and `agent.setState` from a UI handler to write, explicitly "without going through the chat thread". The Jev recipe does the read half only, with a bare `useAgent({ agentId: "picker" })`, and routes every user action back as a chat message (`agent.addMessage` + `copilotkit.runAgent`). The description is accurate; the link is not, and it leads out of the tested set — `/agno/shared-state` sits in `sitemap.knownUnmapped` here. This repo's two-way implementation is on `/custom-look-and-feel/programmatic-control`.
- **Published under `/agno`, with nothing Agno in it.** No Agno agent, no Python backend, no `@ag-ui/agno`; the recipe builds its own `AbstractAgent` inside the Next process. Same shape as #19.
- **Two files are only valid concatenated, and one does not say so.** `lib/choose-panel.ts` is three blocks with an explicit "the first opens `choosePanel`, and the last closes it". `app/page.tsx` is three blocks under one title with only "build from the following blocks in order", and its first block ends mid-function after `const busy = ...` with a blank line inside the fence. A doc page's copy button copies one block.
- **The base recipe prompts Jev about guidance it always sends empty.** The control question says "Apply relevant publishedGuidance within these rules" and every score question asks about "relevant publishedGuidance", while `respond` calls `choosePanel(message, state, [], signal)` — always `[]` until the optional section at the bottom. Nothing says the base version runs with that clause dead.
- **The optional Learning extension names an undefined identifier and pins backwards.** It says to "attach `createSkillRegistryMiddleware({ registry })` and invoke the result of `skills.wrapAgent(agent)`": neither `skills` nor `createSkillRegistryMiddleware` is defined or imported anywhere on the page, and the only registry it defines is called `registry`. And it says to install `@copilotkit/intelligence-langgraph@1.71.2` "alongside the pinned stack above", which is the 1.73.0 stack — an exact pin two minors behind the exact pins it sits beside. Absent here: `learned-guidance.ts(26,31): error TS2307`, plus three knock-on `TS7006`s at `(35,36)`, `(37,34)` and `(38,17)` because the unresolved module makes `SkillRegistry` `any`. Same knock-on shape as #16.
- **`gpt-5.4` again.** The env block sets `OPENAI_MODEL=gpt-5.4` and `explain` defaults to `"gpt-5.4"` — the model id #4 records from the Quickstart, which this repo overrides to `gpt-4o`.
- **One point in #18's favour.** This page titles its runtime file `app/api/copilotkit/[[...slug]]/route.ts` and exports four handlers, agreeing with Quickstart, Copilot Runtime and Thread & History Lifecycle. The landing page's two-export `app/api/copilotkit/route.ts` is now the odd one out of four.

**Deviations from published snippets on this page — one, and it is in the demo, not in `Picker`.** The published `app/page.tsx` opens `export default function Page() { return <CopilotKitProvider runtimeUrl="/api/copilotkit"><Picker /></CopilotKitProvider>; }`. This app mounts exactly one `CopilotKitProvider runtimeUrl="/api/copilotkit"` at the root (`frontend/src/components/providers.tsx`), so the demo renders `<Picker />` directly rather than nesting a second provider. The `Picker` component itself is untouched. The deviation is also written in a comment at the top of `frontend/src/app/cookbook/jev-generative-ui/demo-chat/page.tsx`.

**The demo's bench is not a Jev decision and is labelled as such.** Above the published picker are three buttons that write a state object into the agent so the published panel markup has something to draw. The two panel objects are the literals `choose-panel.ts` builds, put through the published `PanelSchema.parse`. What is missing is `control.choice`, which selects between them, and `ranked`, which orders the comparison — both Jev answers — so the comparison renders in catalog order and the panel says so on screen. Nothing registers a `picker` agent, `useAgent({ agentId: "picker" })` reports `isReady: false`, and the published `send` returns early; the recorder handler **fails the take** if `isReady` ever comes back `true`, because on this stack that could only mean something was standing in for the vendor.

---

**28. Thread & History Lifecycle: the switch snippet's `existingId` is never defined**

[Thread & History Lifecycle](https://docs.copilotkit.ai/agno/threads-lifecycle) publishes `ThreadControls` calling `config?.setActiveThreadId(existingId, { explicit: true })`. `existingId` appears nowhere else on the page, and nothing says where an app gets the id of a conversation worth re-opening. The demo supplies the first thread that held a conversation, as a prop, with `!` because the button stays disabled until one exists; both handler calls are otherwise the page's text, and the published lines are quoted above them in `frontend/src/app/threads/lifecycle/demo-chat/page.tsx`.

The rest of the client lifecycle was observed by the recorder on CI-resolved `@copilotkit/react-core` 1.73.0 (declared `^1.69.2`), with the runtime on `InMemoryAgentRunner`: an auto id with `hasExplicitThreadId` false; a remount re-minting the id and clearing the chat; `setActiveThreadId(id, { explicit: true })` returning to the first thread and replaying both of its messages from the runner's `connect()`; `startNewThread()` minting a fresh non-explicit id; and, with a `threadId` prop pinned, `startNewThread()` changing nothing and logging `[CopilotKit] Ignoring startNewThread(): threadId is controlled via the threadId prop on CopilotChatConfigurationProvider.`, with the pinned id surviving a remount. Not exercised: `identifyUser` and Intelligence scoping, the headless first-message path, and the framework checkpointer layer.

### Findings from the 2026-09-22 sync

Seven pages moved. Five are renames and nothing else: Learning is now "Automatic Learning", Memories & Recall is now "User Memories", and Threads is "Rich Threads" wherever a page sends you into Inspector. The nav titles here follow the new names. Two pages were new upstream: `/agno/backend/message-history` is now tracked and built (#31), and `/agno/intelligence/self-hosting-ecs` is acknowledged in `sitemap.knownUnmapped` beside the Kubernetes self-hosting page it sits next to. Versions: `@copilotkit/react-core` and `@copilotkit/runtime` **installed 1.72.0, declared `^1.69.2`**; `@copilotkit/web-inspector` **installed 1.72.0, not declared** (transitive); latest on npm **1.73.0**.

**29. Threads Drawer: the sidebar host renders a component the page never defines**
[Threads Drawer](https://docs.copilotkit.ai/agno/prebuilt-components/copilot-threads-drawer) added "Use the Drawer with a sidebar chat": the same drawer beside `<CopilotSidebar defaultOpen={true} />`, because the sidebar "renders a `<CopilotChat>` inside itself and therefore shares the same chat configuration". That holds on the installed 1.72.0: `CopilotSidebar` renders `CopilotChat`, which reads `useCopilotChatConfiguration()` from the surrounding provider. The snippet also places `<YourMainContent />`, which appears nowhere else on the page; the demo supplies a placeholder, marked. It ships as a second tab at `/threads/drawer/demo-chat`, with two stated deviations: no nested `CopilotKitProvider` (the root mounts one), and `height: "100%"` instead of `100dvh` under the demo bar. The two new callouts need no code. One says the Drawer is v2-only; the other says its chat-header launcher appears on mobile viewports only, so a desktop recording showing no launcher is the design. **Static read only: the sidebar host has not been run or recorded.** `<CopilotPopup>` "on the same terms" is not exercised.

**30. Three pages now send you to Inspector tabs that do not exist**
Quickstart's verification step and the Rich Threads callout now say to open **Rich Threads** in Inspector, and Learning's callout says to go to **Automatic Learning**. The Inspector still labels those tabs `Threads` and `Learning`: `label: "Threads"` and `label: "Learning"` in `@copilotkit/web-inspector` 1.72.0 (installed) and in 1.73.0 (latest on npm, read from the tarball). [Inspector](https://docs.copilotkit.ai/agno/inspector) agrees with the product and disagrees with the other three: its tables still say **Threads** and **Learning**, while its one changed line links to "Automatic Learning". A reader following Quickstart looks for a tab that is not there. This repo's Inspector page keeps the labels the Inspector actually shows.

**31. Message history: the recommended recipe is a prop no release has**
[Message history](https://docs.copilotkit.ai/agno/backend/message-history) is new. Its first recipe, which it calls the one "most applications need", is `messageFilter={(messages) => messages.slice(-1)}` on `<CopilotKit>`. No published `@copilotkit/react-core` declares it: not the installed **1.72.0** (declared `^1.69.2`) and not **1.73.0**, the latest on npm (published 2026-09-19); no file in either package mentions `messageFilter`. So it is a type error and, at runtime, an ignored prop, and everything the page says it does (shrinking the request body, repairing split tool-call pairs, surviving agent replacement) does not happen. It is mounted verbatim on the demo's second tab under a `@ts-expect-error`, so the typecheck fails the day a release ships it. The middleware half works: `trim-history.ts` compiles on `@ag-ui/client` **0.0.59** (declared `0.0.x`), the page's own check script prints `trim-history: forwarded only the answered call, next to its result`, and the runtime placement is live at `/api/copilotkit-trimmed`. Three smaller gaps: the runtime snippet reads `process.env.AGENT_URL!`, which the page never defines (supplied in the route, marked); the check script's `answers.add(trimmedParallel[i].toolCallId)` is `TS2339: Property 'toolCallId' does not exist on type ...` as published, because the loop condition narrows `trimmedParallel[i]?.role` and not the element read again (acknowledged in place); and the `selfManagedAgents` recipe is quoted, not mounted, because its agent URL is a placeholder. **Observed 2026-09-22 against this repo's backend:** Agno is not in the page's list of history-keeping backends, and on this stack there is nothing to trim. Sent *My name is Sam*, *Ok*, *What is my name?* in one run, the AgentOS AG-UI endpoint answered `UNKNOWN` both directly and through the trimmed runtime, and across two runs on one thread it answered `UNKNOWN` too. The agent has `db` but no `add_history_to_context`. The page never says which integrations it applies to. The route is in `SKIP_RECORDING` by owner instruction until recording is turned on.

## 10. Troubleshooting

| Symptom                                                | Cause                                                                                 | Fix                                                                                                                                                                                                     |
| ------------------------------------------------------ | ------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Chat sends, nothing streams back                       | Agno process down, or `AGNO_AGENT_URL` wrong                                          | Check the home page connection panel; run `uv run main.py`.                                                                                                                                             |
| A run starts, then hangs forever                       | The agent called a browser tool with no registered handler, so no result ever returns | Every `external_execution=True` tool in `backend/tools/frontend_tools.py` needs a matching `useFrontendTool`/`useHumanInTheLoop`. This repo registers all four at the app root for exactly this reason. |
| Tool runs but custom UI doesn't render                 | Renderer name ≠ tool name                                                             | `useRenderTool({ name })` must equal the Python function name exactly, including case. That's why the Python frontend tools are camelCase.                                                              |
| Connection errors mentioning `localhost`               | DNS resolving to IPv6 while the server binds IPv4                                     | Use `127.0.0.1` in `AGNO_AGENT_URL`.                                                                                                                                                                    |
| Thread list empty, drawer shows a lock                 | The Runtime reports no active entitlement                                             | Expected — not a bug. Set `CPK_INTELLIGENCE_API_KEY` (managed), or `COPILOTKIT_LICENSE_TOKEN` if self-hosted. It is server-side config, not a provider prop.                                             |
| Backend exits: `Form data requires "python-multipart"` | Missing transitive dep                                                                | `uv add python-multipart` (already in this repo).                                                                                                                                                       |
| Backend exits: `OPENAI_API_KEY is not set`             | No key                                                                                | Copy `.env.example` → `backend/.env`. Failing fast is intentional.                                                                                                                                      |
| Inspector never appears                                | Production build                                                                      | It is disabled unconditionally in production. Use `npm run dev`.                                                                                                                                        |

---

## Doc drift detection

`/doc-sync` keeps this repo honest about the docs it mirrors. Press **Sync docs now** (on the landing page or on `/doc-sync`) and it fetches the markdown source behind all 29 tracked doc pages, diffs each against the copy stored in `doc-snapshot/`, replaces that copy, and reports what moved — ranked by whether the change can actually break an implementation.

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
npm run record            # all 18, in nav order
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

**Rich Threads** — [Overview](https://docs.copilotkit.ai/agno/threads) · [Threads Drawer](https://docs.copilotkit.ai/agno/prebuilt-components/copilot-threads-drawer) · [Headless Threads](https://docs.copilotkit.ai/agno/headless-threads) · [Thread & History Lifecycle](https://docs.copilotkit.ai/agno/threads-lifecycle) · [Synchronize Thread History](https://docs.copilotkit.ai/agno/threads-import) · [Threads & Persistence Architecture](https://docs.copilotkit.ai/agno/intelligence/threads-explained)

**Custom Look and Feel** — [Programmatic Control](https://docs.copilotkit.ai/agno/programmatic-control) · [Inspector](https://docs.copilotkit.ai/agno/inspector) · [Slots](https://docs.copilotkit.ai/agno/custom-look-and-feel/slots) † · [Headless UI](https://docs.copilotkit.ai/agno/custom-look-and-feel/headless-ui) † · [Markdown Rendering](https://docs.copilotkit.ai/agno/custom-look-and-feel/markdown)

**Generative UI** — [Your Components · Display-only](https://docs.copilotkit.ai/agno/generative-ui/your-components/display-only) · [Your Components · Interactive](https://docs.copilotkit.ai/agno/generative-ui/your-components/interactive) † · [Tool Rendering](https://docs.copilotkit.ai/agno/generative-ui/tool-rendering)

**App Control** — [Frontend Tools](https://docs.copilotkit.ai/agno/frontend-tools) · [Governed Actions](https://docs.copilotkit.ai/agno/human-in-the-loop/governed-actions) · [Human in the Loop](https://docs.copilotkit.ai/agno/human-in-the-loop) † · [WebMCP](https://docs.copilotkit.ai/agno/webmcp) ‡

**Backend** — [Copilot Runtime](https://docs.copilotkit.ai/agno/copilot-runtime) · [AG-UI](https://docs.copilotkit.ai/agno/ag-ui)

**Troubleshooting** — [Error Debugging & Observability](https://docs.copilotkit.ai/agno/troubleshooting/error-debugging)

**Cookbook** — [Jev: fast generative UI](https://docs.copilotkit.ai/agno/cookbook/jev-generative-ui)

**External** — [Agno docs](https://docs.agno.com) · [AG-UI protocol](https://ag-ui.com) · [AG-UI event types](https://docs.ag-ui.com/concepts/events)

† Resolves but is absent from the doc sidebar as of the sync date.

‡ Tracked for drift only — a route and a snapshot exist, the demo does not.
