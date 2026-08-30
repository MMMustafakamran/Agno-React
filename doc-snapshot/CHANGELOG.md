# Doc drift changelog

What the CopilotKit docs changed under this repo, written by the sync on
`/doc-sync`. Only pages that actually moved are recorded — a sync that finds
everything unchanged writes nothing here at all.

Holds the 3 most recent dated entries. When a change lands on a fourth
date, the oldest entry is dropped. Entries are counted, not aged, so a gap of
weeks between changes does not expire anything.

## 2026-08-30

### 13:45 UTC — 8 pages, highest severity high

**High — Frontend Tools**

`/agno/frontend-tools` · route `/frontend-tools` · under “Implementation”

18 code lines, 18 prose lines changed. The number of fenced code blocks changed.

````diff
+ <Callout type="warn" title="Configure session storage">
+ Agno must store the paused run before a frontend tool can return its result.
+ Configure a database on the `Agent` that owns the external tool.
+ 
+ Install the SQLite dependency:
+ 
+ ```bash
+ pip install sqlalchemy
````

**High — Your Components · Display-only**

`/agno/generative-ui/your-components/display-only` · route `/generative-ui/your-components/display-only` · under “Display-only”

14 code lines, 19 prose lines changed. The number of fenced code blocks changed.

````diff
+ 
+ <Callout type="warn" title="Configure session storage">
+ Agno must store the paused run before a frontend tool can return its result.
+ Configure a database on the `Agent` that owns the external tool.
+ 
+ Install the SQLite dependency:
+ 
+ ```bash
````

**High — Your Components · Interactive**

`/agno/generative-ui/your-components/interactive` · route `/generative-ui/your-components/interactive` · under “Interactive”

14 code lines, 19 prose lines changed. The number of fenced code blocks changed.

````diff
+ 
+ <Callout type="warn" title="Configure session storage">
+ Agno must store the paused run before a frontend tool can return its result.
+ Configure a database on the `Agent` that owns the external tool.
+ 
+ Install the SQLite dependency:
+ 
+ ```bash
````

**High — Human in the Loop**

`/agno/human-in-the-loop` · route `/human-in-the-loop` · under “Implementation”

18 code lines, 18 prose lines changed. The number of fenced code blocks changed.

````diff
+ <Callout type="warn" title="Configure session storage">
+ Agno must store the paused run before a frontend tool can return its result.
+ Configure a database on the `Agent` that owns the external tool.
+ 
+ Install the SQLite dependency:
+ 
+ ```bash
+ pip install sqlalchemy
````

**Low — Headless Threads**

`/agno/headless-threads` · route `/threads/headless` · under “What is this?”

6 prose lines changed.

````diff
- <OpsPlatformCTA
- variant="inline"
- title="Threads run in CopilotKit Intelligence"
- body="Get persistent threads and realtime sync on the free Developer tier."
+ <IntelligenceOnboardingPrompt
+ feature="threads"
````

**Low — Threads & Persistence Architecture**

`/agno/premium/threads-explained` · route `/threads/architecture` · under “Threads & Persistence Architecture”

6 prose lines changed.

````diff
- <OpsPlatformCTA
- variant="inline"
- title="Want to see threads in your own app?"
- body="Persistent threads ship with CopilotKit Intelligence on the free Developer tier."
+ <IntelligenceOnboardingPrompt
+ feature="threads"
````

**Low — Quickstart**

`/agno/quickstart` · route `/quickstart` · under “Quickstart”

7 prose lines changed.

````diff
- <OpsPlatformCTA
- variant="card"
- title="Ship Agno to production"
- body="Add persistent threads and the inspector with CopilotKit Intelligence."
- ctaLabel="Create a free account"
+ <IntelligenceOnboardingPrompt
+ feature="learning"
````

**Low — Overview**

`/agno/threads` · route `/threads` · under “Rich Threads”

14 prose lines changed.

````diff
+ <IntelligenceOnboardingPrompt
+ feature="threads"
+ surface="docs_threads_overview"
+ />
+ 
+ Open a real thread and use **Try from here** to copy it into a Playground scratch session. The stored thread does not change.
- 
- <OpsPlatformCTA
````

---

## 2026-08-24

### 09:24 UTC — 5 pages, highest severity high

**High — Copilot Runtime**

`/agno/copilot-runtime` · route `/backend/copilot-runtime` · under “Setting Up the Runtime”

41 code lines, 13 prose lines changed. The number of fenced code blocks changed.

