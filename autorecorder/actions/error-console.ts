/**
 * Puts the browser's errors on screen, so a page whose failure *is* the story
 * can be recorded honestly.
 *
 * Some demos do not work, and not because the recorder is wrong. On this stack
 * `display-only` and `frontend-tools` both stream an answer and then die with
 * Agno's "Frontend tool resume requires a database" — a real limitation of the
 * setup, reported in the browser console and nowhere the camera can see. The
 * choices were to record a video that quietly implies success, or to fail the
 * page and produce nothing. Neither is useful to someone deciding whether to
 * adopt this integration.
 *
 * So: collect what the browser reports during the run, and render it into a
 * panel on the page before the recording ends. The video then shows the demo
 * *and* the reason it stopped.
 *
 * ── Portability ────────────────────────────────────────────────────────────
 * Nothing here knows about Agno, CopilotKit or React. It listens to Playwright's
 * own `console`/`pageerror`/`requestfailed` events and injects plain DOM. Any
 * adaptation with a page that fails for a documented reason can use it. Like
 * `page-ready.ts` it belongs in `core/` and lives in `actions/` only because
 * `core/` is frozen — promote and port it.
 */

import { type Page } from 'playwright';
import { humanClick, humanGlide, sleep } from '../core/overlays/cursor';

/** One thing the browser complained about. */
export interface CapturedError {
  kind: 'console' | 'pageerror' | 'request';
  text: string;
}

export interface ErrorCollector {
  /** Everything captured so far, newest last, de-duplicated. */
  entries: () => CapturedError[];
  /** Stop listening. Safe to call more than once. */
  stop: () => void;
}

/**
 * Noise every dev server produces, which would bury the real error.
 *
 * Kept in step with the filters the engine already applies to its own console
 * logging — the point is to show the failure, not the ambient chatter.
 */
const IGNORED = [
  'favicon.ico',
  'reo.dev',
  'analytics',
  'webpack-hmr',
  '.map',
  'Hydration failed',
  "server rendered text didn't match",
  'Minified React error',
  'Download the React DevTools',
  'Lit is in dev mode',
  'Failed to load resource',
];

const isNoise = (text: string): boolean =>
  !text.trim() || IGNORED.some((n) => text.includes(n));

/**
 * Starts listening for browser-reported failures.
 *
 * Call before the prompt is sent; the listeners stay attached for the rest of
 * the page's life, which is the run.
 */
export function captureErrors(page: Page): ErrorCollector {
  const seen = new Set<string>();
  const found: CapturedError[] = [];

  const add = (kind: CapturedError['kind'], text: string): void => {
    const trimmed = text.trim();
    if (isNoise(trimmed) || seen.has(trimmed)) return;
    seen.add(trimmed);
    found.push({ kind, text: trimmed });
  };

  const onConsole = (msg: { type: () => string; text: () => string }): void => {
    if (msg.type() === 'error') add('console', msg.text());
  };
  const onPageError = (err: Error): void => add('pageerror', err.message || String(err));
  const onRequestFailed = (req: {
    method: () => string;
    url: () => string;
    failure: () => { errorText: string } | null;
  }): void =>
    add('request', `${req.method()} ${req.url()} — ${req.failure()?.errorText ?? 'failed'}`);

  page.on('console', onConsole);
  page.on('pageerror', onPageError);
  page.on('requestfailed', onRequestFailed);

  let stopped = false;
  return {
    entries: () => [...found],
    stop: () => {
      if (stopped) return;
      stopped = true;
      page.off('console', onConsole);
      page.off('pageerror', onPageError);
      page.off('requestfailed', onRequestFailed);
    },
  };
}

export interface ErrorConsoleOptions {
  /** Sits in the console's own message area, above the errors. */
  note?: string;
  /** Longest an entry may run before it is cut, so one stack trace cannot fill the frame. */
  maxChars?: number;
  /** Most entries to show. */
  maxEntries?: number;
  /** Move the virtual cursor down to the panel as it opens. */
  moveCursor?: boolean;
}

/**
 * Opens a console at the bottom of the page and shows the captured errors in it.
 *
 * ── Why this is drawn rather than opened ───────────────────────────────────
 * Playwright records the page viewport, not the browser's own UI, so real
 * DevTools would be invisible in the video — pressing F12 produces a recording
 * in which nothing happens. This draws the console into the page instead, which
 * is the same trick the suite already uses for VS Code and the Windows taskbar:
 * the surrounding chrome is simulated, the content is real. Every line in the
 * panel is something the browser actually reported during the run.
 *
 * It is docked above the taskbar's 48px and slides open, so on video it reads as
 * a console being opened after the failure rather than a panel that was always
 * there.
 */
