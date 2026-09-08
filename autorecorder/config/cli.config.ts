/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  ADAPT THIS FILE — 4 of 4
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * This framework's command-line flows: the scaffolding CLI and the installs
 * that follow it, each driven through a real terminal and captured to a cast
 * file that the recorder later replays on camera.
 *
 * Adapting means rewriting the prompts below to match *this* framework's CLI.
 * Every CopilotKit repo runs the same `copilotkit create`, but the answers
 * differ — the framework row, the Intelligence project, whether a chat-channel
 * prompt appears at all — and some frameworks' quickstarts use a different tool
 * entirely.
 *
 * ── The one rule ───────────────────────────────────────────────────────────
 * Name rows, do not count them. `select: { label: '...' }` walks the list until
 * the highlight is on that row. The alternative — "press Down sixteen times" —
 * works until the CLI adds a menu entry, and then it scaffolds the wrong
 * framework while reporting success. The framework list has 23 entries today
 * and grows with every integration CopilotKit ships.
 *
 * ── Before the first run ───────────────────────────────────────────────────
 * `npm run capture -- --login` once. Sign-in opens a browser and cannot be
 * automated; doing it up front turns the mid-run auth pause into a precondition
 * and makes everything after it deterministic. It is also why these flows are
 * local-only and are not part of CI.
 *
 * ── Status of the prompts encoded here ─────────────────────────────────────
 * PREDICTED, not observed. The real CLI has never been run in this repo. Every
 * step below is carried over from the reference implementation's real Microsoft
 * Agent Framework (Python) run, adjusted for what
 * `npx copilotkit@latest framework list` reports about `agno` — it accepts
 * `-i`, `--mock` and `--channel`, so the Intelligence and chat-platform prompts
 * both apply here, and it reads `OPENAI_API_KEY`. `1-cli-testing/CLI-FLOW.md`
 * says which steps are predicted and which are confirmed; update both files
 * from the first real run.
 */
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { type DistributionConfig } from '../core/cli/distribute';
import { defineCliFlows, defineCliVideos } from '../core/cli/flow';

/** Names the generated app and its directory. Lowercase, digits, hyphens, ≤30. */
const APP_NAME = 'app';

/**
 * A pnpm config directory of its own, so the recorded install is the one a
 * reader gets rather than the one this machine has been talked into.
 *
 * `pnpm approve-builds` does not only write `pnpm-workspace.yaml` into the app
 * — it also records the approval in pnpm's *global* config. Run the pipeline
 * once and the machine now trusts @scarf/scarf, esbuild and sharp everywhere,
 * so the next `pnpm install` exits 0 and the ignored-builds failure the clip
 * exists to show quietly stops reproducing. The footage would then say the
 * quickstart works, on the strength of a decision made off camera in an
 * earlier run.
 *
 * Pointing XDG_CONFIG_HOME at a scratch directory gives every capture the
 * empty global config a first-time reader has. The package store is not read
 * from here, so this costs nothing but the isolation.
 */
const PNPM_CONFIG_HOME = join(tmpdir(), 'copilotkit-cli-pnpm-config');

/**
 * The row to select in `Select agent framework`.
 *
 * Must match this repo's backend. Matched as a case-insensitive substring, so
 * it needs to be unique in the list. 'Agno' is: checked against all 23 rows of
 * `npx copilotkit@latest framework list` on 2026-09-04, it appears in the
 * `agno` row and nowhere else. (The near misses to watch as the list grows are
 * 'AG2', 'A2A' and the two 'AgentCore + …' rows — none of them contain it.)
 */
const FRAMEWORK_ROW = 'Agno';

/**
 * Existing CopilotKit Intelligence project to bind the app to.
 *
 * This account's Agno project — `projectSlug` in
 * [.copilotkit/project.json](../../.copilotkit/project.json), id 1559.
 */
const INTELLIGENCE_PROJECT = 'myapp1';

/** Where the CLI runs, relative to the repo root. The app lands inside it. */
const SCAFFOLD_DIR = '1-cli-testing';

