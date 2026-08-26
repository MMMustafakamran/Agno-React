/**
 * Checks that run before anything expensive starts.
 *
 * Each one exists because it actually cost a run:
 *  - a stale server still holding a port served requests with an old API key
 *    while a freshly started one sat beside it
 *  - a placeholder OPENAI_API_KEY let every page record and fail on 401,
 *    discovered only at the end
 *  - Next.js compiles routes on demand, and the cold first hit blew the
 *    recorder's preflight timeout
 */
import { execSync } from 'node:child_process';
import path from 'node:path';
import {
  BACKEND_DIR,
  CI_DIR,
  BACKEND_PORT,
  FRONTEND_PORT,
  FRONTEND_URL,
  RUNTIME_WARM_PATH,
  WARMUP_ROUTES,
  isWindows,
} from './config.mjs';

/** PIDs currently listening on a port. Empty when the port is free. */
export function listenersOnPort(port) {
  try {
    if (isWindows) {
      const out = execSync(`netstat -ano -p tcp | findstr LISTENING | findstr :${port}`, {
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'ignore'],
      });
      const pids = out
        .split(/\r?\n/)
        .map((line) => line.trim().split(/\s+/).pop())
        .filter((pid) => pid && /^\d+$/.test(pid) && pid !== '0');
      return [...new Set(pids)];
    }
    const out = execSync(`lsof -ti tcp:${port} -sTCP:LISTEN`, {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    });
    return [...new Set(out.split(/\r?\n/).filter(Boolean))];
  } catch {
    // Non-zero exit from netstat/lsof means "nothing matched".
    return [];
  }
}

/**
 * Refuse to start on top of an already-bound port.
 *
 * Windows will happily let a second process bind a port another process is
 * already listening on, and requests then land on whichever accepts first. A
 * stale server carrying old environment variables is indistinguishable from
 * the new one, so this fails loudly instead of guessing.
 */
export function assertPortsFree({ allowReuse = false } = {}) {
  const conflicts = [];
  for (const [name, port] of [
    ['backend', BACKEND_PORT],
    ['frontend', FRONTEND_PORT],
  ]) {
    const pids = listenersOnPort(port);
    if (pids.length > 0) conflicts.push({ name, port, pids });
  }

  const busy = { backend: false, frontend: false };
  for (const c of conflicts) busy[c.name] = true;

  if (conflicts.length === 0) return busy;

  console.error('\n🔍 [Preflight] Ports already in use:');
  for (const c of conflicts) {
    console.error(`   [x] ${c.name} port ${c.port} held by PID(s): ${c.pids.join(', ')}`);
  }

  if (allowReuse) {
    console.warn(
      '   ⚠️ --allow-port-reuse given; recording against these servers and not starting new ones.\n',
    );
    return busy;
  }

  console.error(
    '\n❌ Refusing to start a second server on a busy port — a stale process may hold\n' +
      '   outdated environment variables and answer requests instead of the new one.\n' +
      '   Stop the listed PIDs, or pass --allow-port-reuse to record against them.\n',
  );
  throw new Error(`Port(s) in use: ${conflicts.map((c) => `${c.name}:${c.port}`).join(', ')}`);
}

/**
 * Confirm a usable model credential before recording anything.
 *
 * Cheap here, expensive later: without it every page records a full demo that
 * can only end in an auth error.
 */
export async function assertModelCredentials() {
  const azureEndpoint = process.env.AZURE_OPENAI_ENDPOINT;
  const openaiKey = process.env.OPENAI_API_KEY;

  if (azureEndpoint) {
    if (!process.env.AZURE_OPENAI_API_KEY) {
      throw new Error('AZURE_OPENAI_ENDPOINT is set but AZURE_OPENAI_API_KEY is missing.');
    }
    console.log('✅ [Preflight] Azure OpenAI credentials present (not verified live).');
    return;
  }

  if (!openaiKey || openaiKey.trim() === '' || openaiKey.trim() === 'sk-...') {
    throw new Error(
      'OPENAI_API_KEY is missing or still the .env.example placeholder ("sk-...").\n' +
        'Set a real key in backend/.env or the repo-root .env before recording.',
    );
  }

  process.stdout.write('⏳ [Preflight] Verifying model credentials... ');
  try {
    const res = await fetch('https://api.openai.com/v1/models', {
      headers: { Authorization: `Bearer ${openaiKey}` },
      signal: AbortSignal.timeout(20000),
    });
    if (res.status === 401 || res.status === 403) {
      process.stdout.write('❌\n');
      throw new Error(`OPENAI_API_KEY rejected by OpenAI (HTTP ${res.status}).`);
    }
    if (!res.ok) {
      // Rate limits or transient 5xx are not a reason to block a run.
      process.stdout.write(`⚠️ inconclusive (HTTP ${res.status}); continuing.\n`);
      return;
    }
    process.stdout.write('✅ valid\n');
  } catch (err) {
    if (err instanceof Error && /rejected by OpenAI/.test(err.message)) throw err;
    process.stdout.write('⚠️ could not reach OpenAI; continuing.\n');
  }
}

