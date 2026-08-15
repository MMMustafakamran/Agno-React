import { type Page } from 'playwright';
import { humanClick, humanGlide, sleep } from '../overlays/cursor';
import { type PageActionHandler, type PageRecordConfig } from '../types';

export const runRuntimeAction: PageActionHandler = async (
  page: Page,
  config: PageRecordConfig,
) => {
  // 1. Send message to default agent
  console.log(`   [Copilot Runtime] 1/2: Testing 'default' agent routing...`);
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
  console.log(`   Waiting for 'default' agent response...`);
  await sleep(7000);

  // 2. Switch to agno_agent tab
  console.log(`   [Copilot Runtime] 2/2: Switching to 'agno_agent' tab...`);
  const agnoTab = page.locator('button:has-text("agno_agent")').first();
  if (await agnoTab.isVisible().catch(() => false)) {
    const sBox = await agnoTab.boundingBox();
    if (sBox) {
      await humanGlide(page, sBox.x + sBox.width / 2, sBox.y + sBox.height / 2, 20);
      await humanClick(page);
      await sleep(2000);
    }
  }

  // Type a short prompt to agno_agent
  const agnoInput = page
    .locator('textarea, input[type="text"], [contenteditable="true"]')
    .first();
  if (await agnoInput.isVisible().catch(() => false)) {
    const aiBox = await agnoInput.boundingBox();
    if (aiBox) {
      await humanGlide(page, aiBox.x + 80, aiBox.y + aiBox.height / 2, 20);
      await humanClick(page);
      const prompt2 = 'Hello agno_agent! Can you confirm connection?';
      for (const c of prompt2) await page.keyboard.type(c, { delay: 45 });
      await sleep(400);
      await page.keyboard.press('Enter');
      await sleep(6500);
    }
  }

  await humanGlide(page, 960, 500, 25);
  await sleep(2500);
};
