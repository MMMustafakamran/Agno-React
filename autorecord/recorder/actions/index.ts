import { type Page } from 'playwright';
import { humanClick, humanGlide, sleep } from '../overlays/cursor';
import { type PageActionHandler, type PageRecordConfig } from '../types';
import { runAgUiAction } from './ag-ui.action';
import { runDisplayOnlyAction } from './display-only.action';
import { runErrorDebuggingAction } from './error-debugging.action';
import { runFrontendToolsAction } from './frontend-tools.action';
import { runHeadlessUiAction } from './headless-ui.action';
import { runHitlAction } from './hitl.action';
import { runInspectorAction } from './inspector.action';
import {
  runInteractiveStubAction,
  runIntroductionAction,
  runThreadsArchitectureAction,
  runThreadsImportAction,
  runThreadsOverviewAction,
} from './partial-notes.action';
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

export const runStandardAction: PageActionHandler = async (
  page: Page,
  config: PageRecordConfig,
) => {
  const inputLocator = page
    .locator('textarea, input[type="text"], [contenteditable="true"]')
    .first();
  await inputLocator.waitFor({ state: 'visible', timeout: 12000 });
  await sleep(600);

  const inputBox = await inputLocator.boundingBox();
  if (inputBox) {
    await humanGlide(
      page,
      inputBox.x + 80,
      inputBox.y + inputBox.height / 2,
      25,
    );
    await humanClick(page);
  } else {
    await inputLocator.click();
  }
  await sleep(400);

  for (const char of config.prompt) {
    await page.keyboard.type(char, { delay: 45 });
  }
  await sleep(600);

  // If text was wiped during typing by a sudden React re-render, re-fill
  const currentVal = await inputLocator.inputValue().catch(() => '');
  if (!currentVal && config.prompt) {
    await inputLocator.fill(config.prompt);
    await sleep(300);
  }

  // Attempt to submit prompt via button click or Enter key
  const sendBtn = page
    .locator(
      'button[type="submit"], button:has-text("Send"), .copilotKitSendButton, button[aria-label*="Send"]',
    )
    .first();

  if (await sendBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
    const btnBox = await sendBtn.boundingBox();
    if (btnBox) {
      await humanGlide(
        page,
        btnBox.x + btnBox.width / 2,
        btnBox.y + btnBox.height / 2,
        20,
      );
      await humanClick(page);
    } else {
      await sendBtn.click();
    }
  } else {
    await page.keyboard.press('Enter');
  }

  // Double-check after 800ms if input is still populated (swallowed submit), re-trigger Enter
  await sleep(800);
  const remainingVal = await inputLocator.inputValue().catch(() => '');
  if (remainingVal.trim().length > 0) {
    await page.keyboard.press('Enter');
  }

  console.log(`⏳ Actively detecting AI agent response...`);
  // Dynamic response detection: wait until assistant message or streaming content appears
  await page
    .waitForFunction(
      () => {
        const assistantMsgs = document.querySelectorAll(
          '.copilotKitAssistantMessage, [data-message-role="assistant"], .copilotKitMessage:not(:first-child), [class*="assistant"]',
        );
        return assistantMsgs.length > 0;
      },
      { timeout: 18000 },
    )
    .catch(() => {});

  await sleep(4000);

  const assistantLocator = page
    .locator('.copilotKitAssistantMessage, [data-message-role="assistant"]')
    .first();
  if (await assistantLocator.isVisible({ timeout: 4000 }).catch(() => false)) {
    const abBox = await assistantLocator.boundingBox();
    if (abBox) {
      console.log(
        `   🎯 Detected AI assistant response at (${Math.round(abBox.x)}, ${Math.round(abBox.y)})`,
      );
      await humanGlide(
        page,
        abBox.x + Math.min(abBox.width / 2, 200),
        abBox.y + 30,
        25,
      );
    }
  } else {
    await humanGlide(page, 960, 500, 30);
  }

  await sleep(config.waitAfterPromptMs ?? 6000);
};

const ACTION_MAP: Record<string, PageActionHandler> = {
  introduction: runIntroductionAction,
  quickstart: runStandardAction,
  'prebuilt-components': runPrebuiltAction,
  'threads-overview': runThreadsOverviewAction,
  'threads-drawer': runThreadsDrawerAction,
  'threads-headless': runThreadsHeadlessAction,
  'threads-lifecycle': runThreadsLifecycleAction,
  'threads-import': runThreadsImportAction,
  'threads-architecture': runThreadsArchitectureAction,
  'programmatic-control': runProgrammaticAction,
  inspector: runInspectorAction,
  slots: runSlotsAction,
  'headless-ui': runHeadlessUiAction,
  'display-only': runDisplayOnlyAction,
  interactive: runInteractiveStubAction,
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
