import { type Page } from 'playwright';
import { humanClick, humanGlide, sleep } from '../overlays/cursor';
import { showNotepadNote } from '../overlays/notepad';
import { type PageActionHandler, type PageRecordConfig } from '../types';

export const runThreadsDrawerAction: PageActionHandler = async (
  page: Page,
  config: PageRecordConfig,
) => {
  console.log(`   [Threads Drawer] Demonstrating CopilotThreadsDrawer beside chat...`);
  // Move cursor over drawer panel
  await humanGlide(page, 200, 300, 22);
  await sleep(1500);

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

  await showNotepadNote(page, 'threads_drawer_notes.txt', [
    'CopilotThreadsDrawer + CopilotChat integration test.',
    'Both sit inside a shared CopilotChatConfigurationProvider.',
    'Without a license key, the drawer renders the expected locked view.',
  ]);
};

export const runThreadsHeadlessAction: PageActionHandler = async (
  page: Page,
  config: PageRecordConfig,
) => {
  console.log(`   [Headless Threads] Demonstrating custom useThreads UI...`);
  // Move cursor over thread list panel
  await humanGlide(page, 220, 250, 22);
  await sleep(1500);

  // Toggle show archived
  const checkbox = page.locator('input[type="checkbox"]').first();
  if (await checkbox.isVisible({ timeout: 2000 }).catch(() => false)) {
    const cbBox = await checkbox.boundingBox();
    if (cbBox) {
      await humanGlide(page, cbBox.x + cbBox.width / 2, cbBox.y + cbBox.height / 2, 18);
      await humanClick(page);
      await sleep(1000);
    }
  }

  // Type in chat
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
    await sleep(5000);
  }
};

export const runThreadsLifecycleAction: PageActionHandler = async (
  page: Page,
  config: PageRecordConfig,
) => {
  console.log(`   [Threads Lifecycle] Demonstrating minting, pinning, and remounting threadId...`);
  // Type a message first
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
    await sleep(5000);
  }

  // Click "Mint + pin an explicit id"
  const pinBtn = page.locator('button:has-text("Mint + pin an explicit id")').first();
  if (await pinBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
    const pbBox = await pinBtn.boundingBox();
    if (pbBox) {
      await humanGlide(page, pbBox.x + pbBox.width / 2, pbBox.y + pbBox.height / 2, 18);
      await humanClick(page);
      console.log(`   ✓ Minted and pinned explicit threadId!`);
      await sleep(1500);
    }
  }

  // Click "Remount chat (new key)"
  const remountBtn = page.locator('button:has-text("Remount chat")').first();
  if (await remountBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
    const rbBox = await remountBtn.boundingBox();
    if (rbBox) {
      await humanGlide(page, rbBox.x + rbBox.width / 2, rbBox.y + rbBox.height / 2, 18);
      await humanClick(page);
      console.log(`   ✓ Remounted chat component!`);
      await sleep(2500);
    }
  }
};
