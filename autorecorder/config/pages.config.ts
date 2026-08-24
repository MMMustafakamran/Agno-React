/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  ADAPT THIS FILE — 3 of 3
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * One entry per doc page, in the order the doc nav lists them.
 *
 * Entries are deliberately short. `docUrl`, `demoUrl` and the output filename
 * are derived from `project.config.ts` plus the fields below, so no entry can
 * point at the wrong framework's docs and filenames stay in nav order without
 * anyone numbering them by hand.
 *
 * Adapting means: delete the pages this framework does not document, add the
 * ones it does, and fix the line ranges. `npm run doctor` then tells you which
 * ranges no longer point at real code.
 *
 * ── Scope, for this repo ───────────────────────────────────────────────────
 * `route` + `demoSuffix` is the only demo URL a page can have, and the doctor
 * errors on any that is not 200. This app's 21 doc routes include 5 that are
 * reference material with no `demo-chat` page — `/`, `/threads`,
 * `/threads/import`, `/threads/architecture`, and
 * `/generative-ui/your-components/interactive` (an upstream stub). They are
 * deliberately absent below rather than registered and broken. See the repo
 * README's autorecorder section.
 *
 * Everything here mirrors `frontend/src/lib/nav-config.ts`, which is the app's
 * single source of truth for route -> doc-page mapping. `docPath` is that
 * file's `docPath` minus its leading `/agno`.
 *
 * ── The line ranges ────────────────────────────────────────────────────────
 * `startLine`/`endLine` are what the simulated IDE highlights. They are
 * hardcoded, which means they drift the moment someone edits a demo page.
 * Doctor guards this: where a file carries `[!code highlight]` or `#region`
 * markers, it checks the range still covers one and names the marker's current
 * line when it does not. Keep those markers in the frontend and the guard keeps
 * working. (Note the counted form, `[!code highlight:10]`, is not a marker the
 * doctor recognises, so files carrying only that form are unguarded.)
 */

import { definePages } from '../core/types';

