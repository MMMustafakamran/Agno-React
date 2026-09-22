# Doc drift changelog

What the CopilotKit docs changed under this repo, written by whichever sync
ran — the `/doc-sync` page or `npm run drift:sync`. Only pages that actually
moved are recorded — a sync that finds everything unchanged writes nothing
here at all.

Holds the 3 most recent dated entries. When a change lands on a fourth
date, the oldest entry is dropped. Entries are counted, not aged, so a gap of
weeks between changes does not expire anything.

## 2026-09-22

### 09:20 UTC — 1 page, highest severity high · _npm run drift:sync_

**High — /agno/backend/message-history**

`/agno/backend/message-history` · route `/backend/message-history` · `agno__backend__message-history.md`

Code fence count changed. Hash  ➔ 04032b1b.

````diff
+ # Message history
+ > Trim the conversation history CopilotKit forwards to an agent that already stores its own.
+ CopilotKit forwards the whole conversation on every run. The frontend holds the
+ transcript, and each run carries it to your agent as `input.messages`. A
+ stateless agent needs that, because the transcript is the only record of the
+ conversation.
+ An agent that stores its own history does not need it. If your backend keeps a
+ LangGraph checkpointer, Mastra memory, an AWS Strands `SessionManager`, or a
  … region truncated
````

### 08:52 UTC — 9 pages, highest severity high · _npm run drift:sync_

**Low — /agno/inspector**

`/agno/inspector` · route `/custom-look-and-feel/inspector` · `agno__inspector.md`

Prose / text phrasing updated. Hash f89ddbd9 ➔ 1b54d3fe.

````diff
- choose **Copy setup prompt**. See [Learning](/agno/learning) for the complete workflow.
+ choose **Copy setup prompt**. See [Automatic Learning](/agno/learning) for the complete workflow.
````

**High — /agno/prebuilt-components/copilot-threads-drawer**

`/agno/prebuilt-components/copilot-threads-drawer` · route `/threads/drawer` · `agno__prebuilt-components__copilot-threads-drawer.md`

Code fence count changed. Hash dd34f95e ➔ a9ef18bd.

