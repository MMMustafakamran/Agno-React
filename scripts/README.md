# Scripts & Automation

This directory contains the automated screen recording engine, test scripts, and utilities for the **CPK-MS-Agent-Python** project.

## Overview

- **`record-all-pages.ts`**: CLI runner that accepts `--page=<id>` or records all 17 configured pages sequentially.
- **`recorder/`**: The Playwright-based recording engine, overlays, configurations, and action handlers.
  - `config.ts`: Exact file paths, line numbers, doc URLs, and test prompts for all 17 routes.
  - `engine.ts`: Playwright browser lifecycle manager, video recorder, and 3-step demonstration runner.
  - `overlays/`: Windows 11 taskbar simulation (`taskbar.ts`), Bézier mouse physics (`cursor.ts`), and developer notes (`notepad.ts`).
  - `actions/`: Tailored action handlers for custom UI interactions (HITL approvals, state toggles, tabs switching, browser dialogs).

## Running Recordings

Ensure both the Python backend (port 8000) and Next.js frontend (port 3000) are running:

```bash
# Record an individual feature page
npm run record -- --page=quickstart
npm run record -- --page=interactive
npm run record -- --page=ag-ui

# Record all 17 pages
npm run record
```

Recorded WebM videos are saved to [`recordings/`](../recordings/). For in-depth architecture details, see [`recorder/README.md`](./recorder/README.md).
