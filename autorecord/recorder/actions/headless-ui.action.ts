import { type Page } from 'playwright';
import { humanClick, humanGlide, sleep } from '../overlays/cursor';
import { type PageActionHandler, type PageRecordConfig } from '../types';

export const runHeadlessUiAction: PageActionHandler = async (
  page: Page,
  config: PageRecordConfig,
) => {
  console.log(`   [Headless UI] Typing in custom headless input field...`);
  const inputLocator = page.locator('input[placeholder="Type a message..."]').first();
  await inputLocator.waitFor({ timeout: 8000 });
  const inputBox = await inputLocator.boundingBox();
  if (inputBox) {
    await humanGlide(page, inputBox.x + 80, inputBox.y + inputBox.height / 2, 20);
    await humanClick(page);
  }
  for (const c of config.prompt) await page.keyboard.type(c, { delay: 45 });
  await sleep(400);

  const sendBtn = page.locator('button:has-text("Send")').first();
  const sbBox = await sendBtn.boundingBox();
  if (sbBox) {
    await humanGlide(page, sbBox.x + sbBox.width / 2, sbBox.y + sbBox.height / 2, 18);
    await humanClick(page);
  } else {
    await page.keyboard.press('Enter');
  }

  console.log(`   Waiting for Headless UI custom bubble response...`);
  await humanGlide(page, 960, 400, 25);
  await sleep(config.waitAfterPromptMs ?? 8000);
};