````diff
- ```tsx title="app/page.tsx"
- import {
- CopilotKitProvider,
- CopilotChatConfigurationProvider,
+ <Callout type="warn">
+ **The Drawer ships only in `@copilotkit/react-core/v2`.** There is no v1
+ Drawer, so take the Drawer, the chat and the provider from that one package.
+ Watch the import path: `@copilotkit/react-ui` is the [deprecated v1
  … region truncated
````

**Low — /agno/quickstart**

`/agno/quickstart` · route `/quickstart` · `agno__quickstart.md`

Prose / text phrasing updated. Hash 62528078 ➔ 0cac5777.

````diff
- 3. Open **Threads**. The list is unlocked (Intelligence is on), or locked with Enable Intelligence (Intelligence is off).
+ 3. Open **Rich Threads**. The list is unlocked (Intelligence is on), or locked with Enable Intelligence (Intelligence is off).
````

**High — /agno/threads**

`/agno/threads` · route `/threads` · `agno__threads.md`

Code block content changed. Hash 071567f5 ➔ 5cb0dbeb.

````diff
- Open Inspector on localhost. Stay on **Threads** (it is the default).
+ Open Inspector on localhost. Stay on **Rich Threads** (it is the default).
````

**Medium — /agno/intelligence/memories**

`/agno/intelligence/memories` · route `/intelligence/memories` · `agno__intelligence__memories.md`

Headings / Structure changed. Hash e5918dbd ➔ 0c8af2f2.

````diff
- # Memories & Recall
- > Give your agents long-term memory across conversations.
- Threads remember a conversation. Memories remember a person. This page explains
- what a memory is, how recall selects them, and what has to be true of your
+ # User Memories
+ > Give your agents long-term memory across conversations.
+ Rich Threads remember a conversation. User Memories remember a person. This page explains
+ what a memory is, how recall selects them, and what has to be true of your
  … region truncated
````

**High — /agno/learning**

`/agno/learning` · route `/learning` · `agno__learning.md`

Code block content changed. Hash c6d0a948 ➔ 5debfb83.

````diff
- # Learning
- > Turn real application use into evidence-backed Insights and reviewed, reusable Skills.
- ## Overview
- Learning turns patterns from real agent runs into reusable Skills. It looks at completed conversations and application interactions in [Rich Threads](/agno/threads), produces evidence-backed Insights, and proposes instructions you can review before publishing.
+ # Automatic Learning
+ > Turn real application use into evidence-backed Insights and reviewed, reusable Skills.
+ ## Overview
+ Automatic Learning turns patterns from real agent runs into reusable Skills. It looks at completed conversations and application interactions in [Rich Threads](/agno/threads), produces evidence-backed Insights, and proposes instructions you can review before publishing.
  … region truncated
````

**Low — /agno/intelligence/learned-skills**

`/agno/intelligence/learned-skills` · route `/intelligence/learned-skills` · `agno__intelligence__learned-skills.md`

Prose / text phrasing updated. Hash 1bd5ef6d ➔ 771ee282.

````diff
- Start with the [Learning guide](/agno/learning) to collect Threads, configure daily runs, and review Skills. Before connecting an adapter, check that **Skill delivery** is enabled in the container's **Skills** tab. For guided setup, select **Set up skill delivery** there and copy the prompt into your coding agent.
- </Callout>
- ## Choose an adapter
- | Framework                 | Package                                  | Native extension                                                     |
+ Start with the [Automatic Learning guide](/agno/learning) to collect Threads, configure daily runs, and review Skills. Before connecting an adapter, check that **Skill delivery** is enabled in the container's **Skills** tab. For guided setup, select **Set up skill delivery** there and copy the prompt into your coding agent.
+ </Callout>
+ ## Choose an adapter
+ | Framework                 | Package                                  | Native extension                                                     |
  … region truncated
````

**New — https://docs.copilotkit.ai/agno/backend/message-history**

Listed upstream, tracked nowhere in this repo. Not snapshotted by this run.

**New — https://docs.copilotkit.ai/agno/intelligence/self-hosting-ecs**

Listed upstream, tracked nowhere in this repo. Not snapshotted by this run.

---

---

## 2026-09-21

### 07:26 UTC — 11 pages, highest severity high · _npm run drift:sync_

**High — /agno/copilot-runtime**

`/agno/copilot-runtime` · route `/backend/copilot-runtime` · `agno__copilot-runtime.md`

Code fence count changed. Hash 95f7ddc1 ➔ 3087e82c.

````diff
- The Copilot Runtime is the backend layer that connects your frontend application to your AI agents. It's set up during the [quickstart](/agno/quickstart) and is the recommended way to use CopilotKit.
- ## Setting Up the Runtime
- The runtime is a lightweight server endpoint that you add to your backend:
- ```npm
+ The Copilot Runtime is the backend layer that connects your frontend application to your AI agents. It's set up during the [quickstart](/agno/quickstart) and is the recommended way to use CopilotKit.
+ ## Setting Up the Runtime
+ The runtime is a lightweight server endpoint that you add to your backend:
+ ```npm
  … region truncated
````

**High — /agno**

`/agno` · routes `/`, `/doc-sync` · `agno.md`

Code fence count changed. Hash 5ce1dc60 ➔ 112784b1.

````diff
- frameworkIcon={<AgnoIcon className="h-10 w-10" />}
- header="Bring your Agno agents to your users"
- subheader="Give your Agno agents real user-interactivity using CopilotKit and AG-UI. Build rich, interactive, agent-powered applications."
- bannerVideo="https://cdn.copilotkit.ai/docs/copilotkit/videos/coagents/overview.mp4"
+ frameworkIcon={<AgnoIcon className="h-12 w-12" />}
+ header="Bring your Agno agents to your users"
+ subheader="Agno runs your agents. CopilotKit gives them a surface your users can see, interrupt and steer."
+ guideLink="/agno/quickstart"
  … region truncated
````

**Low — /agno/custom-look-and-feel/slots**

`/agno/custom-look-and-feel/slots` · route `/custom-look-and-feel/slots` · `agno__custom-look-and-feel__slots.md`

Prose / text phrasing updated. Hash 9ffcf536 ➔ 1faf23b7.

````diff
- | `markdownRenderer` | The markdown rendering component.  |
+ | `markdownRenderer` | The markdown rendering component. See [Markdown Rendering](/agno/custom-look-and-feel/markdown). |
````

**Low — /agno/inspector**

`/agno/inspector` · route `/custom-look-and-feel/inspector` · `agno__inspector.md`

Prose / text phrasing updated. Hash 4cd4ee59 ➔ f89ddbd9.

````diff
- `NEXT_PUBLIC_COPILOTKIT_LICENSE_KEY` is a browser-visible publishable key. It is
- different from the server-side `CPK_INTELLIGENCE_API_KEY` that
- `copilotkit project select` writes into your `.env`. The Runtime consumes the
- server-side key; never expose it to the browser.
+ For managed Intelligence, `copilotkit project select` writes
+ `CPK_INTELLIGENCE_API_KEY` to your server-side `.env`. The Runtime uses that key
+ and reports Intelligence access to the browser. Never expose the project API
+ key to the browser. See [Runtime endpoints](/agno/backend/runtime-endpoints) for the
  … region truncated
````

**Medium — /agno/prebuilt-components/copilot-threads-drawer**

`/agno/prebuilt-components/copilot-threads-drawer` · route `/threads/drawer` · `agno__prebuilt-components__copilot-threads-drawer.md`

Headings / Structure changed. Hash 7e71bed3 ➔ dd34f95e.

````diff
- server-side). <SignupLink surface="docs_drawer">Get a free developer account</SignupLink> to set that up.
- For multi-user applications, configure the Runtime to
- [scope Rich Threads to the signed-in user](/agno/threads-lifecycle#scope-rich-threads-to-the-signed-in-user).
- <OpsPlatformCTA
+ server-side). <SignupLink surface="docs_drawer">Start managed onboarding</SignupLink> to create or select a project.
+ For multi-user applications, configure the Runtime to
+ [scope Rich Threads to the signed-in user](/agno/threads-lifecycle#scope-rich-threads-to-the-signed-in-user).
+ <OpsPlatformCTA
  … region truncated
````

**High — /agno/quickstart**

`/agno/quickstart` · route `/quickstart` · `agno__quickstart.md`

Code fence count changed. Hash d7148bda ➔ 62528078.

````diff
- ### Create a free account
- <SignupLink surface="docs_agno_quickstart_step1">Sign up for a free developer account</SignupLink> for CopilotKit Intelligence to get a license key. You'll use it later to enable persistent threads and the inspector.
- </Step>
- <Step>
+ ### Set up CopilotKit Intelligence
+ <SignupLink surface="docs_agno_quickstart_step1">Sign in to managed Intelligence</SignupLink>. Managed setup uses a server-side project API key and does not issue `COPILOTKIT_LICENSE_TOKEN`. You will connect the app after you create it below.
+ </Step>
+ <Step>
  … region truncated
````

**Low — /agno/intelligence/memories**

`/agno/intelligence/memories` · route `/intelligence/memories` · `agno__intelligence__memories.md`

Prose / text phrasing updated. Hash 70058457 ➔ e5918dbd.

````diff
- import { useMemories } from "@copilotkit/react-core";
+ import { useMemories } from "@copilotkit/react-core/v2";
````

**High — /agno/learning**

`/agno/learning` · route `/learning` · `agno__learning.md`

Code fence count changed. Hash 810b6c31 ➔ c6d0a948.

````diff
- ## Start with your coding agent
- Copy this prompt into your coding agent to inspect your existing app and configure Automatic Learning for one focused workflow. Prefer to work through the setup yourself? Follow the manual steps below.
- #### Copy this prompt into your coding agent
- ```text
+ Automatic Learning checks eligible containers on a daily schedule. After you approve a Skill, automatic skill delivery makes it available to connected agents. Scheduling, publication, and delivery are separate: a scheduled run does not approve Skills, and enabling delivery does not connect your agent for you.
+ ## Start with your coding agent
+ Copy this prompt into your coding agent to inspect your existing app and configure Automatic Learning for one focused workflow. Prefer to work through the setup yourself? Follow the manual steps below.
+ #### Copy this prompt into your coding agent
  … region truncated
