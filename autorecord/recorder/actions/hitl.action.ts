import { type Page } from 'playwright';
import { humanClick, humanGlide, sleep } from '../overlays/cursor';
import { type PageActionHandler, type PageRecordConfig } from '../types';

export const runHitlAction: PageActionHandler = async (
  page: Page,
  config: PageRecordConfig,
) => {
  console.log(`   [Human in the Loop] Typing prompt to trigger offerOptions tool...`);
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

  console.log(`   Waiting for HITL options buttons to appear in message stream...`);
  await sleep(6500);

  try {
    // Locate the first option button rendered by offerOptions
    const optionBtn = page
      .locator('button:has-text("was selected"), div:has-text("Pick one:") + div button, div:has-text("Pick one") button')
      .first();

    if (await optionBtn.isVisible({ timeout: 4000 }).catch(() => false)) {
      const obBox = await optionBtn.boundingBox();
      if (obBox) {
        await humanGlide(page, obBox.x + obBox.width / 2, obBox.y + obBox.height / 2, 20);
        await humanClick(page);
        console.log(`   ✓ Clicked option on Human-in-the-loop choice card!`);
        await sleep(3500);
      }
    }
  } catch (e) {
    console.warn(`HITL button notice: ${e}`);
  }

  await humanGlide(page, 960, 500, 25);
  await sleep(config.waitAfterPromptMs ?? 6000);
};
