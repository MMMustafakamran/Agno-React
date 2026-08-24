import { type Page } from 'playwright';
import { humanGlide, sleep } from '../core/overlays/cursor';
import { type PageActionHandler, type PageRecordConfig } from '../core/types';
import { sendPrompt, waitForAgentResponseCompletion } from '../core/actions';
import { captureErrors, openNextJsErrorOverlay } from './error-console';

/**
 * `useComponent` renders a React component from a tool call — here a weather
 * card, with no handler and nothing to interact with.
 *
 * On this stack the page does not finish cleanly: the card renders, the answer
 * streams, and then the run dies with Agno's "Frontend tool resume requires a
 * database". The agent needs somewhere to persist state before it can resume
 * after an externally-executed tool, and this repo configures no `db`.
 *
 * The recording shows both halves. Ending at the card would imply a working
 * feature; failing the page would produce nothing at all. Neither helps someone
 * judging whether this integration is ready, so the error goes on screen.
 */
export const runDisplayOnlyAction: PageActionHandler = async (
  page: Page,
  config: PageRecordConfig,
) => {
  const errors = captureErrors(page);

  try {
    console.log(`   [Display Only Component] Prompting the agent to render WeatherCard...`);
    const msgCount = await sendPrompt(page, config.prompt, { timeoutMs: 12000 });

    console.log(`   Waiting for the generative WeatherCard to render inline...`);
    const weatherCard = page.locator('div:has-text("Tokyo"), div:has-text("77°F")').last();
    await weatherCard.waitFor({ state: 'visible', timeout: 25000 }).catch(() => {});

    if (await weatherCard.isVisible({ timeout: 3000 }).catch(() => false)) {
      const box = await weatherCard.boundingBox();
      if (box) {
        console.log(`   🎯 Card rendered at (${Math.round(box.x)}, ${Math.round(box.y)})`);
        await humanGlide(page, box.x + box.width / 2, box.y + box.height / 2, 22);
        await sleep(1500);
      }
    }

    // The reply usually completes before the failure lands, so a throw here is
    // only fatal when the browser also reported nothing -- that would be an
    // unexplained silence rather than the known limitation.
    try {
      await waitForAgentResponseCompletion(page, 1500, msgCount);
    } catch (e) {
      if (errors.entries().length === 0) throw e;
      console.log(`   ℹ️ No reply completed, but the browser reported an error — showing it.`);
    }

    // The failure arrives after the answer; give it a moment to surface.
    await sleep(3000);

    const captured = errors.entries();
    console.log(`   🧾 Surfacing Next.js error overlay on screen.`);
    await openNextJsErrorOverlay(page, captured, {
      message: 'Frontend tool resume requires a database',
      errorType: 'Console Error',
      versionText: 'Next.js 16.3.2 Turbopack',
      callStackFrames: 4,
      waitMs: config.waitAfterPromptMs ?? 4000,
    });
  } finally {
    errors.stop();
  }
};
