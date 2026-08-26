# Dev Terminals & Step-by-Step Runners (Agno + CopilotKit)

This folder contains modular Windows Command Prompt (`.bat`) and PowerShell (`.ps1`) scripts designed to open dedicated, visible terminal windows for each phase of development, documentation synchronization, testing, and automation.

## Scripts Overview

| Step | Batch (`.bat`) | PowerShell (`.ps1`) | Purpose & Description |
|---|---|---|---|
| **Orchestrator** | **`run-all-step-by-step.bat`** | **`run-all-step-by-step.ps1`** | **Master Interactive Menu**: Launch individual steps, run guided step-by-step pipeline, or start both servers simultaneously in separate windows. |
| **01** | `01-check-doc-drift.bat` | `01-check-doc-drift.ps1` | **Doc Drift Check & Sync**: Runs `scripts/check-doc-drift.mjs` against `doc-snapshot/` with options to check only or automatically update `.md` files. |
| **01b** | `01b-sync-doc-snapshot.bat` | `01b-sync-doc-snapshot.ps1` | **Direct Doc Snapshot Sync**: Fetches live upstream documentation from `https://docs.copilotkit.ai/agno` and updates `doc-snapshot/pages/*.md` and `doc-snapshot/manifest.json`. |
| **02** | `02-update-dependencies.bat` | `02-update-dependencies.ps1` | **Update Packages**: Runs `uv sync --prerelease=allow` for Agno backend, and `npm install` for frontend & autorecorder. |
| **03** | `03-run-backend.bat` | `03-run-backend.ps1` | **Agno Backend Agent**: Runs Python FastAPI agent on port `8000` with `uv run --prerelease=allow main.py` (AG-UI endpoint at `/agui`). |
| **04** | `04-run-frontend.bat` | `04-run-frontend.ps1` | **Frontend Next.js**: Runs Next.js app on port `3000` with `npm run dev` (Doc-Sync UI at `http://localhost:3000/doc-sync`). |
| **05** | `05-run-autorecorder.bat` | `05-run-autorecorder.ps1` | **Playwright Autorecorder**: Runs video recorder in `autorecorder/` with interactive demo options or CLI arguments. |

---

## Quick Start

### Option 1: Master Orchestrator (Recommended)

Run from the root directory or double-click:

**Command Prompt / Batch:**
```cmd
run-terminals.bat
```
*Or directly: `dev-terminals\run-all-step-by-step.bat`*

**PowerShell:**
```powershell
.\run-terminals.ps1
```
*Or directly: `.\dev-terminals\run-all-step-by-step.ps1`*

#### Orchestrator Menu Options:
- **`[A]` Guided Step-by-Step**: Walks through Steps 1 through 5, prompting before opening each terminal.
- **`[S]` Start Servers Only**: Spawns backend (port 8000) and frontend (port 3000) concurrently in separate windows.
- **`[1]` Check Doc Drift**: Inspects live docs against local snapshot.
- **`[1B]` Sync Doc Snapshot**: Fetches and writes updated upstream doc pages to `doc-snapshot/`.
- **`[2]` Update Dependencies**: Syncs Python (`uv`) and Node (`npm`) dependencies across all directories.
- **`[3]` Run Backend Agent**: Starts FastAPI Agno agent with AG-UI endpoint on `:8000`.
- **`[4]` Run Frontend Next.js**: Starts Next.js development server on `:3000`.
- **`[5]` Run Autorecorder**: Launches Playwright recorder diagnostic and video capture tools.
- **`[Q]` Quit**: Exits the orchestrator.

---

### Option 2: Running Individual Steps Directly

Each script can be executed independently in its own window by double-clicking or from terminal:

```cmd
# Check or sync documentation drift
dev-terminals\01-check-doc-drift.bat
# Or direct sync:
dev-terminals\01b-sync-doc-snapshot.bat

# Install / update all dependencies
dev-terminals\02-update-dependencies.bat

# Start Agno agent server (:8000)
dev-terminals\03-run-backend.bat

# Start Next.js frontend (:3000)
dev-terminals\04-run-frontend.bat

# Run video recorder
dev-terminals\05-run-autorecorder.bat
```

For PowerShell:
```powershell
.\dev-terminals\01-check-doc-drift.ps1
.\dev-terminals\01b-sync-doc-snapshot.ps1
.\dev-terminals\02-update-dependencies.ps1
.\dev-terminals\03-run-backend.ps1
.\dev-terminals\04-run-frontend.ps1
.\dev-terminals\05-run-autorecorder.ps1
```