/**
 * The quickstart tab that tells a reader to run the CLI.
 *
 * Agno's quickstart splits into "Start from scratch" and "Use an existing
 * agent"; only the first contains `npx copilotkit@latest create`, so the clip
 * has to deep-link to it or it opens on a page that never mentions the command
 * being recorded.
 */
const CLI_DOC_PATH = 'quickstart?agent=starter';

/**
 * The sign-in window, which is a person noticing a browser tab and typing a
 * password — not a machine doing something slow.
 *
 * Six minutes proved too short in practice in the reference repo: the run died
 * while the operator was still signing in, and a timeout there reads as
 * "sign-in failed" when nothing failed at all. This is the one step whose limit
 * should be set by human attention rather than by how long the work takes.
 */
const LOGIN_TIMEOUT_MS = 15 * 60_000;

/** Package managers the scaffold is installed with, one flow each. */
const PACKAGE_MANAGERS: readonly { id: string; command: string }[] = [
  { id: 'npm', command: 'npm' },
  { id: 'pnpm', command: 'pnpm' },
  { id: 'yarn', command: 'yarn' },
  { id: 'bun', command: 'bun' },
] as const;

/**
 * One scaffold, copied into four directories, with the model key seeded in.
 *
 * The CLI runs once. Running it four times would make the scaffold itself a
 * variable in a test whose only subject is the install, so a difference between
 * managers could not be attributed to the manager.
 *
 * The key is seeded here rather than typed into the CLI: the scaffold is created
 * without one on purpose, so no recording ever contains a secret, and placing it
 * once before the copy means it cannot be typo'd into three directories of four.
 */
export const CLI_DISTRIBUTION: DistributionConfig = {
  source: `${SCAFFOLD_DIR}/${APP_NAME}`,
  targets: PACKAGE_MANAGERS.map((pm) => `${SCAFFOLD_DIR}/${pm.id}/${APP_NAME}`),
  exclude: ['node_modules', '.next', '.git', '.turbo'],
  envFiles: [
    // The repo root .env is the one with a real OPENAI_API_KEY in it — the key
    // `framework list` says `agno` reads. Both destinations are needed: the Next
    // app reads the first, and Agno's starter ships a Python agent (`agent/`,
    // run through `uv`) that reads the second.
    { from: '.env', to: '.env' },
    { from: '.env', to: 'agent/.env' },
  ],
};

