import { type Page } from 'playwright';
import { humanClick, humanGlide, sleep } from '../overlays/cursor';
import { type PageActionHandler, type PageRecordConfig } from '../types';

export const runInspectorAction: PageActionHandler = async (
  page: Page,
  config: PageRecordConfig,
) => {
  console.log(`   [Inspector] Sending message to populate dev console...`);
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

  console.log(`   Waiting for initial response...`);
  await sleep(4500);

  // Look for CopilotKit Inspector trigger / floating icon on viewport edge
  console.log(`   Opening CopilotKit Inspector overlay...`);
  const inspectorTrigger = page
    .locator(
      'button[aria-label*="Inspector"], button[aria-label*="dev"], button[aria-label*="Console"], .copilotKitDevConsole, [class*="inspector"], button:has-text("Inspector")',
    )
    .first();
  if (await inspectorTrigger.isVisible({ timeout: 4000 }).catch(() => false)) {
    const itBox = await inspectorTrigger.boundingBox();
    if (itBox) {
      await humanGlide(page, itBox.x + itBox.width / 2, itBox.y + itBox.height / 2, 20);
      await humanClick(page);
      await sleep(2000);
    }
  }

  // After inspector is opened, locate and click on "Agents" tab
  console.log(`   Clicking on "Agents" tab in Inspector...`);
  const agentsTab = page
    .locator('button:has-text("Agents"), [role="tab"]:has-text("Agents"), span:has-text("Agents"), div:has-text("Agents")')
    .first();
  if (await agentsTab.isVisible({ timeout: 4000 }).catch(() => false)) {
    const atBox = await agentsTab.boundingBox();
    if (atBox) {
      await humanGlide(page, atBox.x + atBox.width / 2, atBox.y + atBox.height / 2, 20);
      await humanClick(page);
      console.log(`   ✓ Switched to Agents tab in Inspector!`);
      await sleep(3500);
    }
  }

  await humanGlide(page, 960, 500, 25);
  await sleep(config.waitAfterPromptMs ?? 4000);
};
