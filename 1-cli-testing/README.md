# CopilotKit CLI Testing

Run from this folder. The CLI creates and scaffolds a full CopilotKit + Agno starter project, authenticating with the Enterprise Intelligence Platform when enabled.

```bash
# npm
npx copilotkit@latest create

# pnpm
pnpm dlx copilotkit@latest create

# yarn
yarn dlx copilotkit@latest create

# bun
bunx copilotkit@latest create
```

---

## Interactive Prompts (per Documentation)

When running `create`, the CLI walks you through:

1. **Project name**: Choose an app name (e.g. `my-copilot-app`).
2. **Enterprise Intelligence Platform**:
   - Choose **Yes** to scaffold a project pre-wired for persistent threads and the inspector (the CLI prompts browser sign-up or connects to your existing account).
   - Choose **No** for a standard Agno setup without hosted Intelligence.
3. **Framework**: Pick **Agno** when prompted.

---

## Non-Interactive / Scripted Creation (Automated)

To bypass interactive prompts and run unattended:

```bash
# npm
npx copilotkit@latest init -n my-app -f agno --channel none --no-banner

# pnpm
pnpm dlx copilotkit@latest init -n my-app -f agno --channel none --no-banner

# yarn
yarn dlx copilotkit@latest init -n my-app -f agno --channel none --no-banner

# bun
bunx copilotkit@latest init -n my-app -f agno --channel none --no-banner
```

---

## Project Structure & Setup

The generated project contains:

- `.copilotkit/project.json` (project & org bookkeeping)
- `.env` with platform configuration, `INTELLIGENCE_API_KEY`, and `OPENAI_API_KEY`
- A configured agent backend and Next.js frontend

### 1. Configure Environment

Add your OpenAI API key to the agent/app `.env`:

```plaintext
OPENAI_API_KEY=your_openai_api_key
```

### 2. Install & Start Development Servers

The starter script runs both the UI and agent servers concurrently:

```bash
# npm
npm install
npm run dev

# pnpm
pnpm install
pnpm dev

# yarn
yarn install
yarn dev

# bun
bun install
bun dev
```

---

## Quick CLI Diagnostic Checks

```bash
# Check current authentication status
npx copilotkit@latest whoami

# Select or switch hosted Intelligence project
npx copilotkit@latest project select

# Issue or refresh license token
npx copilotkit@latest license --write

# List supported agent frameworks
npx copilotkit@latest framework list
```

---

---

## Automated Matrix Runner & Live Monitoring

We have built an automated test runner (`run-matrix.ts`) that executes the entire matrix non-interactively, auto-injects required environment credentials from your root `.env`, and tests runtime health probes with live terminal monitoring:

```bash
# Run full matrix across all 4 package managers
npx tsx run-matrix.ts

# Test a single package manager
npx tsx run-matrix.ts --npm
npx tsx run-matrix.ts --pnpm
npx tsx run-matrix.ts --yarn
npx tsx run-matrix.ts --bun

# Clean test directories
npx tsx run-matrix.ts --clean-only

# Live verbose stream from child processes
npx tsx run-matrix.ts --verbose
```

### Features:
- **Zero manual input**: Automatically passes `--channel none` and non-interactive flags.
- **Auto Environment Injection**: Copies `OPENAI_API_KEY`, `INTELLIGENCE_API_KEY`, and `COPILOTKIT_LICENSE_TOKEN` into scaffolded `.env` files automatically.
- **Live Terminal Dashboard**: Color-coded step timers and pass/fail summary table.
- **Dedicated Log Files**: Streams process logs to `1-cli-testing/logs/<manager>/scaffold.log` and `server.log`.