export const PAGES = definePages([
  {
    id: 'quickstart',
    name: 'Quickstart',
    videoName: 'Quickstart',
    docPath: 'quickstart',
    route: 'quickstart',
    // Quickstart leads with the dependency manifest, always: a demo is only
    // meaningful against known versions, and CopilotKit and AG-UI both move fast
    // enough that "it worked" is not a claim you can make without them on screen.
    // The `overrides` block is inside the range on purpose -- the @ag-ui/client
    // pin is a real constraint, not noise.
    ideFile: 'frontend/package.json',
    startLine: 12,
    endLine: 27,
    // Then the path itself: the chat, the runtime binding, and the Python side
    // that answers it.
    extraTabs: [
      {
        filePath: 'frontend/src/app/quickstart/demo-chat/page.tsx',
        startLine: 13,
        endLine: 26,
      },
      {
        filePath: 'frontend/src/app/api/copilotkit/[[...slug]]/route.ts',
        startLine: 14,
        endLine: 28,
      },
      {
        filePath: 'backend/main.py',
        startLine: 43,
        endLine: 53,
      },
    ],
    prompt: 'Can you tell me a joke?',
    waitAfterPromptMs: 4000,
  },
  {
    id: 'prebuilt-components',
    name: 'Prebuilt Components',
    videoName: 'PrebuiltComponents',
    docPath: 'prebuilt-components',
    route: 'prebuilt-components',
    ideFile: 'frontend/src/app/prebuilt-components/demo-chat/page.tsx',
    startLine: 58,
    endLine: 94,
    prompt: 'What is CopilotKit?',
    prompts: ['What is CopilotKit?'],
    waitAfterPromptMs: 1500,
  },
  {
    id: 'threads-drawer',
    name: 'Rich Threads - Threads Drawer',
    videoName: 'ThreadsDrawer',
    docPath: 'prebuilt-components/copilot-threads-drawer',
    route: 'threads/drawer',
    ideFile: 'frontend/src/app/threads/drawer/demo-chat/page.tsx',
    startLine: 19,
    endLine: 34,
    // Threads are licensed. Unlicensed, the drawer renders its locked view --
    // which is the correct result, and what this recording shows. The chat
    // beside it is not licensed and answers normally.
    prompt: 'Give me a one-line summary of what threads are for.',
    waitAfterPromptMs: 4000,
  },
  {
    id: 'threads-headless',
    name: 'Rich Threads - Headless Threads',
    videoName: 'ThreadsHeadless',
    docPath: 'headless-threads',
    route: 'threads/headless',
    ideFile: 'frontend/src/app/threads/headless/demo-chat/page.tsx',
    startLine: 184,
    endLine: 203,
    prompt: 'Say hello in one short sentence.',
    waitAfterPromptMs: 4000,
  },
  {
    id: 'threads-lifecycle',
    name: 'Rich Threads - Thread & History Lifecycle',
    videoName: 'ThreadsLifecycle',
    docPath: 'threads-lifecycle',
    route: 'threads/lifecycle',
    ideFile: 'frontend/src/app/threads/lifecycle/demo-chat/page.tsx',
    startLine: 40,
    endLine: 67,
    prompt: 'Remember the number 42 for me.',
    waitAfterPromptMs: 3000,
  },
  {
    id: 'programmatic-control',
    name: 'Custom Look and Feel - Programmatic Control',
    videoName: 'ProgrammaticControl',
    docPath: 'programmatic-control',
    route: 'custom-look-and-feel/programmatic-control',
    ideFile:
      'frontend/src/app/custom-look-and-feel/programmatic-control/demo-chat/page.tsx',
    startLine: 69,
    endLine: 85,
    prompt: "What's the weather in Tokyo?",
    waitAfterPromptMs: 4000,
  },
  {
    id: 'inspector',
    name: 'Custom Look and Feel - Inspector',
    videoName: 'Inspector',
    docPath: 'inspector',
    route: 'custom-look-and-feel/inspector',
    // The inspector is mounted by the provider, never by the page -- which is
    // the thing worth showing, so the provider leads and the demo follows.
    ideFile: 'frontend/src/components/providers.tsx',
    startLine: 36,
    endLine: 52,
    extraTabs: [
      {
        filePath:
          'frontend/src/app/custom-look-and-feel/inspector/demo-chat/page.tsx',
        startLine: 17,
        endLine: 30,
      },
    ],
    prompt: 'Hello agent! Testing inspector.',
    waitAfterPromptMs: 1500,
  },
  {
    id: 'slots',
    name: 'Custom Look and Feel - Slots',
    videoName: 'Slots',
    docPath: 'custom-look-and-feel/slots',
    route: 'custom-look-and-feel/slots',
    ideFile: 'frontend/src/app/custom-look-and-feel/slots/demo-chat/page.tsx',
    startLine: 66,
    endLine: 111,
    prompt: 'Hello from customized slots level 1!',
    prompts: [
      'Hello from customized slots level 1!',
      'Hello from slot level 2 props override!',
      'Hello from slot level 3 custom component!',
    ],
    waitAfterPromptMs: 1500,
  },
  {
    id: 'headless-ui',
    name: 'Custom Look and Feel - Headless UI',
    videoName: 'HeadlessUI',
    docPath: 'custom-look-and-feel/headless-ui',
    route: 'custom-look-and-feel/headless-ui',
    ideFile:
      'frontend/src/app/custom-look-and-feel/headless-ui/demo-chat/page.tsx',
    startLine: 21,
    endLine: 50,
    prompt: "What's the weather in London?",
    waitAfterPromptMs: 4000,
  },
  {
    id: 'display-only',
    name: 'Generative UI - Display Only Component',
    videoName: 'DisplayOnly',
    docPath: 'generative-ui/your-components/display-only',
    route: 'generative-ui/your-components/display-only',
    ideFile:
      'frontend/src/app/generative-ui/your-components/display-only/demo-chat/page.tsx',
    startLine: 50,
    endLine: 74,
    prompt: 'Show the weather card for Tokyo: 77 degrees, clear',
    waitAfterPromptMs: 4000,
  },
  {
    id: 'tool-rendering',
    name: 'Generative UI - Tool Rendering',
    videoName: 'ToolRendering',
    docPath: 'generative-ui/tool-rendering',
    route: 'generative-ui/tool-rendering',
    ideFile:
      'frontend/src/app/generative-ui/tool-rendering/demo-chat/page.tsx',
    startLine: 45,
    endLine: 80,
    prompt: "What's the weather in Tokyo?",
    waitAfterPromptMs: 4000,
  },
  {
    id: 'frontend-tools',
    name: 'App Control - Frontend Tools',
    videoName: 'FrontendTools',
    docPath: 'frontend-tools',
    route: 'frontend-tools',
    ideFile: 'frontend/src/app/frontend-tools/demo-chat/page.tsx',
    startLine: 24,
    endLine: 63,
    // The page shows the effects; the registrations live at the app root.
    extraTabs: [
      {
        filePath: 'frontend/src/components/global-frontend-tools.tsx',
        startLine: 20,
        endLine: 71,
      },
    ],
    prompt: 'Say hello to Malaika',
    waitAfterPromptMs: 4000,
  },
  {
    id: 'human-in-the-loop',
    name: 'App Control - Human in the Loop',
    videoName: 'HumanInTheLoop',
    docPath: 'human-in-the-loop',
    route: 'human-in-the-loop',
    // The `#region human-in-the-loop` block -- the interrupt itself, rather than
    // the chat route that merely triggers it.
    ideFile: 'frontend/src/components/global-frontend-tools.tsx',
    startLine: 71,
    endLine: 114,
    extraTabs: [
      {
        filePath: 'frontend/src/app/human-in-the-loop/demo-chat/page.tsx',
        startLine: 13,
        endLine: 26,
      },
    ],
    prompt: 'Can you show me two good options for a restaurant name?',
    waitAfterPromptMs: 4000,
  },
  {
    id: 'copilot-runtime',
    name: 'Backend - Copilot Runtime',
    videoName: 'CopilotRuntime',
    docPath: 'copilot-runtime',
    route: 'backend/copilot-runtime',
    ideFile: 'frontend/src/app/backend/copilot-runtime/demo-chat/page.tsx',
    startLine: 24,
    endLine: 50,
    extraTabs: [
      {
        filePath: 'frontend/src/app/api/copilotkit/[[...slug]]/route.ts',
        startLine: 14,
        endLine: 28,
      },
    ],
    // Two registered ids resolving to the same Agno process, one turn each.
    prompt: 'Hello! Which agent id am I talking to?',
    prompts: [
      'Hello! Which agent id am I talking to?',
      "What's the weather in Tokyo?",
    ],
    waitAfterPromptMs: 2000,
  },
  {
    id: 'ag-ui',
    name: 'Backend - AG-UI Protocol Stream',
    videoName: 'AgUi',
    docPath: 'ag-ui',
    route: 'backend/ag-ui',
    ideFile: 'frontend/src/app/backend/ag-ui/demo-chat/page.tsx',
    startLine: 70,
    endLine: 100,
    prompt: "What's the weather in Tokyo?",
    waitAfterPromptMs: 4000,
  },
  {
    id: 'error-debugging',
    name: 'Troubleshooting - Error Debugging & Observability',
    videoName: 'ErrorDebugging',
    docPath: 'troubleshooting/error-debugging',
    route: 'troubleshooting/error-debugging',
    ideFile:
      'frontend/src/app/troubleshooting/error-debugging/demo-chat/page.tsx',
    startLine: 23,
    endLine: 71,
    // The log is fed by the provider's onError, so that is the code that matters.
    extraTabs: [
      {
        filePath: 'frontend/src/components/providers.tsx',
        startLine: 36,
        endLine: 52,
      },
    ],
    prompt: 'Testing the error reporting pipeline.',
    waitAfterPromptMs: 4000,
  },
]);
