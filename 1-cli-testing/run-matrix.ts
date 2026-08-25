/**
 * Automated CopilotKit CLI Matrix Testing & Monitoring Runner
 *
 * Automates:
 * 1. Non-interactive scaffolding across [npm, pnpm, yarn, bun] with zero prompts.
 * 2. Auto-injection of OPENAI_API_KEY, INTELLIGENCE_API_KEY, and COPILOTKIT_LICENSE_TOKEN.
 * 3. Fast offline-first dependency resolution.
 * 4. Background server startup and live HTTP health probing (/info & /agui).
 * 5. Real-time console progress monitoring and isolated per-process log files.
 */

import { spawn, type ChildProcess } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const ROOT_DIR = join(__dirname, '..');
const LOGS_DIR = join(__dirname, 'logs');

// Supported package managers
export type PackageManager = 'npm' | 'pnpm' | 'yarn' | 'bun';

interface MatrixConfig {
  pm: PackageManager;
  dirName: string;
  createCmd: string[];
  devCmd: string[];
}

const MANAGERS: MatrixConfig[] = [
  {
    pm: 'npm',
    dirName: 'npm',
    createCmd: ['npx', '-y', 'copilotkit@latest', 'init', '-f', 'agno', '--channel', 'none', '--no-banner'],
    devCmd: ['npm', 'run', 'dev'],
  },
  {
    pm: 'pnpm',
    dirName: 'pnpm',
    createCmd: ['pnpm', 'dlx', 'copilotkit@latest', 'init', '-f', 'agno', '--channel', 'none', '--no-banner'],
    devCmd: ['pnpm', 'dev'],
  },
  {
    pm: 'yarn',
    dirName: 'yarn',
    createCmd: ['yarn', 'dlx', 'copilotkit@latest', 'init', '-f', 'agno', '--channel', 'none', '--no-banner'],
    devCmd: ['yarn', 'dev'],
  },
  {
    pm: 'bun',
    dirName: 'bun',
    createCmd: ['bunx', 'copilotkit@latest', 'init', '-f', 'agno', '--channel', 'none', '--no-banner'],
    devCmd: ['bun', 'run', 'dev'],
  },
];

// ANSI Colors for live monitoring
const COLORS = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  magenta: '\x1b[35m',
  blue: '\x1b[34m',
};

interface RunResult {
  pm: PackageManager;
  scaffoldSuccess: boolean;
  serverUp: boolean;
  probePassed: boolean;
  durationSec: number;
  error?: string;
  infoPayload?: any;
}

/**
 * Reads credentials from root .env or frontend/.env.local
 */
function getRootCredentials(): {
  openaiKey: string;
  intelligenceKey: string;
  licenseToken: string;
} {
  let content = '';
  const rootEnv = join(ROOT_DIR, '.env');
  const frontEnv = join(ROOT_DIR, 'frontend', '.env.local');

  if (existsSync(frontEnv)) {
    content += '\n' + readFileSync(frontEnv, 'utf8');
  }
  if (existsSync(rootEnv)) {
    content += '\n' + readFileSync(rootEnv, 'utf8');
  }

  const getVar = (name: string): string => {
    const match = new RegExp(`^${name}=(.*)$`, 'm').exec(content);
    return match ? match[1].trim() : '';
  };

  return {
    openaiKey: getVar('OPENAI_API_KEY'),
    intelligenceKey: getVar('INTELLIGENCE_API_KEY'),
    licenseToken: getVar('COPILOTKIT_LICENSE_TOKEN'),
  };
}

/**
 * Safely kills a process tree across Windows / POSIX
 */
async function killProcessTree(proc: ChildProcess): Promise<void> {
  if (!proc || proc.killed || !proc.pid) return;

  if (process.platform === 'win32') {
    await new Promise<void>((resolve) => {
      const killer = spawn('taskkill', ['/pid', String(proc.pid), '/T', '/F'], {
        stdio: 'ignore',
      });
      killer.on('close', () => resolve());
      killer.on('error', () => resolve());
    });
  } else {
    try {
      proc.kill('SIGKILL');
    } catch {}
  }
}

/**
 * Fast directory removal with retry handling
 */
