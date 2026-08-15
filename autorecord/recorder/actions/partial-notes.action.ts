import { type Page } from 'playwright';
import { humanGlide, sleep } from '../overlays/cursor';
import { showNotepadNote } from '../overlays/notepad';
import { type PageActionHandler } from '../types';

export const runIntroductionAction: PageActionHandler = async (page: Page) => {
  console.log(`   [Introduction] Showcasing orientation and connection check...`);
  await humanGlide(page, 450, 300, 22);
  await sleep(2000);
  await humanGlide(page, 960, 500, 22);
  await sleep(2500);

  await showNotepadNote(page, 'intro_notes.txt', [
    'CopilotKit + Agno Test Suite Harness.',
    'Verifies communication between Next.js frontend and Python Agno AgentOS.',
    'Backend provides live AG-UI SSE stream on port 8000.',
  ]);
};

export const runThreadsOverviewAction: PageActionHandler = async (page: Page) => {
  console.log(`   [Threads Overview] Showcasing persistence architecture overview...`);
  await humanGlide(page, 450, 300, 22);
  await sleep(2000);
  await humanGlide(page, 960, 600, 22);
  await sleep(2000);

  await showNotepadNote(page, 'threads_overview_notes.txt', [
    'Rich Threads: Durable event storage and replay model.',
    'Stores AG-UI event history across reloads, sessions, and devices.',
    'Served by CopilotKit Enterprise Intelligence Platform.',
  ]);
};

export const runThreadsImportAction: PageActionHandler = async (page: Page) => {
  console.log(`   [Threads Import] Showcasing history import CLI documentation...`);
  await humanGlide(page, 450, 350, 22);
  await sleep(2000);

  await showNotepadNote(page, 'threads_import_notes.txt', [
    'Synchronize Thread History Documentation.',
    'Backfills legacy chat history into CopilotKit thread store.',
    'Usage: npx copilotkit@latest import --source ... --dry-run',
  ]);
};

export const runThreadsArchitectureAction: PageActionHandler = async (page: Page) => {
  console.log(`   [Threads Architecture] Showcasing persistence replay architecture...`);
  await humanGlide(page, 450, 400, 22);
  await sleep(2000);

  await showNotepadNote(page, 'threads_arch_notes.txt', [
    'Threads Persistence Architecture.',
    'Event replay model: Durable history, live reconnect, auto-naming, locks.',
    'Runtime writes events as SSE and synchronizes state via WebSocket.',
  ]);
};

export const runInteractiveStubAction: PageActionHandler = async (page: Page) => {
  console.log(`   [Interactive Stub] Showcasing upstream stub documentation...`);
  await humanGlide(page, 450, 300, 22);
  await sleep(2000);

  await showNotepadNote(page, 'interactive_stub_notes.txt', [
    'Upstream doc page is currently an empty placeholder stub.',
    'Route exists to keep navigation and status table complete.',
    'Interactive HITL is fully demonstrated under /human-in-the-loop.',
  ]);
};
