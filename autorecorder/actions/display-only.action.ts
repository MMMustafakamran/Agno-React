import { type Page } from 'playwright';
import { humanGlide, sleep } from '../core/overlays/cursor';
import { type PageActionHandler, type PageRecordConfig } from '../core/types';
import { sendPrompt, waitForAgentResponseCompletion } from '../core/actions';
import { captureErrors, openNextJsErrorOverlay } from './error-console';

/**
 * `useComponent` renders a React component from a tool call — here a weather
 * card, with no handler and nothing to interact with.
 *
 * This page used to die after the card rendered: `useComponent` is a
 * `useFrontendTool` underneath, so it hits the same resume path, and the agent
 * had no `db` to persist the paused run into — "Frontend tool resume requires a
 * database". `backend/agent.py` now configures one, following the requirement
 * the docs made explicit on 2026-08-30; re-recorded on 2026-08-31, the card
 * renders and the reply completes.
 *
 * The error overlay is still wired up, but only fires on what the browser
 * actually reports. Scripting it would put an invented defect on screen.
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

    // A resume failure arrives after the answer; give it a moment to surface
    // before calling the run clean.
    await sleep(3000);

    const captured = errors.entries();
    if (captured.length === 0) {
      console.log(`   ✅ Run completed with nothing reported — no error overlay.`);
      await sleep(config.waitAfterPromptMs ?? 4000);
      return;
    }

    console.log(`   🧾 Browser reported ${captured.length} error(s) — surfacing the overlay.`);
    await openNextJsErrorOverlay(page, captured, {
      errorType: 'Console Error',
      callStackFrames: 4,
      waitMs: config.waitAfterPromptMs ?? 4000,
    });
  } finally {
    errors.stop();
  }
};