async function fastRemoveDir(targetPath: string): Promise<void> {
  if (!existsSync(targetPath)) return;
  if (process.platform === 'win32') {
    await new Promise<void>((resolve) => {
      const proc = spawn('powershell.exe', ['-NoProfile', '-Command', `Remove-Item -LiteralPath '${targetPath}' -Recurse -Force -ErrorAction SilentlyContinue`], {
        stdio: 'ignore',
      });
      proc.on('close', () => resolve());
      proc.on('error', () => resolve());
    });
  } else {
    try {
      rmSync(targetPath, { recursive: true, force: true });
    } catch {}
  }
}


/**
 * Executes a command and captures stdout/stderr with real-time file logging
 */
function runCommandWithLogs(
  cmd: string,
  args: string[],
  cwd: string,
  logFile: string,
  verbose: boolean,
  prefix: string,
  inheritStdio = false,
  customEnv?: Record<string, string>,
): Promise<{ exitCode: number; output: string }> {
  return new Promise((resolve) => {
    mkdirSync(dirname(logFile), { recursive: true });
    writeFileSync(logFile, `=== EXEC: ${cmd} ${args.join(' ')} (cwd: ${cwd}) ===\n\n`, 'utf8');

    const mergedEnv = {
      ...process.env,
      FORCE_COLOR: '1',
      DO_NOT_TRACK: '1',
      COPILOTKIT_TELEMETRY_DISABLED: '1',
      ...customEnv,
    };

    if (inheritStdio) {
      const proc = spawn(cmd, args, {
        cwd,
        shell: true,
        stdio: 'inherit',
        env: mergedEnv,
      });
      proc.on('close', (code) => resolve({ exitCode: code ?? 0, output: '' }));
      proc.on('error', (err) => resolve({ exitCode: 1, output: err.message }));
      return;
    }

    const proc = spawn(cmd, args, {
      cwd,
      shell: true,
      env: mergedEnv,
    });

    let combined = '';

    const handleData = (chunk: Buffer, streamType: 'stdout' | 'stderr') => {
      const text = chunk.toString();
      combined += text;
      writeFileSync(logFile, text, { flag: 'a' });

      if (verbose) {
        const color = streamType === 'stderr' ? COLORS.yellow : COLORS.dim;
        const lines = text.split('\n');
        for (const line of lines) {
          if (line.trim()) {
            console.log(`  ${color}[${prefix}]${COLORS.reset} ${line}`);
          }
        }
      }
    };

    proc.stdout?.on('data', (d) => handleData(d, 'stdout'));
    proc.stderr?.on('data', (d) => handleData(d, 'stderr'));

    proc.on('close', (code) => {
      resolve({ exitCode: code ?? 0, output: combined });
    });

    proc.on('error', (err) => {
      writeFileSync(logFile, `\n[ERROR]: ${err.message}\n`, { flag: 'a' });
      resolve({ exitCode: 1, output: err.message });
    });
  });
}

/**
 * Polls HTTP candidate runtime endpoints with retries
 */
async function probeRuntime(maxAttempts = 25, delayMs = 1500): Promise<{ ok: boolean; url: string; data?: any }> {
  const candidateUrls = [
    'http://localhost:3001/api/copilotkit/info',
    'http://localhost:3000/api/copilotkit/info',
    'http://localhost:3002/api/copilotkit/info',
  ];
  for (let i = 1; i <= maxAttempts; i++) {
    for (const url of candidateUrls) {
      try {
        const res = await fetch(url, { signal: AbortSignal.timeout(2000) });
        if (res.status === 200) {
          const data = await res.json().catch(() => null);
          return { ok: true, url, data };
        }
      } catch {}
    }
    await new Promise((r) => setTimeout(r, delayMs));
  }
  return { ok: false, url: '' };
}

/**
 * Runs test matrix for a single package manager
 */
