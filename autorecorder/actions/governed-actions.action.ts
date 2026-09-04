import { type Page } from 'playwright';
import { humanClick, humanGlide, sleep } from '../core/overlays/cursor';
import { type PageActionHandler, type PageRecordConfig } from '../core/types';
import { sendPrompt, waitForAgentResponseCompletion } from '../core/actions';

/**
 * Governed Action Approval UI.
 *
 * The standard action would type the prompt and wait, which here means filming
 * an approval card that never gets approved -- the run stays suspended on the
 * tool call until someone clicks, so the clip would end on a spinner.
 *
 * So: prompt, let the card render, read the arguments block (the page is
 * emphatic that you show the exact arguments before approving), then click
 * "Approve and run" and wait for the agent to continue.
 *
 * Registration lives in `frontend/src/components/global-frontend-tools.tsx`
 * (the `#region governed-action` block), not in the demo route.
 */
const CARD = 'section:has-text("User approval required")';

export const runGovernedActionsAction: PageActionHandler = async (
  page: Page,
  config: PageRecordConfig,
) => {
  console.log(`   [Governed Actions] Prompting for a side-effecting action...`);
  const msgCount = await sendPrompt(page, config.prompt, { timeoutMs: 15000 });

  const card = page.locator(CARD).first();
  await card.waitFor({ state: 'visible', timeout: 25000 }).catch(() => {});

  if (!(await card.isVisible({ timeout: 3000 }).catch(() => false))) {
    // Not a hard failure: the model can answer in prose instead of calling the
    // tool, which is itself worth having on film.
    console.log(`   ⚠️  No approval card -- the model did not call the tool.`);
    await waitForAgentResponseCompletion(page, config.waitAfterPromptMs ?? 4000, msgCount);
    return;
  }

  const args = card.locator('pre').first();
  if (await args.isVisible({ timeout: 3000 }).catch(() => false)) {
    const box = await args.boundingBox();
    if (box) {
      await humanGlide(page, box.x + box.width / 2, box.y + box.height / 2, 22);
      await sleep(1800);
    }
  }

  const approve = card.locator('button:has-text("Approve and run")').first();
  if (await approve.isVisible({ timeout: 4000 }).catch(() => false)) {
    const box = await approve.boundingBox();
    if (box) {
      await humanGlide(page, box.x + box.width / 2, box.y + box.height / 2, 20);
      await sleep(400);
      await humanClick(page);
      console.log(`   ✓ Approved the action -- the run should now continue.`);
    }
  }

  await waitForAgentResponseCompletion(page, config.waitAfterPromptMs ?? 6000, msgCount);
};
