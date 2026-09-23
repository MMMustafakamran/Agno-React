# Findings — Agno-react
Current open doc defects only. A finding is added here only after a human reviews and approves it; page failures in a run are never written here automatically. Resolved or superseded findings are removed (see git history).
Stack: `@copilotkit/react-core`/`runtime` 1.73.3 (declared `^1.73.3`); `@ag-ui/agno` 0.0.6; `@ag-ui/client` 0.0.59; `streamdown` 1.6.11; `next` 16.3.3; `zod` 4.4.3. Docs base: `https://docs.copilotkit.ai/agno`.
Major = blocks a reader (doesn't compile, crashes/throws, silently broken behaviour, step impossible to follow, missing required step/package, 404 target). Minor = one-line notes.

Note: #2 and #9 are linked. `CopilotKitProvider` is needed for `code`, and it turns off the inspector without saying so.

## Major

### [Quickstart](https://docs.copilotkit.ai/agno/quickstart)
- **#7 Missing `python-multipart`**: `uv add agno fastapi uvicorn openai ag-ui-protocol` → `RuntimeError: Form data requires "python-multipart" to be installed`.
- **#12 Agent built with no `db`**: Frontend Tools/HITL/Generative UI pages need one to resume paused runs (see Frontend Tools below).
- **#20 `.env.local` → `.env` switch**: changed without notice; `@next/env` precedence lets a stale `.env.local` key win silently.

### [Landing](https://docs.copilotkit.ai/agno) / [Copilot Runtime](https://docs.copilotkit.ai/agno/copilot-runtime)
- **#18 Conflicting route files**: Landing uses `app/api/copilotkit/route.ts` (GET/POST only); Quickstart, Copilot Runtime, Threads Lifecycle use catch-all `[[...slug]]/route.ts` with 4 exports. They can't coexist in Next.
- **#23 Wrong agent URL, missing import**: `new HttpAgent({ url: "http://localhost:8000/" })`, but Agno serves `/agui`; `HttpAgent` not imported.

### [Tool Rendering](https://docs.copilotkit.ai/agno/generative-ui/tool-rendering)
- **#1 Sample doesn't compile**: shows `render: ({ status, args })`, no `parameters`. Real: `{ name, parameters: StandardSchemaV1, render }`, render prop `parameters`, statuses `inProgress|executing|complete`.

### [Error Debugging](https://docs.copilotkit.ai/agno/troubleshooting/error-debugging)
- **#2 `event.code` doesn't exist on `<CopilotKit>`**: its `onError` is legacy `CopilotErrorHandler` `{ type, timestamp, context, error }`. Only `<CopilotKitProvider>` gives `{ error, code, context }`.

### [Common Issues](https://docs.copilotkit.ai/agno/troubleshooting/common-issues)
- **#6 Wrong health-check endpoint**: `curl -d '{}' .../copilotkit/info`. AgentOS serves `POST /agui` and has no `/copilotkit/info`; use `GET /status`.

### [Slots](https://docs.copilotkit.ai/agno/custom-look-and-feel/slots)
- **#3 "Pass a component" fails type-check**: rejected for slots whose default has statics (e.g. `CopilotChatUserMessage.Container`), because `SlotValue<C> = C | string | Partial<ComponentProps<C>>`. A `"data-testid"` override is also rejected.

### [Inspector](https://docs.copilotkit.ai/agno/inspector)
- **#9 Inspector instructions break under `<CopilotKitProvider>`**: "enabled by default" and `enableInspector={false}` apply only to `<CopilotKit>`. The provider reads `showDevConsole` (default `false`); a hand-mounted `<CopilotKitInspector />` → "CopilotKit core not attached".

### [Frontend Tools](https://docs.copilotkit.ai/agno/frontend-tools) (+ [HITL](https://docs.copilotkit.ai/agno/human-in-the-loop), [Display Only](https://docs.copilotkit.ai/agno/generative-ui/your-components/display-only), [Interactive](https://docs.copilotkit.ai/agno/generative-ui/your-components/interactive))
- **#10 Unhandled Python tool hangs the run**: not stated. The `@tool(external_execution=True)` stub is presented as required, but tools travel in the AG-UI run input and work without stubs.
- **#12 `SqliteDb` setup unclear**: `db_file="tmp/agno.db"` is relative to the working directory (not stated); `pip install sqlalchemy` vs Quickstart `uv`; `tmp/agno.db` vs `/tmp/agno.db`.

### [Governed Actions](https://docs.copilotkit.ai/agno/human-in-the-loop/governed-actions)
- **#14 zod 3 syntax**: `z.record(z.unknown())` → `TS2554: Expected 2 arguments, but got 1` on zod 4.4.3. No zod version stated.

### `useAgent` / Programmatic Control
- **#13 Hydration failure**: `agent.threadId` is re-created on every render, including SSR → "Hydration failed…". No `useAgent` page mentions it.

### [Frontend-Driven Cards](https://docs.copilotkit.ai/agno/generative-ui/frontend-cards)
- **#15 Cards silently dropped**: a card added through a provisional `useAgent()` (`isReady: false`) is lost. The Step 3 component is never mounted; `wss://example.com/deployments` 404s.

### [Memories](https://docs.copilotkit.ai/agno/intelligence/memories)
- **#16 Memories silently empty**: `/memories` 404s unless `CopilotRuntime` gets the undocumented `memory: { access }`. Then `403 MEMORY_NOT_ENTITLED` while the hook reports `isAvailable: true`, and the component ignores `error` → empty list. `realtimeStatus` stuck `connecting`. `addMemory` never shown; REST host unnamed.

### [Automatic Learning](https://docs.copilotkit.ai/agno/learning)
- **#17 Chat blank / undefined identifiers**: missing `"expense-review"` container → `LEARNING_CONTAINER_NOT_FOUND`, 404 "Failed to initialize thread", and the chat shows nothing (troubleshooting understates it). `agents`, `identifyUser` undefined. `getLearningContainerId` needs runtime ≥1.70, not stated.
- **#36 Required packages unpublished**: points to LangGraph Python example; `copilotkit-intelligence-langgraph`, `copilotkit-intelligence-adk`, `copilotkit-intelligence-runtime` all 404 on PyPI (not flagged). No Agno.

### [Skill delivery](https://docs.copilotkit.ai/agno/intelligence/learned-skills)
- **#19 `BuiltInAgent` replaces the Agno agent**: the page doesn't say so. No Agno adapter row. `learnedSkills` needs ≥1.73.0, no floor stated.
- **#32 Placeholder pins a nonexistent revision**: `revision: "exact-revision-id"` is live code in every snippet.
- **#34 Silent empty catalog**: "Omit them to use environment variables" vs "Omitting the configuration disables all skill requests". Dropping `learnedSkills` → empty catalog, no error.

### [Message History](https://docs.copilotkit.ai/agno/backend/message-history)
- **#31 Code doesn't compile**: `AGENT_URL` undefined; check script `toolCallId` TS2339. Doesn't say which integrations apply (Agno keeps no history here).

### [Threads Lifecycle](https://docs.copilotkit.ai/agno/threads-lifecycle)
- **#28 Undefined identifier**: `setActiveThreadId(existingId, …)`, and `existingId` is undefined.

### [Threads Drawer](https://docs.copilotkit.ai/agno/prebuilt-components/copilot-threads-drawer)
- **#29 Undefined component**: sidebar host uses undefined `<YourMainContent />`.

### [Jev cookbook](https://docs.copilotkit.ai/agno/cookbook/jev-generative-ui)
- **#27 Missing packages and undefined identifiers**: needs `@typesafe-ai/sdk` + `TYPESAFE_API_KEY` (TS2307); `@langchain/openai` not declared (TS2307). Learning extension: `skills`/`createSkillRegistryMiddleware` undefined; `intelligence-langgraph@1.71.2` vs 1.73.0 (TS2307). `app/page.tsx` is valid only when the snippets are joined, which the page doesn't say. `publishedGuidance` always `[]`. Also: pins `1.73.0`/`zod@4.6.5` with no stated minimums; links Shared State (two-way) but only reads it; nothing Agno; uses `gpt-5.4` (#4).

### Navigation / removed pages
- **#37 Removed page**: `/agno/intelligence/connect-your-runtime` → 404, no redirect.

## Minor notes
- #4 [Quickstart](https://docs.copilotkit.ai/agno/quickstart): code uses `OpenAIChat(id="gpt-5.4")` but the callout says "GPT-4o by default".
- #5 [Quickstart](https://docs.copilotkit.ai/agno/quickstart): troubleshooting says install `@ag-ui/client`; [Migrate to V2](https://docs.copilotkit.ai/agno/troubleshooting/migrate-to-v2) says it is re-exported from `@copilotkit/react-core/v2`.
- #8 Navigation: `/agno/prebuilt-components.md` is 142 bytes (`<PrebuiltComponents />`), with no readable source.
- #11 Navigation: `human-in-the-loop`, `custom-look-and-feel/slots`, `custom-look-and-feel/headless-ui` return 200 but are missing from nav.
- #21 [Inspector](https://docs.copilotkit.ai/agno/inspector): links to untracked `/agno/backend/runtime-endpoints` and `/agno/intelligence/quickstart`.
- #24 [Automatic Learning](https://docs.copilotkit.ai/agno/learning): delivery adapter list has no Agno row; container id `expense-review` vs learned-skills `support-learning`.
- #26 [Markdown Rendering](https://docs.copilotkit.ai/agno/custom-look-and-feel/markdown): the `components` map is Streamdown's API; Streamdown version not stated (transitive `^1.3.0`).
- #33 [Skill delivery](https://docs.copilotkit.ai/agno/intelligence/learned-skills): "Reuse an Intelligence SDK client" sets only `apiUrl`; the Intelligence quickstart says "Set both, or set neither."
- #35 [Plans](https://docs.copilotkit.ai/agno/intelligence/plans): says the free Developer plan "includes … User Memory", but this org gets `403 MEMORY_NOT_ENTITLED` (#16).
- #38 [Skill delivery](https://docs.copilotkit.ai/agno/intelligence/learned-skills): `CPK_INTELLIGENCE_API_KEY="your-project-key"` vs `cpk-...` elsewhere.

Kept: 1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,23,24,26,27,28,29,31,32,33,34,35,36,37,38
Removed: 22,25,30