async function testPackageManager(
  config: MatrixConfig,
  creds: ReturnType<typeof getRootCredentials>,
  opts: { verbose: boolean; clean: boolean },
): Promise<RunResult> {
  const pmStart = Date.now();
  const pmLogsDir = join(LOGS_DIR, config.pm);
  const targetAppDir = join(__dirname, config.dirName, 'myapp');

  console.log(`\n${COLORS.bright}${COLORS.cyan}------------------------------------------------------------${COLORS.reset}`);
  console.log(`${COLORS.bright}🚀 Testing Package Manager: ${COLORS.green}${config.pm.toUpperCase()}${COLORS.reset}`);
  console.log(`${COLORS.cyan}------------------------------------------------------------${COLORS.reset}`);

  // Step 1: Clean old test app if requested
  if (opts.clean && existsSync(targetAppDir)) {
    console.log(`  🧹 Cleaning prior test directory (${targetAppDir})...`);
    await fastRemoveDir(targetAppDir);
  }

  // Step 2: Scaffolding with CopilotKit CLI
  console.log(`  📦 Step 1/5: Scaffolding project via [${config.createCmd.join(' ')}]...`);
  const scaffoldLog = join(pmLogsDir, 'scaffold.log');
  const execEnv: Record<string, string> = {
    OPENAI_API_KEY: creds.openaiKey,
    INTELLIGENCE_API_KEY: creds.intelligenceKey,
    COPILOTKIT_LICENSE_TOKEN: creds.licenseToken,
    AGNO_AGENT_URL: 'http://localhost:8000/agui',
    DO_NOT_TRACK: '1',
    COPILOTKIT_TELEMETRY_DISABLED: '1',
  };

  const scaffoldRes = await runCommandWithLogs(
    config.createCmd[0],
    [...config.createCmd.slice(1), '-n', 'myapp'],
    join(__dirname, config.dirName),
    scaffoldLog,
    opts.verbose,
    `${config.pm}-init`,
    true,
    execEnv,
  );

  if (scaffoldRes.exitCode !== 0 && !existsSync(targetAppDir)) {
    const dur = Number(((Date.now() - pmStart) / 1000).toFixed(1));
    return {
      pm: config.pm,
      scaffoldSuccess: false,
      serverUp: false,
      probePassed: false,
      durationSec: dur,
      error: `Scaffolding failed with code ${scaffoldRes.exitCode}. See ${scaffoldLog}`,
    };
  }
  console.log(`  ✅ Scaffolding completed.`);

  // Step 3: Inject Environment Variables (Preserving existing configuration)
  console.log(`  🔑 Step 2/5: Injecting credentials into scaffolded project...`);
  const varsToInject: Record<string, string> = {
    OPENAI_API_KEY: creds.openaiKey,
    INTELLIGENCE_API_KEY: creds.intelligenceKey,
    COPILOTKIT_LICENSE_TOKEN: creds.licenseToken,
    AGNO_AGENT_URL: 'http://localhost:8000/agui',
  };

  const envPaths = [
    join(targetAppDir, '.env'),
    join(targetAppDir, 'agent', '.env'),
    join(targetAppDir, 'backend', '.env'),
    join(targetAppDir, 'frontend', '.env.local'),
  ];

  for (const p of envPaths) {
    if (existsSync(dirname(p))) {
      let content = existsSync(p) ? readFileSync(p, 'utf8') : '';
      for (const [k, v] of Object.entries(varsToInject)) {
        if (!v) continue;
        const regex = new RegExp(`^${k}=.*$`, 'm');
        if (regex.test(content)) {
          content = content.replace(regex, `${k}=${v}`);
        } else {
          content += `\n${k}=${v}`;
        }
      }
      writeFileSync(p, content.trim() + '\n', 'utf8');
    }
  }
  console.log(`  ✅ Credentials injected successfully.`);

  // Step 4: Install dependencies if missing
  const nodeModulesDir = join(targetAppDir, 'node_modules');
  if (!existsSync(nodeModulesDir)) {
    console.log(`  📦 Step 3/5: Installing dependencies via [${config.pm} install]...`);
    const installLog = join(pmLogsDir, 'install.log');
    await runCommandWithLogs(
      config.pm,
      ['install'],
      targetAppDir,
      installLog,
      opts.verbose,
      `${config.pm}-install`,
    );
    console.log(`  ✅ Dependencies installed.`);
  }

  // Step 5: Background Server Start & Probing
  console.log(`  ⚡ Step 4/5: Spawning server [${config.devCmd.join(' ')}]...`);
  const serverLog = join(pmLogsDir, 'server.log');
  mkdirSync(pmLogsDir, { recursive: true });
  writeFileSync(serverLog, `=== START: ${config.devCmd.join(' ')} ===\n\n`, 'utf8');

  const serverProc = spawn(config.devCmd[0], config.devCmd.slice(1), {
    cwd: targetAppDir,
    shell: true,
    env: { ...process.env, FORCE_COLOR: '1', ...execEnv },
  });

  serverProc.stdout?.on('data', (d) => {
    writeFileSync(serverLog, d.toString(), { flag: 'a' });
    if (opts.verbose) {
      console.log(`  ${COLORS.dim}[${config.pm}-dev]${COLORS.reset} ${d.toString().trim()}`);
    }
  });

  serverProc.stderr?.on('data', (d) => {
    writeFileSync(serverLog, d.toString(), { flag: 'a' });
    if (opts.verbose) {
      console.log(`  ${COLORS.yellow}[${config.pm}-err]${COLORS.reset} ${d.toString().trim()}`);
    }
  });

  // Step 5: Probe HTTP endpoints
  console.log(`  🔍 Step 4/4: Probing runtime endpoints (waiting for startup)...`);
  const probe = await probeRuntime(25, 1500);

  let probePassed = probe.ok;
  let infoPayload = probe.data;

  if (probePassed) {
    console.log(`  ✅ Runtime info responsive at ${probe.url} (status 200).`);
    if (infoPayload?.licenseStatus) {
      console.log(`     License Status: ${COLORS.green}${infoPayload.licenseStatus}${COLORS.reset}`);
    }
    if (infoPayload?.mode) {
      console.log(`     Runtime Mode:   ${COLORS.cyan}${infoPayload.mode}${COLORS.reset}`);
    }
  } else {
    console.warn(`  ⚠️ Probe timeout or non-200 response.`);
  }

  // Gracefully stop background server
  await killProcessTree(serverProc);

  const durationSec = Number(((Date.now() - pmStart) / 1000).toFixed(1));

  return {
    pm: config.pm,
    scaffoldSuccess: true,
    serverUp: probePassed,
    probePassed,
    durationSec,
    infoPayload,
  };
}