````

**High — /agno/intelligence/learned-skills**

`/agno/intelligence/learned-skills` · route `/intelligence/learned-skills` · `agno__intelligence__learned-skills.md`

Code fence count changed. Hash ee73d2f0 ➔ 1bd5ef6d.

````diff
- ## Choose an adapter
- | Framework                 | Package                                  | Native extension                                                     |
- | ------------------------- | ---------------------------------------- | -------------------------------------------------------------------- |
- | LangGraph Python          | `copilotkit-intelligence-langgraph`      | `create_skill_registry_middleware`                                   |
+ <Callout type="info">
+ Start with the [Learning guide](/agno/learning) to collect Threads, configure daily runs, and review Skills. Before connecting an adapter, check that **Skill delivery** is enabled in the container's **Skills** tab. For guided setup, select **Set up skill delivery** there and copy the prompt into your coding agent.
+ </Callout>
+ ## Choose an adapter
  … region truncated
````

**New — https://docs.copilotkit.ai/agno/cookbook/jev-generative-ui**

Listed upstream, tracked nowhere in this repo. Not snapshotted by this run.

**New — https://docs.copilotkit.ai/agno/custom-look-and-feel/markdown**

Listed upstream, tracked nowhere in this repo. Not snapshotted by this run.

---

---

---

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

---
