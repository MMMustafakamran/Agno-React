# Doc drift changelog

What the CopilotKit docs changed under this repo, written by the sync on
`/doc-sync`. Only pages that actually moved are recorded — a sync that finds
everything unchanged writes nothing here at all.

Holds the 3 most recent dated entries. When a change lands on a fourth
date, the oldest entry is dropped. Entries are counted, not aged, so a gap of
weeks between changes does not expire anything.

## 2026-08-21

### 15:10 UTC — 4 pages, highest severity medium

**Medium — Quickstart**

`/agno/quickstart` · route `/quickstart` · under “🎉 Start chatting!”

1 heading, 13 prose lines changed.

````diff
+ 
+ <Step>
+ ### Open Inspector and confirm setup
+ 
+ On localhost, click the Inspector button in the corner of the app.
+ 
+ 1. Open **Agents**, then **Agent**. Your agent is listed.
+ 2. Send a chat message. Open **Agents**, then **AG-UI Events**. Events are moving.
````

**Low — Headless Threads**

`/agno/headless-threads` · route `/threads/headless` · under “Switch between threads”

12 prose lines changed.

````diff
- <WhenFrameworkHas flag="thread_persistence_pattern" equals="langgraph">
- <Callout type="info" title="LangGraph persistence">
- When you pass an explicit CopilotKit `threadId`, CopilotKit forwards it to your backend as the AG-UI `threadId`. A LangGraph backend can use that value directly, or map it to its own checkpoint/thread identifier, when you implement that mapping. LangGraph Platform thread IDs must be UUIDs. CopilotKit `useThreads` manages Enterprise Intelligence Platform thread records; rename, archive, and delete operations do not update LangGraph stores unless your backend adds that bridge.
- </Callout>
- </WhenFrameworkHas>
- <WhenFrameworkHas flag="thread_persistence_pattern" equals="adk-session">
- <Callout type="info" title="ADK sessions">
- When you pass an explicit CopilotKit `threadId`, CopilotKit forwards it to your backend as the AG-UI `threadId`. An ADK backend can map that value to an ADK session ID, but the current showcase uses in-memory ADK services, so those sessions are not durable by default. Durable ADK session persistence requires configuring a separate ADK session service. CopilotKit `useThreads` manages Enterprise Intelligence Platform thread records, not ADK's native session store.
````

**Low — Inspector**

`/agno/inspector` · route `/custom-look-and-feel/inspector` · under “Showing or hiding the Inspector”

7 prose lines changed.

````diff
+ `NEXT_PUBLIC_COPILOTKIT_LICENSE_KEY` is a browser-visible publishable key and is
+ a **different credential** from the server-side `INTELLIGENCE_API_KEY` that
+ `copilotkit project select` writes into your `.env`. The server-side key is
+ consumed by the `CopilotKitIntelligence` client described in
+ [Runtime endpoints](/agno/backend/runtime-endpoints). Do not substitute one for the
+ other, and never expose the server-side key to the browser.
+ 
````

**Low — Overview**

`/agno/threads` · route `/threads` · under “Rich Threads”

20 prose lines changed.

````diff
+ <Callout type="info" title="See this in Inspector">
+ Open Inspector on localhost. Stay on **Threads** (it is the default).
+ Real threads appear when Intelligence is on. Enable Intelligence appears when it is off.
+ 
+ More detail: [Inspector](/agno/inspector).
+ </Callout>
+ 
+ 
````

---

## 2026-08-17

### 12:29 UTC — 1 page, highest severity high

**High — Human in the Loop** · _local snapshot edit, not an upstream change_

`/agno/human-in-the-loop` · route `/human-in-the-loop` · under “Define the frontend tool in your Agno agent” · in a `python` block

10 code lines changed.

````diff
+ 
+ @tool(external_execution=True)
+ def offerOptions(option_1: str, option_2: str):
+ """
+ Give the user a choice between two options and have them select one.
+ 
+ Args:
+ option_1: str: The first option
````
