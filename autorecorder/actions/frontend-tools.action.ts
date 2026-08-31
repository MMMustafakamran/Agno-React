import { type Page } from 'playwright';
import { humanGlide, sleep } from '../core/overlays/cursor';
import { type PageActionHandler, type PageRecordConfig } from '../core/types';
import { sendPrompt, waitForAgentResponseCompletion } from '../core/actions';
import { captureErrors, openNextJsErrorOverlay } from './error-console';

/**
 * Browser-executed tools: the agent calls `sayHello`, the handler runs in this
 * tab and updates the panel beside the chat.
 *
 * This page used to end in a failure. Returning a result from an
 * externally-executed tool is the point at which Agno needs somewhere to
 * persist the paused run, and the agent configured none, so the run stopped
 * with "Frontend tool resume requires a database" after the panel had already
 * updated. The 2026-08-30 doc sync made that requirement explicit and
 * `backend/agent.py` now sets `db=SqliteDb(...)`; re-recorded on 2026-08-31,
 * the tool runs and the reply completes.
 *
 * The overlay stays wired up but is no longer scripted: it appears only if the
 * browser actually reports something, and shows what it reported. Recording a
 * green run under a hardcoded error message would invent a defect, which is the
 * same failure as hiding a real one.
 */
export const runFrontendToolsAction: PageActionHandler = async (
  page: Page,
  config: PageRecordConfig,
) => {
  const errors = captureErrors(page);

  try {
    console.log(`   [Frontend Tools] Prompting the agent to call the browser sayHello tool...`);
    const msgCount = await sendPrompt(page, config.prompt, { timeoutMs: 12000 });

    // The tool executes in this tab, so its effect lands in the left-hand panel
    // whether or not the run afterwards survives. That effect is the feature.
    const greeting = page.locator('p:has-text("Hello,")').first();
    await greeting.waitFor({ state: 'visible', timeout: 25000 }).catch(() => {});

    if (await greeting.isVisible({ timeout: 3000 }).catch(() => false)) {
      const box = await greeting.boundingBox();
      if (box) {
        console.log(`   🎯 Browser tool ran — greeting panel updated.`);
        await humanGlide(page, box.x + Math.min(box.width / 2, 200), box.y + box.height / 2, 22);
        await sleep(2000);
      }
    } else {
      console.warn(`   ⚠️ Greeting panel never updated — the browser tool may not have run.`);
    }

    try {
      await waitForAgentResponseCompletion(page, 1500, msgCount);
    } catch (e) {
      if (errors.entries().length === 0) throw e;
      console.log(`   ℹ️ Run never completed, but the browser reported an error — showing it.`);
    }

    // A resume failure lands after the reply, so give it a moment to arrive
    // before deciding the run was clean.
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
