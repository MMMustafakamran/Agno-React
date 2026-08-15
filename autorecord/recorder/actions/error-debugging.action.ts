import { type Page } from 'playwright';
import { humanClick, humanGlide, sleep } from '../overlays/cursor';
import { showNotepadNote } from '../overlays/notepad';
import { type PageActionHandler, type PageRecordConfig } from '../types';

export const runErrorDebuggingAction: PageActionHandler = async (
  page: Page,
  config: PageRecordConfig,
) => {
  console.log(`   [Error Debugging] Demonstrating live error capture panel...`);
  // Move cursor over error log panel on the left
  await humanGlide(page, 450, 300, 22);
  await sleep(2000);

  // Focus chat input
  const inputLocator = page
    .locator('textarea, input[type="text"], [contenteditable="true"]')
    .first();
  if (await inputLocator.isVisible({ timeout: 4000 }).catch(() => false)) {
    const inputBox = await inputLocator.boundingBox();
    if (inputBox) {
      await humanGlide(page, inputBox.x + 80, inputBox.y + inputBox.height / 2, 20);
      await humanClick(page);
    }
    for (const c of config.prompt) await page.keyboard.type(c, { delay: 45 });
    await sleep(400);
    await page.keyboard.press('Enter');
    await sleep(4000);
  }

  await showNotepadNote(page, 'error_debugging_notes.txt', [
    'CopilotKitProvider onError handler captures all runtime & agent errors.',
    'Exposes { error, code, context } parameters across the application.',
    'When the Agno backend process is stopped, errors appear in the live log.',
  ]);
};
