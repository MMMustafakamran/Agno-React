import { type Page } from 'playwright';
import { humanClick, humanGlide, sleep } from '../core/overlays/cursor';
import { type PageActionHandler, type PageRecordConfig } from '../core/types';
import { promptsFor, sendPrompt, waitForAgentResponseCompletion } from '../core/actions';
import { waitForDomSettled } from './page-ready';

/**
 * This app registers exactly two agent ids -- `default` and `agno_agent` -- and
 * both resolve to the same Agno process (see `api/copilotkit/[[...slug]]/route.ts`). The
 * demo renders one button per id, labelled with the id itself, and remounts the
 * chat on switch, so each id carries its own conversation.
 *
 * The point of the recording is that switching id starts a fresh conversation
 * against the same backend, so both turns are driven rather than one.
 */
const AGENT_IDS = ['default', 'agno_agent'] as const;

export const runRuntimeAction: PageActionHandler = async (
  page: Page,
  config: PageRecordConfig,
) => {
  const prompts = promptsFor(config);

  for (let i = 0; i < AGENT_IDS.length; i++) {
    const agentId = AGENT_IDS[i];
    console.log(
      `   [Copilot Runtime] ${i + 1}/${AGENT_IDS.length}: routing to "${agentId}"...`,
    );

    // The first id is already selected on load; only later ones need a click.
    if (i > 0) {
      const tab = page.locator(`button:text-is("${agentId}")`).first();
      if (await tab.isVisible({ timeout: 4000 }).catch(() => false)) {
        const box = await tab.boundingBox();
        if (box) {
          await humanGlide(page, box.x + box.width / 2, box.y + box.height / 2, 20);
          await humanClick(page);
        } else {
          await tab.click();
        }
        // The chat remounts on `key={agentId}`; wait for that to finish rather
        // than guessing at how long it takes.
        await sleep(400);
        await waitForDomSettled(page, { settleMs: 800 });
      }
    }

    const prompt = prompts[i] ?? prompts[prompts.length - 1];
    // A remount empties the message list, so the count restarts at 0 each time
    // -- read it fresh rather than carrying the previous id's total over.
    const msgCount = await sendPrompt(page, prompt, { timeoutMs: i === 0 ? 12000 : 8000 });
    await waitForAgentResponseCompletion(
      page,
      config.waitAfterPromptMs ?? 2000,
      msgCount,
    );
  }

  await humanGlide(page, 960, 300, 25);
  await sleep(1500);
};