export const CLI_FLOWS = defineCliFlows([
  {
    id: 'login',
    name: 'CopilotKit CLI — sign in',
    castName: 'Login',
    cwd: '.',
    command: 'npx',
    args: ['copilotkit@latest', 'login'],
    // Manual because it hands off to a browser: the operator finishes the round
    // trip, and nothing here can wait on that meaningfully. Run it once, then
    // the scaffold flow needs no human at all.
    manual: true,
    timeoutMs: LOGIN_TIMEOUT_MS,
    stepTimeoutMs: LOGIN_TIMEOUT_MS,
    steps: [
      {
        // `login` does not open the browser until this is acknowledged. Without
        // the keypress it sits on the prompt until the timeout, which reads as
        // "sign-in never completed" when in fact it never started.
        label: 'Acknowledge browser hand-off',
        waitFor: /Press Enter to continue/i,
        keys: ['Enter'],
        timeoutMs: 60_000,
      },
    ],
    // Nothing on disk to assert: the session is cached wherever the CLI keeps
    // it, and the proof it worked is the scaffold no longer pausing for auth.
    expectFiles: [],
  },

  {
    id: 'scaffold',
    name: 'CopilotKit CLI — create app',
    castName: 'Scaffold',
    docPath: CLI_DOC_PATH,
    cwd: SCAFFOLD_DIR,
    command: 'npx',
    // `--project` names the Intelligence project instead of showing the picker.
    //
    // Not a shortcut for its own sake: with a valid CLI session already saved,
    // the interactive picker still sat on "Verifying authentication…" until the
    // step timed out, twice, in the reference repo, on a network where
    // `copilotkit project list` answers instantly. Naming the project skips the
    // step that hangs and leaves every other prompt interactive and driven.
    args: ['copilotkit@latest', 'create', '--project', INTELLIGENCE_PROJECT],
    cols: 120,
    rows: 32,
    timeoutMs: 12 * 60_000,
    // The scaffold clones a template over the network, and that fails in ways
    // the CLI reports and then stops making progress on. Naming those here
    // turns a six-minute wait for a prompt that is never coming into an
    // immediate failure that quotes the actual error.
    abortOn: [/Init failed/i, /fatal: /i, /RPC failed/i],
    // Git's default HTTP/2 transport is what produced
    // "schannel: server closed abruptly" on this network. Scoped to this
    // command's children via git's own env-var config, so nothing global
    // changes for the machine.
    env: {
      GIT_CONFIG_COUNT: '1',
      GIT_CONFIG_KEY_0: 'http.version',
      GIT_CONFIG_VALUE_0: 'HTTP/1.1',
    },
    steps: [
      {
        // npx's own prompt, not CopilotKit's — it appears only when the package
        // is not already cached. Optional, so a second run does not fail here,
        // and so the `y` is never typed into whatever prompt came instead.
        label: 'npx package install',
        waitFor: /Ok to proceed/i,
        optional: true,
        timeoutMs: 45_000,
        type: 'y',
        keys: ['Enter'],
      },
      {
        label: 'App name',
        waitFor: /App name/i,
        timeoutMs: 120_000,
        type: APP_NAME,
        keys: ['Enter'],
        settleMs: 600,
      },
      {
        label: 'Agent framework',
        waitFor: /Select agent framework/i,
        select: { label: FRAMEWORK_ROW, max: 40 },
        keys: ['Enter'],
        settleMs: 600,
      },
      {
        // `login` does not open its browser until Enter is pressed, and this
        // screen carries the same "…to continue" wording. Optional and cheap:
        // if it is only a spinner, the keypress is harmless; if it is waiting
        // for acknowledgement, nothing else was ever going to send it.
        label: 'Acknowledge account link (only if it asks)',
        waitFor: /Sign in with your browser|Verifying authentication/i,
        optional: true,
        timeoutMs: 30_000,
        keys: ['Enter'],
        settleMs: 2000,
      },
      {
        // Optional because `--project` above normally means this never appears.
        // Kept so that dropping the flag — or a CLI version that ignores it —
        // still produces a driven run rather than a hang.
        label: 'Intelligence project (skipped when --project is given)',
        waitFor: /Select a project/i,
        optional: true,
        timeoutMs: 90_000,
        select: { label: INTELLIGENCE_PROJECT },
        keys: ['Enter'],
        settleMs: 600,
      },
      {
        // Only frameworks whose starter ships a managed Channel host ask this —
        // 18 of the 23. `framework list` marks `agno` `--channel`, so it is
        // expected to appear here; still optional, because that flag says the
        // starter *can* host a channel, not that this CLI version prompts for
        // it, and an optional step that never matches is skipped rather than
        // failed.
        label: 'Chat platform',
        waitFor: /chat platform/i,
        optional: true,
        // Minutes, not seconds: the template is cloned between the account link
        // and this prompt. A 45s window expired mid-clone in the reference repo,
        // so the prompt arrived after this step had already given up — and then
        // sat unanswered while the next step waited for something behind it.
        timeoutMs: 5 * 60_000,
        select: { label: 'Not now' },
        keys: ['Enter'],
        settleMs: 600,
      },
      {
        // The model key is placed into the project afterwards, deliberately, so
        // it never appears in a recording. Enter leaves it empty and the CLI
        // exits.
        //
        // This comes *before* the install question, not after: the 2026-09-07
        // run went straight from the chat-platform prompt to this one. The
        // pattern matches the literal screen — `Set OPENAI_API_KEY now, or
        // press Enter to skip and add it later.` An earlier `/API key/i` could
        // not match it: the variable is underscored, and the only spaced
        // "a key" on screen is the platform.openai.com/api-keys URL.
        label: 'Skip model API key',
        waitFor: /_API_KEY now|press Enter to skip/i,
        timeoutMs: 5 * 60_000,
        keys: ['Enter'],
      },
      {
        // Single keypress: this prompt acts on the character, with no Enter.
        //
        // Optional, and after the key step. In the 2026-09-07 run this prompt
        // never appeared at all — the CLI asked for the key instead, and a
        // required step here spent its full window waiting for a screen that
        // was never coming while the key prompt sat unanswered behind it.
        // Kept so a CLI version that does ask still gets a driven answer.
        //
        // The pattern must not match the success banner, whose next-steps list
        // prints `Install the dependencies:  npm install`. A bare
        // /install the dependencies/i matched *that*, reported ok, and typed a
        // stray `n` at a CLI that had already finished. Match the question.
        label: 'Decline dependency install',
        waitFor: /Want me to install the dependencies|install the dependencies\?/i,
        optional: true,
        // Short: this runs after the success banner, so its wait is dead air in
        // the video. Long enough to catch a prompt that paints right after the
        // previous answer, short enough not to pad the recording.
        timeoutMs: 10_000,
        type: 'n',
      },
    ],
    // The CLI prints its success banner and then holds the terminal open rather
    // than exiting, so waiting for an exit fails a run whose own last line says
    // it worked.
    doneWhen: /created successfully/i,
    // Answering every prompt is not the same as producing an app. Without this,
    // a CLI that exits 0 having written nothing counts as a pass.
    //
    // `agent/` is asserted because Agno is a **Python** starter: its scaffold
    // ships a `uv`-managed agent alongside the Next app. Confirmed against the
    // already-scaffolded copy at `1-cli-testing/yarn/app/`, which has
    // package.json, agent/, scripts/, src/ and tsconfig.json. A Node-agent
    // framework (Mastra, LangGraph JS, Claude SDK TS) has no `agent/` and this
    // line would fail a scaffold that worked.
    expectFiles: [
      `${SCAFFOLD_DIR}/${APP_NAME}/package.json`,
      `${SCAFFOLD_DIR}/${APP_NAME}/agent`,
    ],
    // Light compression only. The pauses in an interactive session are someone
    // reading the prompt before answering it, and cutting them makes the video
    // unreadable — which is the one thing this clip exists to show.
    render: { maxGapSec: 1.6, speed: 1.15, title: 'Windows PowerShell' },
  },

  // One install per package manager. The scaffold is generated once and copied
  // into each of these directories, so the app is identical in all four and the
  // install path is the only variable under test.
  //
  // These have no steps: a package install asks nothing. They are here for the
  // cast — the install is a segment of the demo video — and for the durations,
  // which are the matrix's actual finding.
  //
  // Note for this starter specifically: `postinstall` runs `install:agent`,
  // which shells out to `scripts/setup-agent.sh || scripts\setup-agent.bat` to
  // `uv sync` the Python agent. The install is therefore not purely a JS
  // install, and a manager whose shell mangles that line fails here rather than
  // in `dev`.
  ...PACKAGE_MANAGERS.map(({ id, command }) => ({
    id: `install-${id}`,
    name: `Install dependencies — ${id}`,
    castName: `Install-${id}`,
    cwd: `${SCAFFOLD_DIR}/${id}/${APP_NAME}`,
    command,
    args: ['install'],
    // pnpm only: see PNPM_CONFIG_HOME. The other three managers have no
    // equivalent global approval state, so there is nothing to isolate.
    ...(id === 'pnpm' ? { env: { XDG_CONFIG_HOME: PNPM_CONFIG_HOME } } : {}),
    // Cold installs on a slow network genuinely take this long; a tighter cap
    // reports a failure for a command that was working fine.
    timeoutMs: 15 * 60_000,
    expectFiles: [`${SCAFFOLD_DIR}/${id}/${APP_NAME}/node_modules`],
    // The demo leads with resolved versions, and they can only be read once
    // something is installed.
    versionsFor: `${SCAFFOLD_DIR}/${id}/${APP_NAME}`,
    // An install is minutes of a spinner. Nobody watches that, but cutting it
    // entirely loses what the segment is evidence of — that it completed, and
    // roughly how long it took. Cap the dead air, then play what is left fast.
    render: { maxGapSec: 0.4, speed: 3, title: `${command} install` },
  })),

  // Last on purpose, even though it runs between two pnpm installs: cast files
  // are numbered by position in this list, so putting it anywhere earlier
  // renames every install cast after it and orphans the ones already captured.
  //
  // pnpm needs this extra command before its install can succeed, and that is a
  // finding rather than a workaround. pnpm 10+ refuses to run dependency build
  // scripts it has not been told to trust, then exits 1 for having skipped them
  // — so `pnpm install` "fails" on a scaffold that is otherwise fine. One of the
  // skipped scripts is esbuild's, which is how esbuild fetches its platform
  // binary, so this is not cosmetic.
  //
  // `--all` because the interactive form is a checkbox list, and the decision
  // being recorded is "this starter's dependencies may build", not a per-package
  // judgement. Approving writes `pnpm-workspace.yaml` into the app; the manifest
  // is untouched, so the four copies stay comparable.
  //
  // Run order for pnpm:
  //   --install-pnpm   exits 1, having skipped the builds
  //   --approve-pnpm   runs them, records the approval
  //   --install-pnpm   clean
  {
    id: 'approve-pnpm',
    env: { XDG_CONFIG_HOME: PNPM_CONFIG_HOME },
    name: 'pnpm — approve dependency build scripts',
    castName: 'Approve-pnpm',
    cwd: `${SCAFFOLD_DIR}/pnpm/${APP_NAME}`,
    command: 'pnpm',
    args: ['approve-builds', '--all'],
    timeoutMs: 5 * 60_000,
    expectFiles: [`${SCAFFOLD_DIR}/pnpm/${APP_NAME}/pnpm-workspace.yaml`],
    render: { maxGapSec: 0.4, speed: 2, title: 'pnpm approve-builds' },
  },

  // The install again, now that the build scripts are approved. This is the
  // step that decides whether the ignored-builds error was the whole problem,
  // and it is a separate flow rather than a re-run of `install-pnpm` because
  // both runs belong in the clip: the reader needs to see the failure and the
  // clean install, in that order.
  //
  // Appended here for the same reason approve-pnpm was — casts are numbered by
  // position in this list, so inserting earlier renames the casts after it.
  {
    id: 'reinstall-pnpm',
    env: { XDG_CONFIG_HOME: PNPM_CONFIG_HOME },
    name: 'pnpm — install again, build scripts approved',
    castName: 'Reinstall-pnpm',
    cwd: `${SCAFFOLD_DIR}/pnpm/${APP_NAME}`,
    command: 'pnpm',
    args: ['install'],
    timeoutMs: 15 * 60_000,
    expectFiles: [`${SCAFFOLD_DIR}/pnpm/${APP_NAME}/node_modules`],
    versionsFor: `${SCAFFOLD_DIR}/pnpm/${APP_NAME}`,
    render: { maxGapSec: 0.4, speed: 3, title: 'pnpm install' },
  },

  // Does the approved, cleanly installed app actually start?
  //
  // This flow is deliberately NOT written to expect a failure. `doneWhen` is
  // the readiness banner, so it passes only if the dev server comes up: if the
  // agent dies the way it does in the Mastra starter, concurrently takes the UI
  // with it, the banner never prints, and this reports a failure — which is
  // what routes pnpm to a finding instead of a demo. An install exiting 0 is
  // not evidence the app runs, and this is the flow that asks.
  //
  // PORT matches demo-pnpm in pages.config.ts so this and the demo recording
  // cannot collide, and so neither lands on 3000, which a sibling repo squats.
  {
    id: 'dev-pnpm',
    name: 'pnpm — starting the app',
    castName: 'Dev-pnpm',
    cwd: `${SCAFFOLD_DIR}/pnpm/${APP_NAME}`,
    command: 'pnpm',
    args: ['run', 'dev'],
    env: { PORT: '3132', BROWSER: 'none' },
    // The agent is a Python process behind a venv; first boot is not instant.
    timeoutMs: 4 * 60_000,
    // Matches the AGENT's readiness line, never the UI's.
    //
    // `npm run dev` runs both halves under concurrently. The UI compiles and
    // prints its banner whether or not the Python agent came up, so keying on
    // "Local: http://localhost:3132" stops the capture on a green-looking
    // screen while the agent is already dead — and concurrently --kill-others
    // then takes the UI down a second later, off camera. Waiting for uvicorn
    // means a dead agent never matches: the run exits non-zero and reports the
    // failure, which is the point of this flow.
    doneWhen: /Application startup complete|Uvicorn running on/,
    // A dev server never exits on its own, so there are no files to assert and
    // no exit code worth reading — `doneWhen` is the whole verdict.
    expectFiles: [],
    render: { maxGapSec: 0.6, speed: 1.5, title: 'pnpm run dev' },
  },
]);

