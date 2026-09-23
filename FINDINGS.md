# Findings — Agno-react
Current open doc defects only. A finding is added here only after a human reviews and approves it; page failures in a run are never written here automatically. Resolved or superseded findings are removed (see git history).
Stack: `@copilotkit/react-core`/`runtime` 1.73.3 (declared `^1.73.3`); `@ag-ui/agno` 0.0.6; `@ag-ui/client` 0.0.59; `streamdown` 1.6.11; `next` 16.3.3; `zod` 4.4.3. Docs base: `https://docs.copilotkit.ai/agno`.

Note: #2 and #9 are linked. `CopilotKitProvider` is needed for `code`, and it turns off the inspector without saying so.

## [Quickstart](https://docs.copilotkit.ai/agno/quickstart)
- **#4** Code `OpenAIChat(id="gpt-5.4")` vs callout "GPT-4o by default".
- **#5** Troubleshooting says install `@ag-ui/client`; [Migrate to V2](https://docs.copilotkit.ai/agno/troubleshooting/migrate-to-v2) says it is re-exported from `@copilotkit/react-core/v2`.
- **#7** `uv add agno fastapi uvicorn openai ag-ui-protocol` misses `python-multipart`: `RuntimeError: Form data requires "python-multipart" to be installed`.
- **#20** Env block switched `.env.local` → `.env` without notice; `@next/env` precedence lets a stale `.env.local` key win.
- **#12** Builds `Agent` with no `db`, but the Frontend Tools/HITL/Generative UI pages need one to resume paused runs (see below).

## [Landing](https://docs.copilotkit.ai/agno) / [Copilot Runtime](https://docs.copilotkit.ai/agno/copilot-runtime)
- **#18** Landing titles `app/api/copilotkit/route.ts` (GET/POST only); Quickstart, Copilot Runtime, Threads Lifecycle use catch-all `[[...slug]]/route.ts` with 4 exports. Can't coexist in Next.
- **#23** Copilot Runtime example `new HttpAgent({ url: "http://localhost:8000/" })`. Agno serves `/agui`, and `HttpAgent` is not imported.

## [Tool Rendering](https://docs.copilotkit.ai/agno/generative-ui/tool-rendering)
- **#1** Shows `render: ({ status, args })`, no `parameters`. Real: `{ name, parameters: StandardSchemaV1, render }`, render prop `parameters`, statuses `inProgress|executing|complete`. Sample doesn't compile.

## [Error Debugging](https://docs.copilotkit.ai/agno/troubleshooting/error-debugging)
- **#2** `event.code` on `<CopilotKit>` `onError`. That handler is the legacy `CopilotErrorHandler` `{ type, timestamp, context, error }`, with no `code`. Only `<CopilotKitProvider>` gives `{ error, code, context }`.

## [Common Issues](https://docs.copilotkit.ai/agno/troubleshooting/common-issues)
- **#6** `curl -d '{}' .../copilotkit/info`. AgentOS serves `POST /agui` and has no `/copilotkit/info`; use `GET /status`.

## [Slots](https://docs.copilotkit.ai/agno/custom-look-and-feel/slots)
- **#3** "Pass a component" fails for slots whose default has statics (e.g. `CopilotChatUserMessage.Container`), because `SlotValue<C> = C | string | Partial<ComponentProps<C>>`. `"data-testid"` override rejected.

## [Markdown Rendering](https://docs.copilotkit.ai/agno/custom-look-and-feel/markdown)
- **#26** `components` map is Streamdown's API; Streamdown version unstated (transitive `^1.3.0`).

## Navigation / generated pages
- **#8** `/agno/prebuilt-components.md` is 142 bytes (`<PrebuiltComponents />`); no readable source.
- **#11** `human-in-the-loop`, `custom-look-and-feel/slots`, `custom-look-and-feel/headless-ui` return 200 but are missing from nav.
- **#37** `/agno/intelligence/connect-your-runtime` → 404, no redirect.

## [Inspector](https://docs.copilotkit.ai/agno/inspector)
- **#9** Says "enabled by default" and shows `enableInspector={false}`. That is true only for `<CopilotKit>`. `<CopilotKitProvider>` has no `enableInspector` and reads `showDevConsole` (default `false`). Hand-mounted `<CopilotKitInspector />` forwards `core ?? null` → "CopilotKit core not attached".
- **#21** Links to untracked `/agno/backend/runtime-endpoints` and `/agno/intelligence/quickstart`.

