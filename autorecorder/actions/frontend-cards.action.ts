import { type Page } from 'playwright';
import { promptsFor, sendPrompt, waitForAgentResponseCompletion } from '../core/actions';
import { sleep } from '../core/overlays/cursor';
import { type ActionContext, type PageActionHandler, type PageRecordConfig } from '../core/types';
import { copilotkitVersionLine, markServerLogs, showEvidence } from './error-evidence';
import { glideClick, glideTo, visibleWithin, waitForText } from './glide-click';

/**
 * Frontend-Driven Cards -- a card in, a turn out, and the payload between them.
 *
 * The page makes two claims, and the take films both. The card renders in the
 * transcript (click "Simulate: deployment finished"), and the agent never
 * receives it (send a turn, then read the probe row that prints the roles in
 * the run request that actually left the browser). The prompt asks the agent
 * what it was shown, so its own answer is on camera too.
 *
 * The click waits for `isReady true` on purpose. A card added while the runtime
 * is still connecting goes to a provisional agent and is silently dropped when
 * the real one arrives -- a finding on the route page, reproduced 3/3, but not
 * what this take is about. Clicking early would film that instead, randomly.
 */

const CARD = '.rounded-lg.border.p-4:has-text("Deployment finished")';

const NOTE = [
  'frontend cards - works here, with two catches',
  '',
  'card renders, payload row says user only, agent says it saw no card',
  'agno registers an agent called default, so the bare useAgent() finds one.',
  'mastra and deep agents do not -> "agent default not found", route crashes',
  '',
  'a card added before the runtime connects just disappears, no error.',
  'step 3 watcher is never mounted by step 2, socket url is a placeholder',
];

export const runFrontendCardsAction: PageActionHandler = async (
  page: Page,
  config: PageRecordConfig,
  rootPath: string,
  ctx: ActionContext,
) => {
  const logs = markServerLogs(rootPath);
  const state = page.locator('[data-testid=agent-state]');
  const ready = await waitForText(state, (t) => t.includes('isReady true'), 60_000);
  if (!ready.includes('isReady true')) {
    ctx.fail(`useAgent() never became ready (last: "${ready}") -- the card would go to a provisional agent`);
  }
  await glideTo(page, state, 1200);

  console.log('   [Frontend Cards] adding the activity card...');
  await glideClick(page, page.locator('[data-testid=add-activity-card]'));
  await sleep(1200);
  const card = page.locator(CARD).first();
  if (!(await visibleWithin(card, 5000))) {
    ctx.fail('The activity card never rendered in the transcript');
  } else {
    await glideTo(page, card, 1500);
  }

  const [prompt] = promptsFor(config);
  const msgCount = await sendPrompt(page, prompt);
  await waitForAgentResponseCompletion(page, config.waitAfterPromptMs ?? 4000, msgCount);

  const payload = page.locator('[data-testid=roles-payload]');
  const roles = await waitForText(payload, (t) => !t.startsWith('no run'), 10_000);
  if (roles.startsWith('no run')) {
    ctx.warn('No run payload was captured, so the "agent never sees it" claim went unchecked');
  } else if (/\bactivity\b/.test(roles.split('(')[0])) {
    ctx.fail(`The activity message reached the agent: payload roles were "${roles}"`);
  }
  await glideTo(page, payload, 2500);

  await showEvidence(page, logs, {
    fileName: 'frontend-cards.txt',
    text: [...NOTE, '', copilotkitVersionLine(rootPath)].join('\n'),
  }, { relevant: /activity|app-event-card|frontend-cards|\/agent\/[^/]+\/run/ });
};