/**
 * The deliverable: three videos per package manager, twelve in all.
 *
 * Each manager gets a complete set — the CLI creating the project, that
 * manager installing it, and its copy running and answering — so one folder of
 * clips tells the whole story for one manager without cross-referencing.
 *
 * The CLI clip is deliberately the same footage in all four sets: the CLI runs
 * once and the result is copied, so there is only one real create to show.
 * `cli-render.ts` records it once and copies the file, rather than re-filming
 * identical footage four times.
 *
 * The third video of each set is a page recording, in `pages.config.ts`.
 */
/**
 * The deliverable: one CLI clip, then two clips per package manager.
 *
 *   1. `CLI-Create`        the CLI scaffolding the app — once, shared by all
 *                          four, because the CLI ran once and the result was
 *                          copied; four clips of it would be the same footage
 *   2. `<pm>-2-Install`    that manager installing the copy, pass or fail —
 *                          this is the clip that shows whether the install
 *                          command works, so it is always filmed
 *   3. `<pm>-3-Demo`       the app running and answering a prompt, when the
 *                          install succeeded (a page recording, see
 *                          `pages.config.ts`)
 *      `<pm>-3-Finding`    the failure explained, when it did not: the doc
 *                          page, the versions it resolved, the manifest line,
 *                          the command failing, and a note written out
 *
 * Which of the two third clips a manager gets is decided by its install
 * report, not by hand: `npm run cli:videos` reads `casts/*.report.json` and
 * films the finding for a failed install or records the demo for a working
 * one. A failure nobody has analysed yet still gets a clip — the note is
 * generated from the report (command, exit code, last screen) and the
 * hand-written `analysis` below is appended when there is one.
 *
 * `project-context.md`: a broken thing keeps its broken implementation and
 * the recording exists to show the defect; every finding pins installed
 * against declared versions. That is what the finding clip's IDE tabs are.
 */