````diff
- The runtime is a lightweight server endpoint that you add to your backend. Here's a minimal example using Next.js:
+ The runtime is a lightweight server endpoint that you add to your backend:
- ```ts title="app/api/copilotkit/route.ts"
+ ```npm
+ npm install @copilotkit/runtime
+ ```
+ 
+ Here's a minimal example using Next.js. `createCopilotRuntimeHandler` returns a
````

**High — Headless Threads** · _local snapshot edit, not an upstream change_

`/agno/headless-threads` · route `/threads/headless` · under “Configure your Runtime with Enterprise Intelligence”

18 code lines, 2 prose lines changed.

````diff
- Your `CopilotRuntime` must be connected to Enterprise Intelligence before the thread UI can list and resume conversations. If your app came from a CLI starter, this Runtime configuration is generated for you. Otherwise, keep your existing Enterprise Intelligence Runtime configuration while adding the headless UI. Thread names are automatically generated by the LLM after the first message — you can disable this with `generateThreadNames: false`.
+ Your `CopilotRuntime` must be connected to Enterprise Intelligence before the thread UI can list and resume conversations. That connection is the `intelligence` option below — a `CopilotKitIntelligence` instance. If your app came from a CLI starter, this Runtime configuration is generated for you. Otherwise, follow [Connect your runtime to Intelligence](/agno/premium/connect-your-runtime) for the full constructor, then return here to add the headless UI. Thread names are automatically generated by the LLM after the first message — you can disable this with `generateThreadNames: false`.
- import { CopilotRuntime } from "@copilotkit/runtime";
+ import {
+ CopilotKitIntelligence,
+ CopilotRuntime,
+ } from "@copilotkit/runtime/v2";
+ },
````

**High — Quickstart** · _local snapshot edit, not an upstream change_

`/agno/quickstart` · route `/quickstart` · under “Setup Copilot Runtime” · in a `tsx` block

30 code lines changed.

````diff
- ```tsx title="app/api/copilotkit/route.ts"
+ ```tsx title="app/api/copilotkit/[[...slug]]/route.ts" doctest="component"
- ExperimentalEmptyAdapter,
- copilotRuntimeNextJSAppRouterEndpoint,
- } from "@copilotkit/runtime";
+ createCopilotRuntimeHandler,
+ InMemoryAgentRunner,
+ } from "@copilotkit/runtime/v2";
````

**High — Thread & History Lifecycle**

`/agno/threads-lifecycle` · route `/threads/lifecycle` · under “Scope Rich Threads to the signed-in user” · in a `ts` block

8 code lines, 5 prose lines changed.

````diff
+ import { CopilotKitIntelligence, CopilotRuntime } from "@copilotkit/runtime/v2";
+ 
+ // `apiKey` is the only required field. The key scopes the project, so there is
+ // no separate project or organization id to pass. See Connect your runtime.
+ const intelligence = new CopilotKitIntelligence({
+ apiKey: process.env.INTELLIGENCE_API_KEY!,
+ });
+ 
````

**Low — Inspector** · _local snapshot edit, not an upstream change_

`/agno/inspector` · route `/custom-look-and-feel/inspector` · under “What it shows”

14 prose lines changed.

````diff
- The CopilotKit Inspector is a built-in debugging tool that overlays on your app, giving you full visibility into what's happening between your frontend and your agents in real time.
+ The CopilotKit Inspector is a built-in debugging tool that overlays on your app.
+ The first open lands on **Home**. Later opens return to the last pane you used.
+ | **Home** | Project, runtime, services, and CopilotKit news. |
+ | **Memory** | Inspect long-term memory when Intelligence exposes it. |
- The primary navigation groups the Inspector into **Threads**, **Agents**, and
- **Learning**. Threads is the default. Open a real Thread to inspect its
+ The sidebar has three groups: **Home**, **Workbench** (Threads, Memory), and
````

---

---

## 2026-08-21

### 13:15 UTC — 4 pages, highest severity medium

**Medium — Headless Threads**

`/agno/headless-threads` · route `/threads/headless` · under “Manage threads headlessly”

Simplified thread pagination and removed obsolete framework flags.

**Medium — Inspector**

`/agno/inspector` · route `/custom-look-and-feel/inspector` · under “Enable the inspector”

Added key distinction documentation for publishable vs server-side API keys.

**Medium — Quickstart**

`/agno/quickstart` · route `/quickstart` · under “Getting started”

Updated CLI scaffolding step formatting and instructions.

**Medium — Overview**

`/agno/threads` · route `/threads` · under “Get started”

Added inspector callout guidance to overview page.

---
