# Screen Recording Automation Suite

Automated Playwright test and recording engine for **Next.js 16 (React 19)** and **Agno (Python / AgentOS)**.

## Directory Structure

```
autorecord/
├── record-all-pages.ts        # CLI entrypoint
├── README.md                  # Autorecord directory overview
└── recorder/
    ├── README.md              # Recording suite architecture documentation
    ├── types.ts               # Interface definitions
    ├── config.ts              # Page configurations and line ranges for all routes
    ├── engine.ts              # Playwright browser lifecycle and recording runner
    ├── overlays/
    │   ├── taskbar.ts         # Windows 11 taskbar simulation
    │   ├── cursor.ts          # Virtual mouse cursor physics and Bézier animations
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

2. **Step 2 — Visual Studio Code IDE View**:
   - Renders a standalone VS Code dark theme interface (`vs-dark`) generated directly from project source files on disk via `autorecord/recorder/ide/generator.ts`.
   - Renders a clean Explorer sidebar with expanded route folders, file tabs, and exact line numbers.
   - Highlights the exact snippet lines (`startLine` to `endLine`) in the project source file and smoothly glides cursor down the code.

3. **Step 3 — Live Interactive Demonstration**:
   - Navigates directly to the isolated demo endpoint (`http://localhost:3000/<route>/demo-chat`).
   - Injects the simulated Windows 11 Taskbar + Virtual Mouse cursor.
   - Types tailored prompts with natural keystroke timing and executes interactions (e.g. prebuilt tabs switching, Dark Mode state toggles, HITL option selections, live AG-UI stream monitoring).
   - Captures live streaming AI responses from the Agno backend.

4. **Video Export**:
   - Saves WebM recordings directly to `autorecord/videos/<filename>.webm` (1080p, 60fps).

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
npx tsx autorecord/record-all-pages.ts --page=quickstart
npx tsx autorecord/record-all-pages.ts --page=display-only
npx tsx autorecord/record-all-pages.ts --page=frontend-tools

# Record all configured pages sequentially
npx tsx autorecord/record-all-pages.ts
```

---

## Configured Pages

| Page ID | Route Demo | Target Source File | Highlighted Lines |
|---|---|---|---|
| `quickstart` | `/quickstart/demo-chat` | `frontend/src/app/quickstart/demo-chat/page.tsx` | 18–24 |
| `prebuilt-components` | `/prebuilt-components/demo-chat` | `frontend/src/app/prebuilt-components/demo-chat/page.tsx` | 59–94 |
| `threads-overview` | `/threads` | `frontend/src/app/threads/page.tsx` | 26–67 |
| `threads-drawer` | `/threads/drawer/demo-chat` | `frontend/src/app/threads/drawer/demo-chat/page.tsx` | 25–33 |
| `threads-headless` | `/threads/headless/demo-chat` | `frontend/src/app/threads/headless/demo-chat/page.tsx` | 24–36 |
| `threads-lifecycle` | `/threads/lifecycle/demo-chat` | `frontend/src/app/threads/lifecycle/demo-chat/page.tsx` | 41–68 |
| `threads-import` | `/threads/import` | `frontend/src/app/threads/import/page.tsx` | 36–43 |
| `threads-architecture` | `/threads/architecture` | `frontend/src/app/threads/architecture/page.tsx` | 42–79 |
| `programmatic-control` | `/custom-look-and-feel/programmatic-control/demo-chat` | `frontend/src/app/custom-look-and-feel/programmatic-control/demo-chat/page.tsx` | 72–85 |
| `inspector` | `/custom-look-and-feel/inspector/demo-chat` | `frontend/src/app/custom-look-and-feel/inspector/demo-chat/page.tsx` | 18–30 |
| `slots` | `/custom-look-and-feel/slots/demo-chat` | `frontend/src/app/custom-look-and-feel/slots/demo-chat/page.tsx` | 67–112 |
| `headless-ui` | `/custom-look-and-feel/headless-ui/demo-chat` | `frontend/src/app/custom-look-and-feel/headless-ui/demo-chat/page.tsx` | 19–33 |
| `display-only` | `/generative-ui/your-components/display-only/demo-chat` | `frontend/src/app/generative-ui/your-components/display-only/demo-chat/page.tsx` | 50–58 |
| `interactive` | `/generative-ui/your-components/interactive` | `frontend/src/app/generative-ui/your-components/interactive/page.tsx` | 1–17 |
| `tool-rendering` | `/generative-ui/tool-rendering/demo-chat` | `frontend/src/app/generative-ui/tool-rendering/demo-chat/page.tsx` | 50–80 |
| `frontend-tools` | `/frontend-tools/demo-chat` | `frontend/src/app/frontend-tools/demo-chat/page.tsx` | 25–96 |
| `human-in-the-loop` | `/human-in-the-loop/demo-chat` | `frontend/src/components/global-frontend-tools.tsx` | 74–114 |
| `copilot-runtime` | `/backend/copilot-runtime/demo-chat` | `frontend/src/app/backend/copilot-runtime/demo-chat/page.tsx` | 16–52 |
| `ag-ui` | `/backend/ag-ui/demo-chat` | `frontend/src/app/backend/ag-ui/demo-chat/page.tsx` | 70–100 |
| `error-debugging` | `/troubleshooting/error-debugging/demo-chat` | `frontend/src/app/troubleshooting/error-debugging/demo-chat/page.tsx` | 16–72 |
