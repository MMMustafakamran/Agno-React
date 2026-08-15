import { type Page } from 'playwright';
import { humanClick, humanGlide, sleep } from '../overlays/cursor';
import { type PageActionHandler, type PageRecordConfig } from '../types';

export const runToolRenderingAction: PageActionHandler = async (
  page: Page,
  config: PageRecordConfig,
) => {
  console.log(`   [Tool Rendering] Prompting for weather to trigger custom Shell renderer...`);
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

  console.log(`   Waiting for custom Weather Shell component to complete...`);
  await sleep(7500);

  // Look for custom weather card
  const weatherCard = page.locator('div:has-text("Weather"), div:has-text("Tokyo")').first();
  if (await weatherCard.isVisible({ timeout: 4000 }).catch(() => false)) {
    const wcBox = await weatherCard.boundingBox();
    if (wcBox) {
      await humanGlide(page, wcBox.x + wcBox.width / 2, wcBox.y + wcBox.height / 2, 22);
      await sleep(2500);
    }
  }

  await humanGlide(page, 960, 500, 25);
  await sleep(config.waitAfterPromptMs ?? 6000);
};
