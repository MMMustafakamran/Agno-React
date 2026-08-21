# Doc drift changelog

What the CopilotKit docs changed under this repo, written by the sync on
`/doc-sync`. Only pages that actually moved are recorded — a sync that finds
everything unchanged writes nothing here at all.

Holds the 3 most recent dated entries. When a change lands on a fourth
date, the oldest entry is dropped. Entries are counted, not aged, so a gap of
weeks between changes does not expire anything.

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