/**
 * Hand-written analysis for a failure that has been understood. Keyed by
 * package manager; a manager with no entry gets the generated note alone.
 *
 * Empty until the pipeline has been run here and a failure read. The
 * reference repo's entry was a bun/Windows backslash bug in a Python
 * starter's `install:agent` script; whether this starter has anything like
 * it is exactly what the first run will say.
 */
const INSTALL_ANALYSIS: Partial<Record<string, string>> = {
  bun: [
    'why: package.json line 11 reads',
    '  "install:agent": "./scripts/setup-agent.sh || scripts\\setup-agent.bat"',
    "bun's shell eats the backslash, so scripts\\setup-agent.bat becomes",
    "scriptssetup-agent.bat - you can see the slash missing in bun's own",
    'error. both scripts are there on disk. npm runs the same line through',
    'cmd.exe where \\ is just a path separator, so npm never hits this.',
    '',
    'so agent/.venv never gets created, the python agent has no deps, and',
    'bun run dev cant start it.',
    '',
    'fix: scripts/setup-agent.bat - forward slash works in both shells.',
    '',
    'same line, same break, as the microsoft agent framework starter. this',
    'is the shared starter scaffolding, not something agno does.',
  ].join('\n'),

  pnpm: [
    'why: pnpm 10 does not run a dependency build script unless it has been',
    'approved, and it exits 1 rather than warning. the three it refused here',
    'are @scarf/scarf, esbuild and sharp:',
    '',
    '  ERR_PNPM_IGNORED_BUILDS  Ignored build scripts: @scarf/scarf@1.4.0,',
    '  esbuild@0.28.2, sharp@0.34.5',
    '',
    'esbuild and sharp are the ones that matter - both unpack a platform',
    'binary in their build script, so the packages are on disk but have no',
    'executable to run.',
    '',
    'fix: pnpm approve-builds --all, then install again. the quickstart does',
    'not mention it, so a reader following the pnpm path stops here.',
  ].join('\n'),
};

