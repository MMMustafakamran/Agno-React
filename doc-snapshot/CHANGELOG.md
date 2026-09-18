# Doc drift changelog

What the CopilotKit docs changed under this repo, written by whichever sync
ran — the `/doc-sync` page or `npm run drift:sync`. Only pages that actually
moved are recorded — a sync that finds everything unchanged writes nothing
here at all.

Holds the 3 most recent dated entries. When a change lands on a fourth
date, the oldest entry is dropped. Entries are counted, not aged, so a gap of
weeks between changes does not expire anything.

## 2026-09-18

### 08:13 UTC — 3 pages, highest severity high · _npm run drift:sync_

**Medium — /agno/threads**

`/agno/threads` · route `/threads` · `agno__threads.md`

Headings / Structure changed. Hash a857ea89 ➔ 071567f5.

````diff
+ ## Persistent, rich conversations for your agents
+ CopilotKit Intelligence provides the persistence and conversation management behind Rich Threads: rich history, continuity across devices, reconnection to active runs, and ready-made thread controls.
+ **Starting fresh?** Intelligence stores your conversation history and restores messages, generative UI, tool interactions, and multimodal inputs when users return.
+ **Already using LangGraph or ADK persistence?** Keep it. Rich Threads complement your existing setup with a consistent, interactive conversation experience for your users.
+ Use [Threads Drawer](/agno/prebuilt-components/copilot-threads-drawer) for conversation switching, pagination, and archive/delete controls, or [Headless Threads](/agno/headless-threads) to build your own UI. For how Intelligence and framework persistence work together, see [Threads & Persistence Architecture](/agno/intelligence/threads-explained#how-rich-threads-complement-framework-persistence).
````

**High — /agno/threads-import**

`/agno/threads-import` · route `/threads/import` · `agno__threads-import.md`

Code block content changed. Hash b481e043 ➔ c8048d79.

````diff
- Import and synchronization bring existing conversations into CopilotKit Intelligence as Rich Threads without replacing the native storage or analytics you already use. Import supported history once, then continue running those conversations through CopilotKit so users can resume them through the same thread UI as new conversations.
- Built-in import currently supports Google ADK and LangGraph, with more sources coming soon. You can keep LangSmith, LangGraph, or ADK storage and analytics in place. For future CopilotKit-mediated runs, CopilotKit Intelligence persists the Rich Thread event history. When your agent remains connected to a durable LangGraph checkpointer or durable ADK session service with appropriate retention, those future runs continue through the native persistence path as well.
- New to the feature? Read the [Rich Threads overview](/agno/threads) first to understand the shared thread store and choose between the prebuilt Drawer and a custom headless UI.
- ## Supported sources
+ Import brings existing conversations into CopilotKit Intelligence as Rich Threads while you keep the native storage or analytics you already use. Import supported history once, then continue running those conversations through CopilotKit so users can resume them through the same thread UI as new conversations.
+ Built-in import currently supports Google ADK and LangGraph, with more sources coming soon. You can keep LangSmith, LangGraph, or ADK storage and analytics in place. For future CopilotKit-mediated runs, CopilotKit Intelligence persists the Rich Thread event history. When your agent remains connected to a durable LangGraph checkpointer or durable ADK session service with appropriate retention, those future runs continue through the native persistence path as well.
+ New to the feature? Read the [Rich Threads overview](/agno/threads) first to understand the shared thread store and choose between the prebuilt Drawer and a custom headless UI.
+ ## Supported sources
  … region truncated
````

**Medium — /agno/intelligence/threads-explained**

`/agno/intelligence/threads-explained` · route `/threads/architecture` · `agno__intelligence__threads-explained.md`

Headings / Structure changed. Hash e20b1c8d ➔ 6d1c9a5e.

````diff
- Threads are a platform-level concept, not tied to any specific agent framework. Whether your backend uses LangGraph, Mastra, CrewAI, or any other framework, threads work the same way.
- ## Key concepts
- ### Thread vs. Run
- A **thread** is the durable container. A **run** is a single agent execution within that thread. One thread can have many runs. Each time the user sends a message and the agent responds, that is a new run, and the thread accumulates events across all of its runs.
+ CopilotKit threads are a platform-level concept that works across agent frameworks.
+ ## How Rich Threads complement framework persistence
+ Starting fresh? CopilotKit Intelligence provides conversation persistence: it stores interaction events so users can reopen rich conversations across sessions and devices, reconnect to active runs, and manage their threads.
+ Already using framework persistence? Keep it configured. [LangGraph threads](https://docs.langchain.com/oss/python/langgraph/persistence) retain graph state and checkpoints; [Google ADK sessions](https://google.github.io/adk-docs/sessions/session/) retain conversation events and state. Intelligence adds the event history and synchronization used to restore the user's interactive conversation. Replaying that history is distinct from resuming framework execution from a checkpoint; framework-specific execution recovery remains with the framework.
  … region truncated
````

---

## 2026-09-17

### 07:24 UTC — 6 pages, highest severity high · _npm run drift:sync_

**Low — /agno/intelligence/quickstart**

`/agno/intelligence/quickstart` · route `/intelligence/quickstart` · `agno__intelligence__quickstart.md`

Prose / text phrasing updated. Hash 732692b3 ➔ 2457a82b.

````diff
- If it requires a CopilotKit CLI session check, you have permission to run it. Never reveal credentials or send optional diagnostic feedback reports.
+ If it requires a CopilotKit CLI session check, you have permission to run it. Never reveal credentials.
````

**Medium — /agno/quickstart**

`/agno/quickstart` · route `/quickstart` · `agno__quickstart.md`

Headings / Structure changed. Hash fab9dd5d ➔ d7148bda.

````diff
- <IntelligenceOnboardingPrompt
- feature="learning"
- surface="docs_agno_quickstart"
- />
+ ## Start with your coding agent
+ Use this prompt to connect your Agno agent to CopilotKit and verify a working conversation. Your coding agent will follow this guide in your project, or you can work through the manual steps below.
+ Ask your coding agent to follow the setup steps on this page for your selected framework and frontend.
````

**High — /agno/threads**

`/agno/threads` · route `/threads` · `agno__threads.md`

Code block content changed. Hash de3afbf5 ➔ a857ea89.

````diff
- <IntelligenceOnboardingPrompt
- feature="threads"
- surface="docs_threads_overview"
- />
+ <div
+ aria-label="A support workspace using Threads Drawer to move between customer conversations while CopilotChat renders the selected case details."
+ className="shell-docs-radius-surface relative mb-4 overflow-hidden border border-[var(--border)] bg-[var(--bg-surface)] shadow-[0px_16px_24px_-8px_rgba(1,5,7,0.12)] ring-1 ring-inset ring-white/70 dark:shadow-[0px_16px_32px_-10px_rgba(0,0,0,0.45)] dark:ring-white/10"
+ >
  … region truncated
````

**High — /agno/webmcp**

`/agno/webmcp` · route `/webmcp` · `agno__webmcp.md`

Code block content changed. Hash 9848d337 ➔ 598c6a70.

````diff
- ## Setup with a coding agent
+ ## Start with your coding agent
````

**High — /agno/intelligence/memories**

`/agno/intelligence/memories` · route `/intelligence/memories` · `agno__intelligence__memories.md`

Code fence count changed. Hash ec7aa0a8 ➔ 70058457.

````diff
- > How long-term memory works in CopilotKit Intelligence: what a memory is, the three kinds, user and project scope, how activation is entitled, and how to read and write memories from React, Angular, REST, or MCP.
- <IntelligenceOnboardingPrompt
- feature="learning"
- surface="docs_learn_memories"
+ > Give your agents long-term memory across conversations.
+ Threads remember a conversation. Memories remember a person. This page explains
+ what a memory is, how recall selects them, and what has to be true of your
+ deployment before the memory surfaces exist at all.
  … region truncated
````

**High — /agno/learning**

`/agno/learning` · route `/learning` · `agno__learning.md`

Code block content changed. Hash 0b6534d7 ➔ 810b6c31.

````diff
- ## Set up Learning
- When you are done, your Runtime will send selected Threads to a Learning container, ready to be analyzed and turned into reviewed Skills.
- <Steps>
- <Step>
+ ## Start with your coding agent
+ Copy this prompt into your coding agent to inspect your existing app and configure Automatic Learning for one focused workflow. Prefer to work through the setup yourself? Follow the manual steps below.
+ #### Copy this prompt into your coding agent
+ ```text
  … region truncated
````

---

---

## 2026-09-04

### 08:09 UTC — 6 pages, highest severity high

**High — Headless Threads**

`/agno/headless-threads` · route `/threads/headless` · under “Configure your Runtime with CopilotKit Intelligence”

2 code lines, 22 prose lines changed.

````diff
- Your `CopilotRuntime` must be connected to CopilotKit Intelligence before the thread UI can list and resume conversations. That connection is the `intelligence` option below — a `CopilotKitIntelligence` instance. If your app came from a CLI starter, this Runtime configuration is generated for you. Otherwise, follow [Connect your runtime to Intelligence](/agno/premium/connect-your-runtime) for the full constructor, then return here to add the headless UI. Thread names are automatically generated by the LLM after the first message — you can disable this with `generateThreadNames: false`.
+ Your `CopilotRuntime` must be connected to CopilotKit Intelligence before the thread UI can list and resume conversations. That connection is the `intelligence` option below — a `CopilotKitIntelligence` instance. If your app came from a CLI starter, this Runtime configuration is generated for you. Otherwise, follow [Connect your runtime to Intelligence](/agno/intelligence/connect-your-runtime) for the full constructor, then return here to add the headless UI. Thread names are automatically generated by the LLM after the first message — you can disable this with `generateThreadNames: false`.
- apiKey: process.env.INTELLIGENCE_API_KEY!,
+ apiKey: process.env.CPK_INTELLIGENCE_API_KEY!,
- CLI-created starters write the cloud-hosted platform URLs and project-scoped `INTELLIGENCE_API_KEY` to `.env`; keep that key server-side. Existing Intelligence-enabled apps should keep their current server-side Runtime configuration. Production self-hosting uses the same React APIs and is deployed with CopilotKit Engineering through [Self-host CopilotKit Intelligence](/agno/premium/self-hosting).
+ CLI `init` and its `create` alias write the cloud-hosted platform URLs,
+ `SL_ENABLED`, project-scoped `CPK_INTELLIGENCE_API_KEY`, and optional
+ `CPK_TELEMETRY_ID` to `.env`.
````

**Low — Inspector**

`/agno/inspector` · route `/custom-look-and-feel/inspector` · under “Showing or hiding the Inspector”

2 prose lines changed.

````diff
- a **different credential** from the server-side `INTELLIGENCE_API_KEY` that
+ a **different credential** from the server-side `CPK_INTELLIGENCE_API_KEY` that
````

**High — Quickstart**

`/agno/quickstart` · route `/quickstart` · under “Setup Copilot Runtime” · in a `tsx` block

4 code lines, 4 prose lines changed.

````diff
- apiKey: process.env.INTELLIGENCE_API_KEY!,
+ apiKey: process.env.CPK_INTELLIGENCE_API_KEY!,
- The runtime reads the license key from step 1. Add it to the app that serves
+ The runtime reads the project API key from step 1. Add it to the app that serves
- INTELLIGENCE_API_KEY=your_license_key
+ CPK_INTELLIGENCE_API_KEY=cpk-...
- [Connect your runtime to Intelligence](/agno/premium/connect-your-runtime) for the
+ [Connect your runtime to Intelligence](/agno/intelligence/connect-your-runtime) for the
````

**High — Synchronize Thread History**

`/agno/threads-import` · route `/threads/import` · under “Prepare the CopilotKit Intelligence destination” · in a `bash` block

2 code lines, 6 prose lines changed.

````diff
- export INTELLIGENCE_API_KEY="cpk_..."
+ export CPK_INTELLIGENCE_API_KEY="cpk-..."
- For the underlying persistence and replay model, see [Threads & Persistence Architecture](/agno/premium/threads-explained).
+ For the underlying persistence and replay model, see [Threads & Persistence Architecture](/agno/intelligence/threads-explained).
- - **Cloud-hosted CopilotKit Intelligence:** export the destination values generated in the CLI-created app's `.env`, or pass them with `--api-url` and `--api-key`. `project select` can rewrite the app's generated values, but the importer still reads only flags or the current process environment. See [Cloud-hosted CopilotKit Intelligence](/agno/premium/managed-intelligence-platform).
- - **Self-hosted CopilotKit Intelligence:** pass the deployment's app-api URL with `--api-url` and a project-scoped `cpk` runtime key with `--api-key`. See [Self-host CopilotKit Intelligence](/agno/premium/self-hosting).
+ - **Cloud-hosted CopilotKit Intelligence:** export the destination values generated in the CLI-created app's `.env`, or pass them with `--api-url` and `--api-key`. `project select` can rewrite the app's generated values, but the importer still reads only flags or the current process environment. See [Cloud-hosted CopilotKit Intelligence](/agno/intelligence/managed-intelligence-platform).
+ - **Self-hosted CopilotKit Intelligence:** pass the deployment's app-api URL with `--api-url` and a project-scoped `cpk` runtime key with `--api-key`. See [Self-host CopilotKit Intelligence](/agno/intelligence/self-hosting).
````

**High — Thread & History Lifecycle**

`/agno/threads-lifecycle` · route `/threads/lifecycle` · under “The lifecycle at a glance”

2 code lines, 8 prose lines changed.

````diff
- 2. **Run.** Messages and tool calls stream under that `threadId`. If a server-side store is configured (CopilotKit Intelligence, or a persisting `AgentRunner`), they are persisted as they happen so the thread can be replayed later. A runtime with no persistence layer keeps nothing server-side. See [Threads & Persistence Architecture](/agno/premium/threads-explained) for the full server-side model.
+ 2. **Run.** Messages and tool calls stream under that `threadId`. If a server-side store is configured (CopilotKit Intelligence, or a persisting `AgentRunner`), they are persisted as they happen so the thread can be replayed later. A runtime with no persistence layer keeps nothing server-side. See [Threads & Persistence Architecture](/agno/intelligence/threads-explained) for the full server-side model.
- Replay requires a **server-side store to replay from**: CopilotKit Intelligence, or a persisting `AgentRunner` (e.g. the SQLite runner). A self-hosted runtime with no persistence layer has nothing to replay, so `connectAgent()` returns an empty stream and the conversation starts blank. If history isn't restoring, check that a store is configured, not the client code. The [Persistence Architecture](/agno/premium/threads-explained) page covers how replay works server-side.
+ Replay requires a **server-side store to replay from**: CopilotKit Intelligence, or a persisting `AgentRunner` (e.g. the SQLite runner). A self-hosted runtime with no persistence layer has nothing to replay, so `connectAgent()` returns an empty stream and the conversation starts blank. If history isn't restoring, check that a store is configured, not the client code. The [Persistence Architecture](/agno/intelligence/threads-explained) page covers how replay works server-side.
- apiKey: process.env.INTELLIGENCE_API_KEY!,
+ apiKey: process.env.CPK_INTELLIGENCE_API_KEY!,
- [Connect your runtime to Intelligence](/agno/premium/connect-your-runtime) covers the
+ [Connect your runtime to Intelligence](/agno/intelligence/connect-your-runtime) covers the
````

**Low — Overview**

`/agno/threads` · route `/threads` · under “Next steps”

6 prose lines changed.

````diff
- - **Understand the architecture:** [Threads & Persistence Architecture](/agno/premium/threads-explained) — event replay, live reconnection, synchronization, locking, and lifecycle behavior
- - **Use the hosted platform:** [Cloud-hosted CopilotKit Intelligence](/agno/premium/managed-intelligence-platform) — create and manage the project where your app stores threads and runtime credentials
- - **Plan production self-hosting:** [Self-host CopilotKit Intelligence](/agno/premium/self-hosting) — work with CopilotKit Engineering to run the Threads platform in your Kubernetes environment
+ - **Understand the architecture:** [Threads & Persistence Architecture](/agno/intelligence/threads-explained) — event replay, live reconnection, synchronization, locking, and lifecycle behavior
+ - **Use the hosted platform:** [Cloud-hosted CopilotKit Intelligence](/agno/intelligence/managed-intelligence-platform) — create and manage the project where your app stores threads and runtime credentials
+ - **Plan production self-hosting:** [Self-host CopilotKit Intelligence](/agno/intelligence/self-hosting) — work with CopilotKit Engineering to run the Threads platform in your Kubernetes environment
````

---

---