export async function openDevToolsConsole(
  page: Page,
  errors: CapturedError[],
  opts: ErrorConsoleOptions = {},
): Promise<void> {
  const { note = '', maxChars = 300, maxEntries = 6, moveCursor = true } = opts;

  if (errors.length === 0) return;

  const rows = errors.slice(-maxEntries).map((e) => ({
    kind: e.kind,
    text: e.text.length > maxChars ? `${e.text.slice(0, maxChars)}…` : e.text,
  }));

  // Bring the cursor down first, so the console opening reads as deliberate.
  if (moveCursor) {
    const viewport = page.viewportSize();
    const y = viewport ? viewport.height - 150 : 900;
    await humanGlide(page, 240, y, 22);
    await humanClick(page);
    await sleep(250);
  }

  await page.evaluate(
    ({ rows: entries, note: subtitle }) => {
      document.getElementById('__autorecord_error_console')?.remove();

      const TABS = ['Elements', 'Console', 'Sources', 'Network', 'Performance'];
      const panel = document.createElement('div');
      panel.id = '__autorecord_error_console';
      panel.style.cssText = [
        'position:fixed',
        'left:0',
        'right:0',
        'bottom:48px', // sits on top of the simulated taskbar
        'z-index:2147483646',
        'height:0px', // animated open below
        'overflow:hidden',
        'background:#282828',
        'border-top:1px solid #4a4a4a',
        'box-shadow:0 -12px 32px rgba(0,0,0,.45)',
        'font:12px/1.6 ui-monospace,SFMono-Regular,Consolas,monospace',
        'color:#e8eaed',
        'transition:height .32s cubic-bezier(.2,.7,.3,1)',
      ].join(';');

      // Tab strip, with Console active.
      const tabs = document.createElement('div');
      tabs.style.cssText =
        'display:flex;align-items:center;gap:2px;padding:0 8px;background:#333;border-bottom:1px solid #4a4a4a;height:30px;flex:0 0 auto;';
      for (const name of TABS) {
        const tab = document.createElement('div');
        const active = name === 'Console';
        tab.style.cssText = `padding:6px 11px;font-size:12px;color:${
          active ? '#e8eaed' : '#9aa0a6'
        };${
          active ? 'background:#282828;border-bottom:2px solid #8ab4f8;' : ''
        }`;
        tab.textContent = name;
        tabs.appendChild(tab);
      }
      const count = document.createElement('div');
      count.style.cssText =
        'margin-left:auto;display:flex;align-items:center;gap:6px;color:#f28b82;font-size:12px;';
      count.textContent = `⊘ ${entries.length}`;
      tabs.appendChild(count);
      panel.appendChild(tabs);

      // Filter row, the way DevTools shows one.
      const filter = document.createElement('div');
      filter.style.cssText =
        'display:flex;align-items:center;gap:10px;padding:5px 10px;background:#282828;border-bottom:1px solid #3c3c3c;color:#9aa0a6;font-size:11px;flex:0 0 auto;';
      filter.textContent = 'top ▾   Filter   Errors only';
      panel.appendChild(filter);

      const body = document.createElement('div');
      body.style.cssText = 'overflow-y:auto;';

      if (subtitle) {
        const sub = document.createElement('div');
        sub.style.cssText =
          'padding:7px 12px;color:#9aa0a6;border-bottom:1px solid #3c3c3c;font-style:italic;';
        sub.textContent = subtitle;
        body.appendChild(sub);
      }

      for (const entry of entries) {
        const row = document.createElement('div');
        row.style.cssText =
          'display:flex;gap:8px;padding:6px 12px;border-bottom:1px solid #3c3c3c;background:#2d1b1b;color:#f28b82;white-space:pre-wrap;word-break:break-word;';
        const icon = document.createElement('span');
        icon.style.cssText = 'flex:0 0 auto;color:#f28b82;';
        icon.textContent = '✖';
        row.appendChild(icon);
        const text = document.createElement('span');
        text.textContent = entry.text;
        row.appendChild(text);
        body.appendChild(row);
      }
      panel.appendChild(body);

      document.documentElement.appendChild(panel);

      // Open to the height the content actually needs. A console holding one
      // error should not be a wall of empty grey, and one holding six should
      // still stop before it swallows the page it is reporting on.
      const needed = tabs.offsetHeight + filter.offsetHeight + body.scrollHeight;
      const target = Math.min(Math.max(needed, 120), Math.round(innerHeight * 0.42));
      body.style.maxHeight = `${target - tabs.offsetHeight - filter.offsetHeight}px`;

      // Slide it open on the next frame so the transition actually runs.
      requestAnimationFrame(() => {
        panel.style.height = `${target}px`;
      });
    },
    { rows, note },
  );

  // Let the open animation finish before the caller starts its reading pause.
  await sleep(700);
}