/**
 * Confirm the *backend* can reach OpenAI, using its own Python environment.
 *
 * `assertModelCredentials` above proves the key is good, but it proves it from
 * Node. The agent calls OpenAI from Python, and those are different resolvers,
 * TLS stacks and connection paths. A CI run has already gone green through
 * every check here and then failed inside the demo with
 *
 *   ERROR  API connection error from OpenAI API: Connection error.
 *
 * — Node reached OpenAI, Python did not, in the same job. That cost 78 seconds
 * and produced a broken video instead of an error. This check runs the same
 * client the agent uses, so the failure surfaces in seconds and names itself.
 *
 * Must run after `uv sync`; the environment does not exist before that.
 */
export function assertBackendCanReachModel({ attempts = 2 } = {}) {
  // The probe is a file, not an inlined `python -c` string. A multi-line -c
  // argument does not survive the shell: the command silently half-runs and
  // exits 0, so the check reported "reachable" without ever contacting OpenAI.
  // A false green here is worse than no check at all.
  const probePath = path.join(CI_DIR, 'lib', 'probe-openai.py');

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    process.stdout.write(
      `⏳ [Preflight] Backend → OpenAI reachability (attempt ${attempt}/${attempts})... `,
    );
    try {
      const out = execSync(`uv run --prerelease=allow python "${probePath}"`, {
        cwd: BACKEND_DIR,
        stdio: ['ignore', 'pipe', 'pipe'],
        encoding: 'utf8',
      });
      // Belt and braces: only the probe's own success token counts.
      if (!out.includes('OK')) {
        throw Object.assign(new Error('probe produced no result'), {
          stderr: 'probe did not run to completion',
        });
      }
      process.stdout.write('✅ reachable\n');
      return;
    } catch (err) {
      const detail = (err.stderr || '').trim().split('\n').pop() || 'unknown error';
      process.stdout.write(`❌ ${detail}\n`);
      if (attempt === attempts) {
        throw new Error(
          `The backend cannot reach OpenAI from its own Python environment: ${detail}\n` +
            'Every recorded demo would fail with "Agent never produced a response".\n' +
            'Node reaching OpenAI is not sufficient — the agent calls it from Python.',
        );
      }
    }
  }
}

/**
 * Compile the heaviest routes before the recorder's own preflight runs, so a
 * cold Turbopack build is not mistaken for a dead frontend.
 */
export async function warmFrontendRoutes(timeoutMs = 180000) {
  for (const route of WARMUP_ROUTES) {
    const url = `${FRONTEND_URL}${route}`;
    process.stdout.write(`⏳ [Warmup] ${route} ... `);
    const started = Date.now();
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(timeoutMs) });
      const secs = ((Date.now() - started) / 1000).toFixed(1);
      process.stdout.write(`${res.ok ? '✅' : `⚠️ HTTP ${res.status}`} (${secs}s)\n`);
    } catch {
      process.stdout.write('⚠️ timed out; recorder may hit a cold compile.\n');
    }
  }
}

/**
 * Compile the runtime endpoint too. The page being ready does not mean the API
 * route behind it is; the first POST would otherwise pay the compile and the
 * recorder would report that the agent never replied.
 */
export async function warmRuntimeEndpoint(timeoutMs = 120000) {
  if (!RUNTIME_WARM_PATH) return;
  const url = `${FRONTEND_URL}${RUNTIME_WARM_PATH}`;
  process.stdout.write(`🔥 [Warmup] ${RUNTIME_WARM_PATH} ... `);
  try {
    // A GET against a POST-only route answers 405. That is a compiled route.
    await fetch(url, { signal: AbortSignal.timeout(timeoutMs) });
    process.stdout.write('✅ compiled\n');
  } catch {
    process.stdout.write('⚠️ no answer; first prompt may pay the compile.\n');
  }
}
