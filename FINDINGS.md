# Findings — Agno-react
Open doc defects only. An entry is added only after the user approves it. Numbers are stable IDs (code cites `FINDINGS.md #N`), so gaps are removed findings.
Stack: `@copilotkit/react-core`/`runtime` 1.73.3, `@ag-ui/agno` 0.0.6, `@ag-ui/client` 0.0.59, `next` 16.3.3, `zod` 4.4.3, `agno` 3.0.11. Docs: https://docs.copilotkit.ai/agno

## Dev blockers (seen with `npm run dev` and normal use of the page)

### [Quickstart](https://docs.copilotkit.ai/agno/quickstart)
**#7 Backend crashes on start: `python-multipart` is missing.**
- **Doc:** `uv add agno fastapi uvicorn openai ag-ui-protocol`. The `main.py` it gives calls `AgentOS(...).get_app()`.
- **Error:** `RuntimeError: Form data requires "python-multipart" to be installed.` Reproduced from a clean install. The harness hides it: `backend/pyproject.toml:15` declares `python-multipart`.

### [Automatic Learning](https://docs.copilotkit.ai/agno/learning) / [Skill delivery](https://docs.copilotkit.ai/agno/intelligence/learned-skills)
**#36 Python packages don't exist on PyPI.**
- **Doc:** learned-skills:64 says "Python uses `copilotkit-intelligence-runtime`", and learning:41 recommends the LangGraph Python example. Neither is flagged.
- **Error:** `copilotkit-intelligence-runtime`, `-langgraph` and `-adk` all return 404 on PyPI, and pip says `No matching distribution found`. There is no Agno adapter.

## Minor notes
- #12 Quickstart/Frontend Tools: the agent is built with no `db`. `SqliteDb(db_file="tmp/agno.db")` is relative to the working directory, and the page uses `pip` while the rest of the docs use `uv`.
- #20 Quickstart: switched `.env.local` → `.env` without saying so. A leftover `.env.local` value silently wins.
- #18 Landing uses a plain `route.ts`, while other pages use `[[...slug]]/route.ts`.
- #23 Copilot Runtime: its naming example uses `HttpAgent({ url: "http://localhost:8000/" })`, while Agno serves `/agui`.
- #10 Frontend Tools: the `external_execution` stub is presented as required, but it isn't.
- #9 Inspector: `enableInspector` applies only to `<CopilotKit>`, not `<CopilotKitProvider>`.
- #3 Slots: passing a component where the default has statics fails the type-check. The page doesn't show that case.
- #6 Common Issues: health check is `/copilotkit/info`, but AgentOS serves `GET /status` (not re-verified).
- #13 `useAgent`: `threadId` at render time causes a hydration mismatch (not re-verified).
- #15 Frontend-Driven Cards: a card added before `isReady` is dropped. `wss://example.com` is a placeholder.
- #16 Memories: `/memories` 404s without the undocumented `memory: { access }`. The list is silently empty (entitlement-gated).
- #17 Automatic Learning: `agents` and `identifyUser` are placeholders. Without a container the chat is blank (premium).
- #19 Skill delivery: `BuiltInAgent` replaces the Agno agent, and the page doesn't say so.
- #32 Skill delivery: every example has `revision: "exact-revision-id"`. Line 70 does say to replace it.
- #34 Skill delivery: dropping `learnedSkills` silently gives an empty catalog.
- #28 Threads Lifecycle: `existingId` is undefined (a placeholder).
- #29 Threads Drawer: `<YourMainContent />` is undefined (a placeholder).
- #27 Jev: needs a paid `TYPESAFE_API_KEY`, and nothing on the page uses Agno.
- #37 `/agno/intelligence/connect-your-runtime` returns 404 with no redirect.
- #4 Quickstart: the code uses `gpt-5.4`, but the callout says "GPT-4o".
- #5 Quickstart says to install `@ag-ui/client`, but Migrate to V2 says it's re-exported.
- #8 `/agno/prebuilt-components.md` has no readable source.
- #11 Three pages return 200 but are missing from the nav.
- #24 Learning: no Agno row, and the container id `expense-review` doesn't match `support-learning`.
- #26 Markdown: the Streamdown version isn't stated.
- #33 Skill delivery: `apiUrl` without `wsUrl`, although the Intelligence quickstart says "set both".
- #35 Plans: says Developer includes User Memory, but the API returns `403 MEMORY_NOT_ENTITLED`.
- #38 Skill delivery: `"your-project-key"` vs `cpk-...`.

## Build-only (`tsc` / `next build`; `npm run dev` runs fine)
- **#1 [Tool Rendering](https://docs.copilotkit.ai/agno/generative-ui/tool-rendering):** `useRenderTool({ name, render: ({status, args}) => … args.location })` fails with `TS2769: Property 'parameters' is missing` and `TS2339: 'args' does not exist on RenderToolProps`. In dev the card probably renders "…for undefined." The harness adds `parameters`.
- **#2 [Error Debugging](https://docs.copilotkit.ai/agno/troubleshooting/error-debugging):** `<CopilotKit onError={(event) => … event.code}>` fails with `TS2339: Property 'code' does not exist on type 'CopilotErrorEvent'`. In dev it logs `[CopilotKit undefined]`. Only `<CopilotKitProvider>` has `code`.
- **#14 [Governed Actions](https://docs.copilotkit.ai/agno/human-in-the-loop/governed-actions):** `z.record(z.unknown())` fails with `TS2554: Expected 2-3 arguments, but got 1` on zod 4. The runtime effect isn't verified. Correct form: `z.record(z.string(), z.unknown())`.
- **#31 [Message History](https://docs.copilotkit.ai/agno/backend/message-history):** the check script fails with `TS2339` on `toolCallId`, and `AGENT_URL` is undefined.