/**
 * Flow ids whose failure the video goes on to fix, and so must not decide the
 * third clip.
 *
 * pnpm's first install exits 1 on ignored build scripts. The clip does not stop
 * there — it approves them and installs again — so filing a finding on that
 * first exit would report a problem the viewer just watched get resolved. What
 * decides pnpm's third clip is `dev-pnpm`: whether the app starts afterwards.
 *
 * Read by cli-render.ts. A flow listed here is still filmed; it just does not
 * file a finding on its own.
 */
export const REMEDIATED_FLOWS = new Set<string>(['install-pnpm']);

/**
 * Flow ids that prove the installed app does not work, whatever the capture
 * report says about them.
 *
 * Empty here on purpose. A flow written to expect a crash gets graded a pass
 * for crashing on cue, and would need listing to count against its manager —
 * but `dev-pnpm` is written the other way round, passing only when the server
 * comes up. It grades itself honestly, so nothing needs correcting.
 *
 * Read by cli-render.ts. Every id here needs a matching flow in CLI_FLOWS.
 */
export const PROVES_BROKEN = new Set<string>([]);

/** Narration for a finding that has been recorded, relative to this folder. */
const FINDING_AUDIO: Partial<Record<string, string>> = {};

/**
 * Hand-written analysis for a DEMO that failed — the app installed, started,
 * and then would not serve what the CLI generated for it.
 *
 * Kept apart from INSTALL_ANALYSIS because it answers a different question.
 * An install finding explains why nothing got onto disk; this explains why
 * what did get onto disk does not work. Observed 2026-09-08 by running all
 * four managers' demos back to back, which is the only way the difference
 * between them shows up.
 */
