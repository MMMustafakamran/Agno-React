# Screen Recording Automation Suite

Automated Playwright test and recording engine for **Next.js (React 19)** and **Agno (Python / AgentOS)**.

## Directory Structure

```
autorecord/
├── record-all-pages.ts        # CLI entrypoint & batch runner with summary report
├── README.md                  # Comprehensive root guide
├── PORTING_GUIDE.md           # Guide for porting to LangGraph/CrewAI/SDK projects
├── package.json               # Dependencies and scripts
├── videos/                    # Output directory for exported WebM videos
└── recorder/
    ├── README.md              # Architecture reference (this file)
    ├── types.ts               # Interface definitions
    ├── config.ts              # Page configurations and line ranges for all routes
    ├── engine.ts              # Playwright browser lifecycle, taskbar transitions & error coordinator
    ├── diagnostics.ts         # Pre-flight service checks & automated error diagnosis
    ├── ide/
    │   └── generator.ts       # Standalone pure HTML/CSS VS Code Dark+ simulator
    ├── overlays/
    │   ├── taskbar.ts         # Windows 11 taskbar simulation & app switching
    │   ├── cursor.ts          # Virtual mouse cursor physics and Bézier animations
    │   ├── nextjs-error.ts    # Next.js error badge auto-detector, click & modal expander
    │   └── notepad.ts         # Slide-up Notepad developer notes
    └── actions/
        ├── prebuilt.action.ts
        ├── slots.action.ts
        ├── headless-ui.action.ts
        ├── programmatic.action.ts
        ├── inspector.action.ts
        ├── hitl.action.ts
        ├── frontend-tools.action.ts
        ├── runtime.action.ts
        ├── ag-ui.action.ts
        ├── threads.action.ts
        ├── display-only.action.ts
        ├── tool-rendering.action.ts
        ├── error-debugging.action.ts
        ├── partial-notes.action.ts
        └── index.ts           # Action dispatcher & standard chat submission fallback
```

---

## 3-Step Demonstration Workflow

1. **Step 1 — Official Documentation View**:
   - Opens the official CopilotKit Agno documentation URL (`https://docs.copilotkit.ai/agno/...`).
   - Smoothly scrolls through content at human reading cadence and focuses cursor on the code block.
   - Glides cursor down to the simulated Windows 11 Taskbar and clicks the **VS Code** icon (illuminating its blue glow bar).

2. **Step 2 — Visual Studio Code IDE View**:
   - Renders a standalone VS Code dark theme interface (`vs-dark`) generated directly from project source files on disk via `autorecord/recorder/ide/generator.ts`.
   - Renders a clean Explorer sidebar with expanded route folders, file tabs, and exact line numbers.
   - Highlights the exact snippet lines (`startLine` to `endLine`) in the project source file and smoothly glides cursor down the code.
   - Glides cursor down to the Taskbar and clicks the **Chrome** icon (illuminating its blue glow bar).

3. **Step 3 — Live Interactive Demonstration**:
   - Navigates directly to the isolated demo endpoint (`http://localhost:3000/<route>/demo-chat`).
   - Injects the simulated Windows 11 Taskbar + Virtual Mouse cursor.
   - Types tailored prompts with natural keystroke timing and executes interactions (e.g. prebuilt tabs switching, Dark Mode state toggles, HITL option selections, live AG-UI stream monitoring).
   - If an error occurs:
     - ⏳ Pauses for 2.5 seconds.
     - 🖱️ Glides cursor to the Next.js dev badge at `(79, 1006)`.
     - 🖱️ Clicks the icon, turns the badge red (`#ca2a30`), and expands the **Next.js 15 Error Overlay Window** (showing error title, origin endpoint, and call stack trace).
     - ⏳ Holds for 4.5 seconds so the error diagnostics are captured in the recording.

4. **Video Export**:
   - Clean runs saved to `autorecord/videos/AgnoReact-<FeatureName>.webm` (`✅ [PASS]`).
   - Error runs saved to `autorecord/videos/AgnoReact-<FeatureName>_[ERROR].webm` (`❌ [FAIL]`).

---

## Usage

### 1. Ensure services are running:

- **Terminal 1 — Python Backend (port 8000):**
  ```bash
  cd backend
  uv run main.py
  ```

- **Terminal 2 — Next.js Frontend (port 3000):**
  ```bash
  cd frontend
  npm run dev
  ```

### 2. Run recordings:

```bash
# Record an individual page
npm run record -- --page=quickstart
npm run record -- --page=display-only
npm run record -- --page=human-in-the-loop

# Record all configured pages sequentially
npm run record
```
