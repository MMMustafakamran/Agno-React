# Doc drift changelog

What the CopilotKit docs changed under this repo, written by the sync on
`/doc-sync`. Only pages that actually moved are recorded — a sync that finds
everything unchanged writes nothing here at all.

Holds the 3 most recent dated entries. When a change lands on a fourth
date, the oldest entry is dropped. Entries are counted, not aged, so a gap of
weeks between changes does not expire anything.

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
