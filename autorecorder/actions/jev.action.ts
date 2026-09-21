import { type Page } from 'playwright';
import { humanClick, humanGlide, sleep } from '../core/overlays/cursor';
import { type ActionContext, type PageActionHandler, type PageRecordConfig } from '../core/types';
import { waitForDomSettled } from './page-ready';

/**
 * The Jev cookbook demo has no chat, so the standard handler has nothing to
 * type into. What it has instead is two halves, and the whole point of the take
 * is showing which one runs.
 *
 * Runs: the published `PanelSchema`, and the published panel markup drawing
 * both prepared controls from it.
 * Does not: the Jev decision. `choosePanel` needs `@typesafe-ai/sdk` and a key
 * from TypeSafe, so no `picker` agent is registered and the published `send`
 * returns early on `!isReady`.
 *
 * The handler therefore drives the bench, then presses the published "Find
 * options" button to show that it goes nowhere. A picker that *did* answer here
 * would mean something is standing in for the Jev call, which is the one
 * outcome this page must never show.
 */
async function clickByText(page: Page, text: string): Promise<boolean> {
  const button = page.locator(`button:has-text("${text}")`).first();
  const box = await button.boundingBox().catch(() => null);
  if (!box) return false;
  await humanGlide(page, box.x + box.width / 2, box.y + box.height / 2, 20);
  await humanClick(page);
  await sleep(400);
  await waitForDomSettled(page, { settleMs: 600 });
  return true;
}

export const runJevAction: PageActionHandler = async (
  page: Page,
  _config: PageRecordConfig,
  _rootPath: string,
  ctx: ActionContext,
) => {
  // 1. The clarification panel, drawn by the published markup from a
  //    PanelSchema.parse of the literal choose-panel.ts builds.
  if (!(await clickByText(page, 'Show the clarification panel'))) {
    ctx.fail('The bench never rendered — the prepared-control half did not mount.');
    return;
  }
  const clarification = await page
    .locator('section[aria-label="What kind of work are you doing?"] button')
    .count();
  if (clarification !== 2) {
    ctx.fail(
      `The clarification panel should draw the two published clarificationOptions; found ${clarification} button(s).`,
    );
  }
  await sleep(1500);

  // 2. The comparison panel, three rooms, catalog order -- Jev's `ranked`
  //    ordering is the part that is absent.
  await clickByText(page, 'Show the comparison panel');
  const comparison = await page
    .locator('section[aria-label="Choose a workspace"] button')
    .count();
  if (comparison !== 3) {
    ctx.fail(
      `The comparison panel should draw the three published candidates; found ${comparison} button(s).`,
    );
  }
  await sleep(1500);

  // 3. The published picker against the agent id the recipe registers and
  //    nothing here can. `isReady` false is the expected, correct result.
  const ready = await page
    .locator('[data-testid="jev-agent-ready"]')
    .first()
    .textContent()
    .catch(() => null);
  if (!ready) {
    ctx.warn('The agent probe never rendered, so `picker` was never checked against the runtime.');
  } else if (ready.trim().startsWith('true')) {
    ctx.fail(
      'useAgent({ agentId: "picker" }) reported isReady: true. Nothing in this repo can register a PickerAgent — something is standing in for the Jev decision layer.',
    );
  }

  // 4. The published `send`, as published. It returns early on `!isReady`.
  const input = page.locator('#request').first();
  const box = await input.boundingBox().catch(() => null);
  if (box) {
    await humanGlide(page, box.x + box.width / 2, box.y + box.height / 2, 20);
    await humanClick(page);
    await page.keyboard.type('I need somewhere to work', { delay: 45 });
    await sleep(600);
    // `send` starts with `if (!isReady || ... ) return;`, so with no `picker`
    // agent this sets no error and shows no spinner. Nothing happening is the
    // documented path, and it is what the clip shows.
    await clickByText(page, 'Find options');
    await sleep(2000);
    const alerted = await page.locator('p[role="alert"]').count();
    if (alerted > 0) {
      const text = await page.locator('p[role="alert"]').first().textContent();
      ctx.warn(`The published send() reached the runtime and reported: ${text}`);
    }
  } else {
    ctx.warn('The published picker form never rendered, so `send` was not exercised.');
  }
};
