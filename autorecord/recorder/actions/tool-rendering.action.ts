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

  console.log(`   ⏳ Actively detecting AI agent response & custom Weather Shell rendering...`);
  // Dynamic response detection: wait until assistant message or weather shell appears
  await page
    .waitForFunction(
      () => {
        const text = document.body.innerText;
        return (
          text.includes('Tokyo') ||
          text.includes('Weather') ||
          text.includes('Checking') ||
          document.querySelectorAll('.copilotKitAssistantMessage, pre, div[class*="Shell"]').length > 0
        );
      },
      { timeout: 18000 },
    )
    .catch(() => {});

  await sleep(4000);

  // Look for custom weather card and glide cursor over it
  const weatherCard = page.locator('div:has-text("Weather"), div:has-text("Tokyo"), pre').first();
  if (await weatherCard.isVisible({ timeout: 5000 }).catch(() => false)) {
    const wcBox = await weatherCard.boundingBox();
    if (wcBox) {
      console.log(`   🎯 Detected rendered Weather card at (${Math.round(wcBox.x)}, ${Math.round(wcBox.y)})`);
      await humanGlide(page, wcBox.x + wcBox.width / 2, wcBox.y + wcBox.height / 2, 22);
      await sleep(3500);
    }
  }

  await humanGlide(page, 960, 500, 25);
  await sleep(config.waitAfterPromptMs ?? 8000);
};
