import { type Page } from 'playwright';
import { humanGlide, sleep } from '../core/overlays/cursor';
import { type PageActionHandler, type PageRecordConfig } from '../core/types';
import { sendPrompt, waitForAgentResponseCompletion } from '../core/actions';

/**
 * The error log fed by the provider's `onError`.
 *
 * The recorder runs against a healthy stack, so the expected footage is a
 * *quiet* log beside a working chat -- "0 captured" is the healthy state, and
 * the panel says so itself. Provoking a real error would mean killing the Agno
 * process mid-recording, which the engine has no way to do and which would make
 * every later page fail too.
 */
export const runErrorDebuggingAction: PageActionHandler = async (
  page: Page,
  config: PageRecordConfig,
) => {
  console.log(`   [Error Debugging] Showing the live onError log beside the chat...`);
  // Left column is the log, right column is the chat.
  await humanGlide(page, 420, 260, 22);
  await sleep(1800);

  const msgCount = await sendPrompt(page, config.prompt, { timeoutMs: 12000 });
  await waitForAgentResponseCompletion(page, config.waitAfterPromptMs ?? 4000, msgCount);

  // Back to the log to close on it: still empty, which is the point.
  await humanGlide(page, 420, 380, 22);
  await sleep(2000);
};
