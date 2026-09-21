import { type Page } from 'playwright';
import { humanClick, humanGlide, sleep } from '../core/overlays/cursor';
import { type ActionContext, type PageActionHandler, type PageRecordConfig } from '../core/types';
import { promptsFor, sendPrompt, waitForAgentResponseCompletion } from '../core/actions';
import { waitForDomSettled } from './page-ready';

/**
 * The three markdownRenderer techniques, in the order the demo tabs them.
 *
 * Level 3 replaces the renderer with the page's `PlainText`, which renders the
 * raw markdown into a `pre`. That removes every class the default assistant
 * message carries, so the standard reply detection -- which looks for
 * CopilotKit's own message markup -- would report "agent never responded" on a
 * level that is working. Same shape as the slots handler's level 3, and the
 * same fix: name the selector the custom renderer actually produces.
 */
const MARKDOWN_LEVELS: {
  tabLabel: string | null;
  messageSelector?: string;
}[] = [
  { tabLabel: null },
  { tabLabel: '2 · class string' },
  { tabLabel: '3 · replace the renderer', messageSelector: 'pre.whitespace-pre-wrap' },
];

/**
 * The claims this page makes are attribute-level, so the verdict is read off
 * the probe row rather than off the chat: `node` must be absent (the snippet
 * destructures it out), and the hardened link pair must survive the override.
 */
export const runMarkdownAction: PageActionHandler = async (
  page: Page,
  config: PageRecordConfig,
  _rootPath: string,
  ctx: ActionContext,
) => {
  const prompts = promptsFor(config);

  for (let level = 0; level < MARKDOWN_LEVELS.length; level++) {
    const { tabLabel, messageSelector } = MARKDOWN_LEVELS[level];
    console.log(`   [Markdown] ${level + 1}/${MARKDOWN_LEVELS.length}: Level ${level + 1}...`);

    if (tabLabel) {
      const tab = page.locator(`button:has-text("${tabLabel}")`).first();
      const tBox = await tab.boundingBox();
      if (tBox) {
        await humanGlide(page, tBox.x + tBox.width / 2, tBox.y + tBox.height / 2, 20);
        await humanClick(page);
      }
      await sleep(400);
      await waitForDomSettled(page, { settleMs: 800 });
    }

    const prompt = prompts[level] ?? prompts[prompts.length - 1];
    const msgCount = await sendPrompt(page, prompt, {
      timeoutMs: level === 0 ? 8000 : 6000,
      messageSelector,
    });

    await waitForAgentResponseCompletion(
      page,
      config.waitAfterPromptMs ?? 2000,
      msgCount,
      messageSelector,
    );

    // The probe polls once a second; give it one window to catch the settled
    // markup before reading it.
    await sleep(1200);
    const anchor = await page
      .locator('[data-testid="markdown-probe-a"]')
      .first()
      .textContent()
      .catch(() => null);

    if (level === 0) {
      if (!anchor) {
        ctx.warn(
          'Level 1 produced no anchor to read — the reply carried no link, so the components-map claims were not exercised.',
        );
      } else {
        if (/\bnode="/.test(anchor)) {
          ctx.fail(
            `The page says destructuring \`node\` out removes it; the rendered anchor still carries it: ${anchor}`,
          );
        }
        if (!/rel="noopener noreferrer"/.test(anchor) || !/target="_blank"/.test(anchor)) {
          ctx.fail(
            `Spreading the rest was supposed to keep the renderer's link hardening; the rendered anchor reads: ${anchor}`,
          );
        }
        if (!/class="my-link"/.test(anchor)) {
          ctx.warn(
            `The components map did not reach the anchor — expected class="my-link", got: ${anchor}`,
          );
        }
      }
    }

    // Level 3 replaces the renderer, so Streamdown's own markup must be gone.
    if (level === 2 && anchor && /data-streamdown/.test(anchor)) {
      ctx.warn(
        'Level 3 replaced the renderer, yet a data-streamdown attribute survived in the probe row.',
      );
    }
  }
};
