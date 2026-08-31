import { type Page } from 'playwright';
import { humanClick, humanGlide, sleep } from '../core/overlays/cursor';
import { type PageActionHandler, type PageRecordConfig } from '../core/types';
import { waitForAgentResponseCompletion } from '../core/actions';

/**
 * Deliberately NOT routed through the shared sendPrompt() helper.
 *
 * This page hand-builds its input and Send button over useAgent/useCopilotKit,
 * and its submit path is timing-sensitive in a way the shared helper breaks:
 * switching it over made the run fail reproducibly with
 * `agent_run_error_event HTTP 405` from the Python backend and no response at
 * all, while this implementation streams reliably. The difference does not
 * reproduce headlessly, so the exact trigger is not pinned down yet.
 *
 * ── The composer used to be unreachable ────────────────────────────────────
 * The input and Send button share one flex row at the bottom of the chat
 * column. While that column was `h-full`, the row sat at roughly y=1026..1064
 * at 1080p -- underneath the simulated taskbar, which owns the bottom 48px and
 * swallows clicks. A real click never landed, focus never moved, every typed
 * character went nowhere, and the clip showed an empty box. This handler worked
 * around it by gliding the cursor for the camera and setting focus
 * programmatically, then submitting via Enter because Send was buried too.
 *
 * The demo page now centres the chat panel instead, so the composer sits around
 * y=737 with ~300px of clearance. Both controls are genuinely clickable, so the
 * recording drives them the way a person would -- which is the point of the
 * clip. The programmatic focus survives only as a fallback, because a workaround
 * that silently covers for a regression is how the overlap went unnoticed the
 * first time.
 */
const INPUT = 'input[placeholder="Type a message..."]';
const SEND_BUTTON = 'form button[type="submit"]';

/**
 * Assistant bubbles only. Both roles carry `.max-w-md`; the user's is the one
 * with `.ml-auto`, so excluding it leaves the agent's replies.
 */
const ASSISTANT_BUBBLE = '.max-w-md:not(.ml-auto)';

export const runHeadlessUiAction: PageActionHandler = async (
  page: Page,
  config: PageRecordConfig,
) => {
  console.log(`   [Headless UI] Waiting for the hand-built interface to settle...`);
  const inputLocator = page.locator(INPUT).first();
  await inputLocator.waitFor({ state: 'visible', timeout: 15000 });
  await sleep(800);

  // Click it for real. If the panel ever drifts back under the taskbar the
  // click is swallowed, so verify focus actually moved and fall back rather
  // than typing into nothing.
  const inputBox = await inputLocator.boundingBox();
  if (inputBox) {
    await humanGlide(page, inputBox.x + 80, inputBox.y + inputBox.height / 2, 20);
    await sleep(200);
    await humanClick(page);
  }
  await sleep(300);

  const focused = await inputLocator
    .evaluate((el) => el === document.activeElement)
    .catch(() => false);
  if (!focused) {
    console.warn(`   ⚠️ Click did not focus the composer; is it under the taskbar again?`);
    await inputLocator.focus();
  }
  await sleep(400);

  console.log(`   [Headless UI] Typing prompt: "${config.prompt}"...`);
  const before = await page.locator(ASSISTANT_BUBBLE).count().catch(() => 0);
  await page.keyboard.type(config.prompt, { delay: 35 });
  await sleep(350);

  // A controlled input that never received the keystrokes reads back empty --
  // catch that here rather than discovering it on the finished video.
  let value = await inputLocator.inputValue().catch(() => '');
  if (!value) {
    await inputLocator.fill(config.prompt);
    await sleep(200);
    value = await inputLocator.inputValue().catch(() => '');
  }
  if (!value.trim()) {
    throw new Error(
      `Headless UI prompt was never entered: "${INPUT}" is still empty after typing. ` +
        'The input is at the bottom of the viewport, under the taskbar overlay -- ' +
        'check that focus is being set programmatically rather than by clicking.',
    );
  }

  // Send is visible now, so click it -- the button is part of what this page
  // demonstrates. Enter stays as the fallback: the form handles both, and a
  // missed click should not cost the whole recording.
  const sendBox = await page.locator(SEND_BUTTON).first().boundingBox().catch(() => null);
  if (sendBox) {
    await humanGlide(page, sendBox.x + sendBox.width / 2, sendBox.y + sendBox.height / 2, 18);
    await sleep(250);
    await humanClick(page);
  } else {
    await page.keyboard.press('Enter');
  }
  await sleep(600);

  // A controlled input clears on submit, so a value still sitting there means
  // the submit did not take.
  const remaining = await inputLocator.inputValue().catch(() => '');
  if (remaining.trim().length > 0) {
    await inputLocator.focus();
    await page.keyboard.press('Enter');
  }

  // Shared detector, pointed at this page's own bubbles -- so a page that never
  // answers fails the run instead of quietly producing a video of an idle chat.
  await waitForAgentResponseCompletion(
    page,
    config.waitAfterPromptMs ?? 4000,
    before,
    ASSISTANT_BUBBLE,
  );
};
