import { type Page } from 'playwright';
import { humanClick, humanGlide, sleep } from '../overlays/cursor';
import { type PageActionHandler, type PageRecordConfig } from '../types';

export const runFrontendToolsAction: PageActionHandler = async (
  page: Page,
  config: PageRecordConfig,
) => {
  console.log(`   [Frontend Tools] Sending prompt to exercise sayHello, setThemeColor, and addBookmark...`);
  const inputLocator = page
    .locator('textarea, input[type="text"], [contenteditable="true"]')
    .first();
  await inputLocator.waitFor({ timeout: 8000 });
  const inputBox = await inputLocator.boundingBox();
  if (inputBox) {
    await humanGlide(page, inputBox.x + 80, inputBox.y + inputBox.height / 2, 20);
    await humanClick(page);
  }
  for (const c of config.prompt) await page.keyboard.type(c, { delay: 45 });
  await sleep(400);
  await page.keyboard.press('Enter');

  console.log(`   Waiting for browser tool execution and UI panels update...`);
  // Glide cursor over the left side effects panels (sayHello, setThemeColor, addBookmark)
  await sleep(4000);
  await humanGlide(page, 450, 200, 22);
  await sleep(1500);
  await humanGlide(page, 450, 400, 22);
  await sleep(config.waitAfterPromptMs ?? 7000);
};
