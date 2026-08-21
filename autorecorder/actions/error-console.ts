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
import { sleep } from '../core/overlays/cursor';

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
  /** Heading on the panel. Say what the viewer is looking at. */
  title?: string;
  /** One line under the heading explaining why the failure is expected. */
  note?: string;
  /** Longest an entry may run before it is cut, so one stack trace cannot fill the frame. */
  maxChars?: number;
  /** Most entries to show. */
  maxEntries?: number;
}

/**
 * Renders the captured errors into a panel on the page.
 *
 * Styled to read as a console rather than as part of the app, and positioned
 * clear of the simulated taskbar's bottom 48px. Appended to <html> like the
 * other overlays, so app-level re-renders are less likely to disturb it, and
 * fades in so the cut is not jarring on video.
 */
export async function showErrorConsole(
  page: Page,
  errors: CapturedError[],
  opts: ErrorConsoleOptions = {},
): Promise<void> {
  const {
    title = 'Browser console',
    note = '',
    maxChars = 320,
    maxEntries = 5,
  } = opts;

  if (errors.length === 0) return;

  const rows = errors.slice(-maxEntries).map((e) => ({
    kind: e.kind,
    text: e.text.length > maxChars ? `${e.text.slice(0, maxChars)}…` : e.text,
  }));

  await page.evaluate(
    ({ rows: entries, title: heading, note: subtitle }) => {
      document.getElementById('__autorecord_error_console')?.remove();

      const panel = document.createElement('div');
      panel.id = '__autorecord_error_console';
      panel.style.cssText = [
        'position:fixed',
        'left:24px',
        'right:24px',
        'bottom:72px', // clears the 48px taskbar overlay
        'z-index:2147483646',
        'max-height:38vh',
        'overflow:hidden',
        'background:#1b1116',
        'border:1px solid #7f1d1d',
        'border-radius:10px',
        'box-shadow:0 18px 48px rgba(0,0,0,.55)',
        'font:13px/1.55 ui-monospace,SFMono-Regular,Consolas,monospace',
        'color:#fecaca',
        'opacity:0',
        'transition:opacity .35s ease',
      ].join(';');

      const head = document.createElement('div');
      head.style.cssText =
        'display:flex;align-items:center;gap:8px;padding:9px 14px;background:#2b1218;border-bottom:1px solid #7f1d1d;color:#fca5a5;font-weight:600;';
      head.textContent = `✖ ${heading}`;
      panel.appendChild(head);

      if (subtitle) {
        const sub = document.createElement('div');
        sub.style.cssText =
          'padding:7px 14px;color:#fca5a5;background:#241016;border-bottom:1px solid #7f1d1d;font-size:12px;';
        sub.textContent = subtitle;
        panel.appendChild(sub);
      }

      const body = document.createElement('div');
      body.style.cssText = 'padding:8px 14px 12px;overflow-y:auto;max-height:26vh;';
      for (const entry of entries) {
        const row = document.createElement('div');
        row.style.cssText =
          'padding:5px 0;border-bottom:1px solid rgba(127,29,29,.4);white-space:pre-wrap;word-break:break-word;';
        const tag = document.createElement('span');
        tag.style.cssText = 'color:#f87171;margin-right:8px;text-transform:uppercase;font-size:11px;';
        tag.textContent = entry.kind;
        row.appendChild(tag);
        row.appendChild(document.createTextNode(entry.text));
        body.appendChild(row);
      }
      panel.appendChild(body);

      document.documentElement.appendChild(panel);
      requestAnimationFrame(() => {
        panel.style.opacity = '1';
      });
    },
    { rows, title, note },
  );

  await sleep(600);
}