const DEMO_ANALYSIS: Partial<Record<string, string>> = {
  pnpm: [
    'why: the generated app/src/app/api/copilotkit/[[...slug]]/route.ts imports',
    '@copilotkit/runtime/v2, and @copilotkit/runtime@1.70.0 declares a hard',
    'dependency on express ^4.21.2, resolved here to 4.22.2. turbopack follows',
    'that import graph into express/lib/view.js line 81:',
    '',
    '  var fn = require(mod).__express',
    '',
    'mod is a runtime variable, so the require cannot be resolved at build',
    'time and the route fails to compile. it fires on the first request to',
    '/api/copilotkit, not at boot - npm run dev looks like it worked.',
    '',
    'this is pnpm-only. npm and yarn ran the same app on the same day and',
    'served the route fine. all four have next 16.0.7, runtime 1.70.0, the',
    'same express 4.22.2 and a byte-identical next.config.ts, so the version',
    'pins are not the difference - the node_modules layout is. pnpm keeps',
    'express under .pnpm/ rather than hoisting it, and turbopack cannot',
    'resolve past the dynamic require through that layout.',
    '',
    'the generated next.config.ts already sets',
    '  serverExternalPackages: ["pino", "thread-stream"]',
    'so the scaffold knows this route needs packages left unbundled. express',
    'is not in the list, and neither is @copilotkit/runtime.',
    '',
    'the console errors above are a second, separate defect: the client',
    'fetches a hardcoded localhost:3000 whatever port it is served on, so',
    'every manager on a non-default port is blocked by CORS.',
  ].join('\n'),

  bun: [
    'why: package.json reads',
    '  "dev:agent": "./scripts/run-agent.sh || scripts\\run-agent.bat"',
    "bun's shell eats the backslash, so scripts\\run-agent.bat becomes",
    'scriptsrun-agent.bat - the slash is missing in bun\'s own error. both',
    'scripts are on disk. the dev server never came up at all; the whole',
    'take was over in 6 seconds.',
    '',
    'this is the same break as the install:agent line, one line further down',
    'the same package.json. fixing setup-agent would still leave this one.',
    '',
    'fix: scripts/run-agent.bat - forward slash works in both shells.',
  ].join('\n'),
};

