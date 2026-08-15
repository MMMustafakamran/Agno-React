# Autorecord Suite

This directory contains the automated screen recording engine, test scripts, and utilities for the **CopilotKit + Agno** test harness.

## Overview

- **`record-all-pages.ts`**: CLI runner that accepts `--page=<id>` or records all configured pages sequentially.
- **`recorder/`**: The Playwright-based recording engine, overlays, configurations, and action handlers.
  - `config.ts`: Exact file paths, line numbers, doc URLs, and test prompts for all routes.
  - `engine.ts`: Playwright browser lifecycle manager, video recorder, and 3-step demonstration runner.
  - `overlays/`: Windows 11 taskbar simulation (`taskbar.ts`), Bézier mouse physics (`cursor.ts`), and developer notes (`notepad.ts`).
  - `actions/`: Tailored action handlers for custom UI interactions (HITL approvals, state toggles, tabs switching, browser dialogs, AG-UI live log).

## Running Recordings

Ensure both the Python backend (port 8000) and Next.js frontend (port 3000) are running:

```bash
# Record an individual feature page
npx tsx autorecord/record-all-pages.ts --page=quickstart
npx tsx autorecord/record-all-pages.ts --page=display-only
npx tsx autorecord/record-all-pages.ts --page=human-in-the-loop

# Record all pages sequentially
npx tsx autorecord/record-all-pages.ts
```

Recorded WebM videos are saved to [`videos/`](./videos/). For in-depth architecture details, see [`recorder/README.md`](./recorder/README.md).
