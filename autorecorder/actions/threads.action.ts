import { type Page } from 'playwright';
import { beat, humanClick, humanGlide, sleep } from '../core/overlays/cursor';
import { type PageActionHandler, type PageRecordConfig } from '../core/types';
import { sendPrompt, waitForAgentResponseCompletion } from '../core/actions';

/**
 * The three Rich Threads demos.
 *
 * Threads need CopilotKit Intelligence and this repo ships no credential, so
 * the drawer renders its locked view and `useThreads` returns an empty list.
 * That is the *expected* unentitled result, not a failure -- see the repo
 * README's status table -- and it is worth showing on video, because it proves
 * the component mounted and resolved its entitlement rather than silently doing
 * nothing. The drawer page dropped its "License" heading for "Intelligence
 * access" on 2026-09-21; the credential it resolves through the Runtime is the
 * same one.
 *
 * The chat beside each of them needs no entitlement, so every one of these
 * still drives a real agent turn and still fails honestly if the agent goes
 * quiet.
 */

/** Rests the cursor on a panel for long enough to read it. */
async function dwell(page: Page, x: number, y: number, ms = 1500): Promise<void> {
  await humanGlide(page, x, y, 22);
  await sleep(ms);
}

/** Clicks a control if it is on screen; returns whether it was. */
async function clickIfVisible(
  page: Page,
  selector: string,
  label: string,
  timeout = 3000,
): Promise<boolean> {
  const control = page.locator(selector).first();
  if (!(await control.isVisible({ timeout }).catch(() => false))) {
    console.log(`   (skipped: ${label} not on screen)`);
    return false;
  }
  const box = await control.boundingBox();
  if (box) {
    await humanGlide(page, box.x + box.width / 2, box.y + box.height / 2, 18);
    await humanClick(page);
  } else {
    await control.click();
  }
  console.log(`   ✓ ${label}`);
  return true;
}

export const runThreadsDrawerAction: PageActionHandler = async (
  page: Page,
  config: PageRecordConfig,
) => {
  console.log(`   [Threads Drawer] Showing the drawer docked beside the chat...`);
  // The drawer occupies the left edge; both it and the chat share one
  // CopilotChatConfigurationProvider, which is what needs no wiring of our own.
  await dwell(page, 200, 320, 2000);

  const msgCount = await sendPrompt(page, config.prompt, { timeoutMs: 12000 });
  await waitForAgentResponseCompletion(page, config.waitAfterPromptMs ?? 4000, msgCount);
};

export const runThreadsHeadlessAction: PageActionHandler = async (
  page: Page,
  config: PageRecordConfig,
  _rootPath,
  ctx,
) => {
  console.log(`   [Headless Threads] Showing the hand-built useThreads list...`);
  await dwell(page, 240, 280, 2000);

  // "Show archived" re-queries with includeArchived -- visible proof the list is
  // ours and not a prebuilt component, even while the list itself is empty.
  await clickIfVisible(page, 'input[type="checkbox"]', 'toggled "Show archived"', 2500);
  await beat(1200);

  const msgCount = await sendPrompt(page, config.prompt, { timeoutMs: 12000 });
  await waitForAgentResponseCompletion(page, config.waitAfterPromptMs ?? 4000, msgCount);

  // The section the page added under the four steps -- one agent per thread.
  // Two `useAgent({ agentId, runtimeAgentId, threadId })` hooks mount here,
  // each pinned to its own thread; a panel that never paints means the private
  // proxied agent did not register, which is the claim being tested.
  console.log(`   [ThreadsHeadless] Resting on the per-thread agents...`);
  const perThread = page.locator('[data-testid="per-thread-agents"]');
  if (await perThread.first().isVisible({ timeout: 8000 }).catch(() => false)) {
    await dwell(page, 640, 620, 2500);
    const ready = await page
      .locator('[data-testid="thread-agent-run"]')
      .first()
      .isEnabled({ timeout: 4000 })
      .catch(() => false);
    if (ready) console.log(`   ✅ Thread-scoped agent is ready; runAgent() addresses its own thread.`);
    else ctx.warn('The thread-scoped agent never became ready (isReady stayed false), so runAgent() could not address its thread.');
  } else {
    ctx.fail('The per-thread agent panel never rendered -- useAgent({ agentId, runtimeAgentId, threadId }) did not mount.');
  }
};

export const runThreadsLifecycleAction: PageActionHandler = async (
  page: Page,
  config: PageRecordConfig,
) => {
  console.log(`   [Threads Lifecycle] Sending a message so there is a thread to lose...`);
  const msgCount = await sendPrompt(page, config.prompt, { timeoutMs: 12000 });
  await waitForAgentResponseCompletion(page, config.waitAfterPromptMs ?? 3000, msgCount);

  // Remount with no pinned id: the fallback id is a useMemo, so the conversation
  // is silently replaced. This is the failure mode the doc page is about.
  console.log(`   Remounting with no pinned id -- the conversation should vanish...`);
  await clickIfVisible(page, 'button:has-text("Remount chat")', 'clicked "Remount chat"');
  await beat(2500);

  // Then the fix: pin an explicit id and remount again -- it survives.
  console.log(`   Pinning an explicit threadId, then remounting again...`);
  await clickIfVisible(
    page,
    'button:has-text("Mint + pin an explicit id")',
    'clicked "Mint + pin an explicit id"',
  );
  await beat(1500);
  await clickIfVisible(page, 'button:has-text("Remount chat")', 'clicked "Remount chat"');
  await beat(1500);

  // The id readout at the top is the thing to look at, not the chat.
  await dwell(page, 480, 200, config.waitAfterPromptMs ?? 3000);
};