export const CLI_VIDEOS = defineCliVideos([
  {
    id: 'cli',
    name: 'CopilotKit CLI — creating the app',
    videoName: 'CLI-Create',
    docPath: CLI_DOC_PATH,
    flows: ['scaffold'],
  },

  ...PACKAGE_MANAGERS.map(({ id }) => {
    const app = `${SCAFFOLD_DIR}/${id}/${APP_NAME}`;
    return {
      id: `install-video-${id}`,
      name:
        id === 'pnpm'
          ? `${id} · 2 · Installing, approving build scripts, installing again`
          : `${id} · 2 · Installing dependencies`,
      videoName: `${id}-2-Install`,
      docPath: CLI_DOC_PATH,
      // pnpm alone carries the extra flows, because pnpm alone fails in a way
      // the quickstart can recover from. Ending its clip on the ignored-builds
      // error would leave a reader believing the pnpm path is a dead end; the
      // clip approves the scripts, installs cleanly, and then tries to start
      // the app — which is where a reader following the docs actually ends up.
      flows:
        id === 'pnpm'
          ? ['install-pnpm', 'approve-pnpm', 'reinstall-pnpm', 'dev-pnpm']
          : [`install-${id}`],

      // Video 3 when the install worked: the app, live. `demo-<pm>` in
      // pages.config.ts boots that copy's dev server and drives it.
      onSuccess: { recordPage: `demo-${id}` },

      // Video 3 when it did not: the finding.
      onFailure: {
        id: `finding-${id}`,
        name:
          id === 'pnpm'
            ? `${id} · 3 · Finding — installs clean, then will not start`
            : `${id} · 3 · Finding — install failed`,
        videoName: `${id}-3-Finding`,
        ideTabs: [
          // Installed, not declared: what this run actually resolved to.
          // Written by the install flow even when it fails partway, as long
          // as something landed in node_modules.
          { filePath: `${app}/VERSIONS.md`, startLine: 1, endLine: 20 },
          // What the starter declares — the CopilotKit packages under test.
          { filePath: `${app}/package.json`, startLine: 1, endLine: 30 },
        ],
        ideDwellMs: 4200,
        analysis: INSTALL_ANALYSIS[id],
        notepadFile: `${id}-install-finding.txt`,
        // Faster than the 62ms default: a finding note is several times
        // longer than a one-line jotting, and at the default it would spend
        // two minutes typing while the viewer has already read it.
        charDelayMs: 22,
        audio: FINDING_AUDIO[id],
      },

      // Video 3 when the install worked and the app did not: the demo's own
      // failure, explained. Without this the pipeline films the error and
      // says nothing about it, because `onFailure` is keyed on the install
      // report and an install that succeeded never reaches it.
      onDemoFailure: {
        id: `demo-finding-${id}`,
        name: `${id} · 3 · Finding — installs clean, starts, will not serve`,
        videoName: `${id}-3-Demo-Finding`,
        ideTabs: [
          // The route that fails to compile, and the config that decides what
          // is left unbundled for it — the two files the pnpm finding is about.
          {
            filePath: `${app}/src/app/api/copilotkit/[[...slug]]/route.ts`,
            startLine: 1,
            endLine: 12,
          },
          { filePath: `${app}/next.config.ts`, startLine: 1, endLine: 20 },
          // Installed against declared, as every finding must pin.
          { filePath: `${app}/VERSIONS.md`, startLine: 1, endLine: 20 },
          { filePath: `${app}/package.json`, startLine: 1, endLine: 30 },
        ],
        ideDwellMs: 4200,
        analysis: DEMO_ANALYSIS[id],
        notepadFile: `${id}-demo-finding.txt`,
        charDelayMs: 22,
        // bun never reaches a browser — its dev server dies in the terminal,
        // so the terminal is the evidence. The others fail on screen in the
        // app, which the demo clip beside this one already shows.
        segmentFlows: id === 'pnpm' ? ['dev-pnpm'] : undefined,
        audio: FINDING_AUDIO[id],
      },
    };
  }),
]);