## [Frontend Tools](https://docs.copilotkit.ai/agno/frontend-tools) (+ [HITL](https://docs.copilotkit.ai/agno/human-in-the-loop), [Display Only](https://docs.copilotkit.ai/agno/generative-ui/your-components/display-only), [Interactive](https://docs.copilotkit.ai/agno/generative-ui/your-components/interactive))
- **#10** Python `@tool(external_execution=True)` stub is presented as required, but tools travel in the AG-UI run input and work without stubs. Not stated: a Python tool with no frontend handler hangs the run.
- **#12** `SqliteDb(db_file="tmp/agno.db")` path is relative to the working directory (not stated); `pip install sqlalchemy` vs Quickstart `uv`; `tmp/agno.db` vs `/tmp/agno.db`.

## [Governed Actions](https://docs.copilotkit.ai/agno/human-in-the-loop/governed-actions)
- **#14** `z.record(z.unknown())` is zod 3; zod 4.4.3 gives `TS2554: Expected 2 arguments, but got 1`. No zod version stated.

## `useAgent` / Programmatic Control
- **#13** `agent.threadId` is re-created on every render, including SSR → "Hydration failed…". No `useAgent` page mentions it.

## [Frontend-Driven Cards](https://docs.copilotkit.ai/agno/generative-ui/frontend-cards)
- **#15** A card added through a provisional `useAgent()` (`isReady: false`) is silently dropped. Step 3 component is never mounted; `wss://example.com/deployments` 404s.

## [Memories](https://docs.copilotkit.ai/agno/intelligence/memories)
- **#16** `/memories` 404s unless `CopilotRuntime` gets `memory: { access }` (undocumented). Then it returns `403 MEMORY_NOT_ENTITLED` while the hook reports `isAvailable: true`, and the component ignores `error` → empty list. `realtimeStatus` stuck `connecting`. `addMemory` never shown; REST host unnamed.

## [Plans](https://docs.copilotkit.ai/agno/intelligence/plans)
- **#35** Says the free Developer plan "includes … User Memory"; this org gets `403 MEMORY_NOT_ENTITLED` (#16).

## [Automatic Learning](https://docs.copilotkit.ai/agno/learning)
- **#17** Missing `"expense-review"` container → `LEARNING_CONTAINER_NOT_FOUND`, 404 "Failed to initialize thread", and the chat shows nothing; the troubleshooting section understates it. `agents`, `identifyUser` undefined. `getLearningContainerId` needs runtime ≥1.70, not stated.
- **#24** Delivery adapter list has no Agno row; container id `expense-review` vs learned-skills `support-learning`.
- **#36** Points to LangGraph Python example; `copilotkit-intelligence-langgraph` 404 on PyPI; `copilotkit-intelligence-adk` 404; `copilotkit-intelligence-runtime` 404 (not flagged). No Agno.

## [Skill delivery](https://docs.copilotkit.ai/agno/intelligence/learned-skills)
- **#19** No Agno adapter row. Using `BuiltInAgent` replaces the Agno agent, which the page doesn't mention. `learnedSkills` needs ≥1.73.0, no floor stated.
- **#32** `revision: "exact-revision-id"` is live code in every snippet; copy-paste pins a nonexistent revision.
- **#33** "Reuse an Intelligence SDK client" sets `apiUrl` only; Intelligence quickstart says "Set both, or set neither."
- **#34** "Omit them to use environment variables" vs "Omitting the configuration disables all skill requests". Dropping `learnedSkills` → empty catalog, no error.
- **#38** `CPK_INTELLIGENCE_API_KEY="your-project-key"` vs `cpk-...` elsewhere.

## [Message History](https://docs.copilotkit.ai/agno/backend/message-history)
- **#31** `AGENT_URL` undefined; check script `toolCallId` TS2339; doesn't say which integrations apply (Agno keeps no history here).

## [Threads Lifecycle](https://docs.copilotkit.ai/agno/threads-lifecycle)
- **#28** `setActiveThreadId(existingId, …)`: `existingId` is undefined.

## [Threads Drawer](https://docs.copilotkit.ai/agno/prebuilt-components/copilot-threads-drawer)
- **#29** Sidebar host uses undefined `<YourMainContent />`.

## [Jev cookbook](https://docs.copilotkit.ai/agno/cookbook/jev-generative-ui)
- **#27** Needs `@typesafe-ai/sdk` + `TYPESAFE_API_KEY` (TS2307); `@langchain/openai` not declared (TS2307). Pins `1.73.0`/`zod@4.6.5` without stating minimum versions. Links Shared State (two-way) but only reads it. Nothing Agno. `app/page.tsx` is valid only when the snippets are joined, which the page doesn't say. `publishedGuidance` always `[]`. Learning extension: `skills`/`createSkillRegistryMiddleware` undefined; `intelligence-langgraph@1.71.2` vs 1.73.0 (TS2307). Uses `gpt-5.4` (#4).

Kept: 1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,23,24,26,27,28,29,31,32,33,34,35,36,37,38
Removed: 22,25,30