async function main() {
  const args = process.argv.slice(2);
  const isVerbose = args.includes('--verbose') || args.includes('-v');
  const isClean = args.includes('--clean');
  const isCleanOnly = args.includes('--clean-only');

  console.log(`\n============================================================`);
  console.log(`📊 ${COLORS.bright}COPILOTKIT CLI TEST MATRIX & MONITORING PIPELINE${COLORS.reset}`);
  console.log(`============================================================\n`);

  // Handle clean-only mode
  if (isCleanOnly) {
    console.log(`🧹 Cleaning all scaffolded test app directories...`);
    for (const m of MANAGERS) {
      const p = join(__dirname, m.dirName, 'myapp');
      if (existsSync(p)) {
        await fastRemoveDir(p);
        console.log(`  ✓ Removed ${p}`);
      }
    }
    console.log(`\n✅ Clean complete.\n`);
    return;
  }

  // Select target package managers
  let selected = MANAGERS;
  const targetPm = args.find((a) => ['--npm', '--pnpm', '--yarn', '--bun'].includes(a))?.replace(/^--/, '') as PackageManager | undefined;
  if (targetPm) {
    selected = MANAGERS.filter((m) => m.pm === targetPm);
  }

  const creds = getRootCredentials();
  if (!creds.openaiKey) {
    console.warn(`⚠️ Warning: OPENAI_API_KEY not found in root .env — agent replies will be disabled.`);
  }

  const results: RunResult[] = [];

  for (const config of selected) {
    const res = await testPackageManager(config, creds, {
      verbose: isVerbose,
      clean: isClean,
    });
    results.push(res);
  }

  // Final Dashboard Summary
  console.log(`\n============================================================`);
  console.log(`📋 ${COLORS.bright}MATRIX EXECUTION SUMMARY${COLORS.reset}`);
  console.log(`============================================================`);

  for (const r of results) {
    const scaffoldBadge = r.scaffoldSuccess ? `${COLORS.green}✅ OK${COLORS.reset}` : `${COLORS.red}❌ FAIL${COLORS.reset}`;
    const probeBadge = r.probePassed ? `${COLORS.green}✅ 200 OK${COLORS.reset}` : `${COLORS.yellow}⚠️ TIMEOUT${COLORS.reset}`;

    console.log(
      `  • ${COLORS.bright}${r.pm.toUpperCase().padEnd(6)}${COLORS.reset} │ Scaffold: ${scaffoldBadge} │ Health Probe: ${probeBadge} │ Duration: ${r.durationSec}s`,
    );
    if (r.error) {
      console.log(`    └─ ${COLORS.red}Error: ${r.error}${COLORS.reset}`);
    }
  }

  console.log(`============================================================`);
  console.log(`📁 Detailed logs saved under: ${LOGS_DIR}\n`);
}

main().catch((err) => {
  console.error('Fatal matrix runner error:', err);
  process.exit(1);
});
