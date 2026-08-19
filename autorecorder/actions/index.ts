/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  ADAPT THIS DIRECTORY
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * What the recorder *does* on each demo page once it is open.
 *
 * The registry lives here rather than in `core/` on purpose: adding or removing
 * a page must never mean editing frozen code. A page with no entry falls back
 * to `runStandardAction` — type the prompt, submit, wait for the reply — which
 * is right for most pages. Write a handler only when a page needs more than
 * that: switching tabs, clicking an approval button, opening a panel.
 *
 * Handlers should build on the helpers in `core/actions.ts`:
 *
 *   sendPrompt(page, prompt, opts)          types and submits, returns the
 *                                           assistant-message count from before
 *                                           submitting
 *   waitForAgentResponseCompletion(...)     waits for the reply to finish, and
 *                                           throws if none ever arrives
 *   promptsFor(config)                      the page's prompts[] , or [prompt]
 *
 * Pass that returned count into waitForAgentResponseCompletion on multi-turn
 * pages, or the previous turn's reply is mistaken for this one's.
 */

import { type PageActionHandler, type PageRecordConfig } from '../core/types';
import { runStandardAction } from '../core/actions';
import { type Page } from 'playwright';

import { runAgUiAction } from './ag-ui.action';
import { runDisplayOnlyAction } from './display-only.action';
import { runErrorDebuggingAction } from './error-debugging.action';
import { runFrontendToolsAction } from './frontend-tools.action';
import { runHeadlessUiAction } from './headless-ui.action';
import { runHitlAction } from './hitl.action';
import { runInspectorAction } from './inspector.action';
import { runPrebuiltAction } from './prebuilt.action';
import { runProgrammaticAction } from './programmatic.action';
import { runRuntimeAction } from './runtime.action';
import { runSlotsAction } from './slots.action';
import {
  runThreadsDrawerAction,
  runThreadsHeadlessAction,
  runThreadsLifecycleAction,
} from './threads.action';
import { runToolRenderingAction } from './tool-rendering.action';

/** Keys are page ids from `config/pages.config.ts`. Doctor flags any orphans. */
export const ACTION_MAP: Record<string, PageActionHandler> = {
  quickstart: runStandardAction,
  'prebuilt-components': runPrebuiltAction,
  'threads-drawer': runThreadsDrawerAction,
  'threads-headless': runThreadsHeadlessAction,
  'threads-lifecycle': runThreadsLifecycleAction,
  'programmatic-control': runProgrammaticAction,
  inspector: runInspectorAction,
  slots: runSlotsAction,
  'headless-ui': runHeadlessUiAction,
  'display-only': runDisplayOnlyAction,
  'tool-rendering': runToolRenderingAction,
  'frontend-tools': runFrontendToolsAction,
  'human-in-the-loop': runHitlAction,
  'copilot-runtime': runRuntimeAction,
  'ag-ui': runAgUiAction,
  'error-debugging': runErrorDebuggingAction,
};

export async function executePageAction(
  page: Page,
  config: PageRecordConfig,
  rootPath: string,
): Promise<void> {
  const handler = ACTION_MAP[config.id] ?? runStandardAction;
  await handler(page, config, rootPath);
}
