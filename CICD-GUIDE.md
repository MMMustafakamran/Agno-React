# Agno CI/CD Transformation & Troubleshooting Guide

> **Target Audience:** AI Agents & Engineers maintaining or porting the CopilotKit / Agno integration repository into an automated, sharded CI/CD daily recording pipeline.
> **Design Goal:** Token-efficient, dense, high-signal actionable blueprint and pitfall reference.

---

## 1. Target Architecture & Components

```
                        GitHub Actions Matrix (3 Parallel Workers)
 ┌─────────────────────────────────┬─────────────────────────────────┬─────────────────────────────────┐
 │ Worker 1/3 (Pages 1-6)          │ Worker 2/3 (Pages 7-12)         │ Worker 3/3 (Pages 13-17)        │
 │ [xvfb-run 1920x1080 display]    │ [xvfb-run 1920x1080 display]    │ [xvfb-run 1920x1080 display]    │
 │  ├── Backend Agno (:8000)       │  ├── Backend Agno (:8000)       │  ├── Backend Agno (:8000)       │
 │  ├── Frontend Next.js (:3000)   │  ├── Frontend Next.js (:3000)   │  ├── Frontend Next.js (:3000)   │
 │  └── Playwright Recorder        │  └── Playwright Recorder        │  └── Playwright Recorder        │
 └────────────────┬────────────────┴────────────────┬────────────────┴────────────────┬────────────────┘
                  │                                 │                                 │
                  └─────────────────────────────────┼─────────────────────────────────┘
                                                    ▼
                             Downstream Merge Job: `consolidate-recordings`
                             Combines all *.webm + RUN_REPORT into 1 unified ZIP
```

---

## 2. Porting Checklist (Core Files)

When maintaining or porting this Agno repository, ensure these core components are in place:

1. **`ci/check-doc-drift.mjs`**: Standalone live doc hash verifier against `doc-snapshot/manifest.json`.
2. **`ci/automate.mjs`**: Single-process Node orchestrator (starts Agno backend & Next.js frontend, polls health, drives recorder, cleans up processes, outputs `RUN_REPORT.md`/`json`).
3. **`autorecorder/cli.ts`**: Supports `--shard=K/N`, `--only=...`, `--pages=...`, and `--limit=N` CLI flags with empty shard exit guards.
4. **`.github/workflows/daily-recorder.yml`**: Matrix workflow (3 workers) with `xvfb-run`, interactive page checkboxes (17 pages), and artifact consolidation.
5. **`package.json`**: Root convenience runner (`npm run automate`, `npm run record:list`, `npm run record:doctor`).
6. **`automate.bat`**: Windows single-command batch launcher.

---

## 3. Core Implementation Blueprints

### Blueprint A: Single-Process Orchestrator (`ci/automate.mjs`)
* **Why:** In GitHub Actions, each YAML `run:` step executes in a separate subshell. Launching background daemons in separate steps causes them to be killed by the runner's process reaper when the step completes.
* **Solution:** Spawn backend and frontend within a single persistent Node process:
```javascript
// Spawn with process group isolation
const backend = spawn('uv run --prerelease=allow main.py', {
  cwd: path.join(ROOT, 'backend'),
  stdio: 'ignore',
  shell: true,
  detached: process.platform !== 'win32',
});

// Teardown hook: Taskkill on Win32, process group kill on POSIX
function killTree(proc) {
  if (!proc?.pid) return;
  try {
    process.platform === 'win32'
      ? execSync(`taskkill /pid ${proc.pid} /T /F 2>nul || exit 0`, { stdio: 'ignore' })
      : process.kill(-proc.pid, 'SIGTERM');
  } catch {
    proc.kill('SIGTERM');
  }
}
```

### Blueprint B: CLI Matrix Sharding (`autorecorder/cli.ts`)
```typescript
const shardMatch = rawArgs.find((a) => a.startsWith('--shard='));
if (shardMatch) {
  const [curr, total] = shardMatch.split('=')[1].split('/').map((n) => parseInt(n, 10));
  if (total > 0 && curr > 0 && curr <= total) {
    const chunkSize = Math.ceil(targetPages.length / total);
    const start = (curr - 1) * chunkSize;
    targetPages = targetPages.slice(start, Math.min(start + chunkSize, targetPages.length));
  }
}

// CRITICAL: Exit 0 if shard receives 0 pages (e.g. 1 page selected across 3 workers)
if (targetPages.length === 0) {
  if (shardMatch) {
    console.log('ℹ️ No pages assigned to this shard. Exiting cleanly.');
    process.exit(0);
  }
  process.exit(1);
}
```

### Blueprint C: GitHub Actions Matrix & Merge Strategy
```yaml
jobs:
  record-workers:
    name: Worker ${{ matrix.shard }}/3
    runs-on: ubuntu-latest
    strategy:
      fail-fast: false
      matrix: { shard: [1, 2, 3] }
    steps:
      - uses: actions/checkout@v4
      - uses: astral-sh/setup-uv@v5
      - uses: actions/setup-node@v4
        with: { node-version: 22 }
      - run: cd autorecorder && npm install && npx playwright install --with-deps chromium
      - run: xvfb-run --auto-servernum --server-args="-screen 0 1920x1080x24" node ci/automate.mjs --shard=${{ matrix.shard }}/3
      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: demo-recordings-shard-${{ matrix.shard }}
          path: autorecorder/videos/*

  consolidate-recordings:
    name: Consolidate & Merge All Video Artifacts
    needs: record-workers
    if: always()
    runs-on: ubuntu-latest
    steps:
      - uses: actions/download-artifact@v4
        with: { path: all-recordings, pattern: demo-recordings-shard-*, merge-multiple: true }
      - uses: actions/upload-artifact@v4
        with: { name: demo-recordings-all-${{ github.sha }}, path: all-recordings/ }
```

---

## 4. Post-Mortem Pitfalls & Lessons Learned

| # | Pitfall Encountered | Root Cause | Permanent Rule / Fix |
|---|---|---|---|
| **1** | **Headless Linux Display Crash** | `browserType.launch({ headless: false })` crashes on Ubuntu CI with `Missing X server or $DISPLAY`. | **Always** wrap CLI execution in CI with `xvfb-run --auto-servernum --server-args="-screen 0 1920x1080x24"`. |
| **2** | **Child Process Pipe Buffer Freeze** | Spawning backend/frontend via Node with `stdio: 'pipe'` freezes on Windows/Linux when the OS buffer fills up. | Set `stdio: 'ignore'` on spawned server daemons unless actively draining output streams. |
| **3** | **Agno AgentOS Health Endpoint** | Agno AgentOS mounts at `/agui` and `/status` (not `/health`). | Polling in `diagnostics.ts` and `automate.mjs` checks `/status` with fallback to `/docs` and `/`. |
| **4** | **CRLF vs LF Hash Drift** | Windows checkout converts git line endings to CRLF (`\r\n`), causing false-positive doc drift against Linux baselines. | Strip BOM (`/^\uFEFF/`) and normalize `\r\n` $\rightarrow$ `\n` before computing SHA256 hashes. |
| **5** | **Empty Shard Failure** | When running with fewer pages than workers (e.g. 1 page with 3 workers), Shards 2 and 3 receive 0 pages and error out. | Add guard: `if (targetPages.length === 0 && isShard) process.exit(0)`. |
| **6** | **Doctor Range Drift** | Updating frontend files changes line numbers, failing static adaptation checks in `pages.config.ts`. | Run `npm run record:doctor` to verify highlighted line numbers match actual file content boundaries. |
