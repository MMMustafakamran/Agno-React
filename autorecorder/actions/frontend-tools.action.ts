import { type Page } from 'playwright';
import { humanGlide, sleep } from '../core/overlays/cursor';
import { type PageActionHandler, type PageRecordConfig } from '../core/types';
import { sendPrompt, waitForAgentResponseCompletion } from '../core/actions';
import { captureErrors, openDevToolsConsole } from './error-console';

/**
 * Browser-executed tools: the agent calls `sayHello`, the handler runs in this
 * tab and updates the panel beside the chat.
 *
 * The browser half works — the greeting panel fills in. The *run* does not
 * finish: returning a result from an externally-executed tool is exactly the
 * point at which Agno needs a database to resume from, and this repo configures
 * no `db`, so the backend logs "Frontend tool resume requires a database" and
 * the run stops there.
 *
 * That makes this the page most worth recording carefully: the feature visibly
 * half-works, and a video that stopped at the greeting would be misleading. The
 * panel effect is shown, then the error that followed it.
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

    await sleep(3000);

    const captured = errors.entries();
    if (captured.length > 0) {
      console.log(`   🧾 Surfacing ${captured.length} browser error(s) on screen.`);
      await openDevToolsConsole(page, captured, {
        note: 'The browser tool executed; Agno needs a configured database to resume afterwards.',
      });
      await sleep(config.waitAfterPromptMs ?? 4000);
    } else {
      console.log(`   ✓ No browser errors captured — the run completed cleanly.`);
      await sleep(config.waitAfterPromptMs ?? 4000);
    }
  } finally {
    errors.stop();
  }
};
