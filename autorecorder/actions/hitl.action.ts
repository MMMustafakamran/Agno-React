import { type Page } from 'playwright';
import { humanClick, humanGlide, sleep } from '../core/overlays/cursor';
import { type PageActionHandler, type PageRecordConfig } from '../core/types';
import { sendPrompt, waitForAgentResponseCompletion } from '../core/actions';

/**
 * This app's interrupt is `offerOptions`, not an approve/reject gate.
 *
 * `useHumanInTheLoop` renders a card headed "Pick one:" with one button per
 * option, and each button is labelled with the *option text the agent invented*
 * -- so there is no fixed string to match on. The card is the anchor; the
 * buttons are whatever is inside it.
 *
 * Registration lives in `frontend/src/components/global-frontend-tools.tsx`
 * (the `#region human-in-the-loop` block), not in the demo route.
 */
const OPTION_BUTTON = 'div:has(> p:text-is("Pick one:")) button';

export const runHitlAction: PageActionHandler = async (
  page: Page,
  config: PageRecordConfig,
) => {
  console.log(`   [Human in the Loop] Prompting to trigger the offerOptions interrupt...`);
  const msgCount = await sendPrompt(page, config.prompt, { timeoutMs: 12000 });

  console.log(`   Waiting for the option card to render in the message stream...`);
  const firstOption = page.locator(OPTION_BUTTON).first();
  await firstOption.waitFor({ state: 'visible', timeout: 25000 }).catch(() => {});

  if (!(await firstOption.isVisible({ timeout: 3000 }).catch(() => false))) {
    // The run is paused waiting for `respond`, so nothing further will ever
    // stream. Failing here is the honest outcome -- the interrupt is the page.
    throw new Error(
      'Human-in-the-loop card never rendered: no option button appeared within 25s. ' +
        'Either the agent answered in plain text instead of calling offerOptions, ' +
        'or the tool is no longer registered at the app root.',
    );
  }

  // Let the options sit on screen long enough to be readable before clicking.
  await sleep(2000);

  const label = (await firstOption.textContent().catch(() => ''))?.trim();
  const box = await firstOption.boundingBox();
  if (box) {
    console.log(`   🎯 Choosing option "${label}"`);
    await humanGlide(page, box.x + box.width / 2, box.y + box.height / 2, 20);
    await sleep(600);
    await humanClick(page);
  } else {
    await firstOption.click();
  }

  // Only now does the run resume, so this is the reply that matters.
  await waitForAgentResponseCompletion(page, config.waitAfterPromptMs ?? 4000, msgCount);
};
