import { chromium } from 'playwright';
(async () => {
  const b = await chromium.launch({ headless: true });
  const p = await b.newPage();
  const pending = new Map<string, number>();
  p.on('request', (r) => pending.set(r.url(), Date.now()));
  p.on('requestfinished', (r) => pending.delete(r.url()));
  p.on('requestfailed', (r) => pending.delete(r.url()));
  const t0 = Date.now();
  try {
    await p.goto('https://docs.copilotkit.ai/agno/inspector', { waitUntil: 'domcontentloaded', timeout: 25000 });
    console.log(`domcontentloaded after ${((Date.now() - t0) / 1000).toFixed(1)}s`);
  } catch (e) {
    console.log(`GOTO TIMEOUT after ${((Date.now() - t0) / 1000).toFixed(1)}s`);
  }
  console.log('--- still pending at that moment ---');
  for (const [url, started] of pending) {
    console.log(`  ${((Date.now() - started) / 1000).toFixed(1)}s  ${url.slice(0, 110)}`);
  }
  await b.close();
})();
