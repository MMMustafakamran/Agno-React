/**
 * The nav, the route headers, and the README status table all read from here,
 * so a doc page and its implementation status are described exactly once.
 *
 * Groups and their ordering mirror the sidebar at https://docs.copilotkit.ai/agno
 * as of the DOC_SYNC_DATE below. `offNav: true` marks pages that resolve fine
 * but no longer appear in that sidebar.
 */

/**
 * There is exactly one doc-sync date in this repo, and it is not here: it is
 * `syncedAt` in `doc-snapshot/manifest.json`, written every time the sync
 * button runs. A hand-maintained date alongside it only ever drifted out of
 * agreement with the machine one, so it was removed — `/doc-sync` is the
 * single place that answers "how current are these docs".
 */
export const DOCS_ROOT = "https://docs.copilotkit.ai/agno";

/**
 * Working  — implemented and exercisable against the local stack.
 * Partial  — implemented, but something outside this repo limits it
 *            (a premium license, an external MCP server, agent-side support).
 * Reference — intentionally not a live feature; doc/notes surface.
 * Broken   — implemented but currently failing.
 */
export type RouteStatus = "working" | "partial" | "reference" | "broken" | "not-started";

export interface RouteMeta {
  /** App route path. */
  path: string;
  /** Nav label. */
  title: string;
  /** Doc page this route tests, relative to docs.copilotkit.ai. */
  docPath: string;
  /** One-line description in our own words. */
  summary: string;
  status: RouteStatus;
  /** Shown in the route header when status is not plain "working". */
  statusNote?: string;
  /** Page exists in the docs but is absent from the current sidebar. */
  offNav?: boolean;
  /** Feature requires a CopilotKit Enterprise Intelligence license. */
  premium?: boolean;
  /**
   * This route owns a live interactive surface, which lives at
   * `<path>/demo-chat` rather than on the page itself. The doc page keeps the
   * explanation and the source; the demo route is chrome-free so it can be
   * screen-recorded on its own.
   */
  hasDemo?: boolean;
}

/** Where a route's interactive demo lives, if it has one. */
export function demoPath(route: RouteMeta): string | undefined {
  if (!route.hasDemo) return undefined;
  return route.path === "/" ? "/demo-chat" : `${route.path}/demo-chat`;
}

export interface NavGroup {
  title: string;
  routes: RouteMeta[];
}

export const NAV: NavGroup[] = [
  {
    title: "Getting Started",
    routes: [
      {
        path: "/",
        title: "Introduction",
        docPath: "/agno",
        summary:
          "What this harness covers and how the three processes fit together.",
        status: "reference",
        statusNote: "Landing page — orientation and live connection check.",
      },
      {
        path: "/quickstart",
        hasDemo: true,
        title: "Quickstart",
        docPath: "/agno/quickstart",
        summary:
          "The smallest end-to-end path: provider, runtime route, and a chat talking to the Agno agent.",
        status: "working",
      },
    ],
  },
  {
    title: "Basics",
    routes: [
      {
        path: "/prebuilt-components",
        hasDemo: true,
        title: "Prebuilt Components",
        docPath: "/agno/prebuilt-components",
        summary:
          "CopilotChat, CopilotPopup, and CopilotSidebar side by side, each driving the same agent.",
        status: "working",
      },
    ],
  },
  {
    title: "Rich Threads",
    routes: [
      {
        path: "/threads",
        title: "Overview",
        docPath: "/agno/threads",
        summary:
          "What Rich Threads persist, and a live check of whether this install has a license key.",
        status: "partial",
        premium: true,
        statusNote:
          "Thread persistence is served by the Enterprise Intelligence Platform.",
      },
      {
        path: "/threads/drawer",
        hasDemo: true,
        title: "Threads Drawer",
        docPath: "/agno/prebuilt-components/copilot-threads-drawer",
        summary:
          "The drop-in CopilotThreadsDrawer wired to a chat through a shared configuration provider.",
        status: "partial",
        premium: true,
        statusNote:
          "Renders a locked view without a license key — that locked state is itself the expected result here.",
      },
      {
        path: "/threads/headless",
        hasDemo: true,
        title: "Headless Threads",
        docPath: "/agno/headless-threads",
        summary:
          "A thread list built by hand on useThreads, including the rename action the drawer omits.",
        status: "partial",
        premium: true,
        statusNote: "useThreads returns an empty list without a license key.",
      },
      {
        path: "/threads/lifecycle",
        hasDemo: true,
        title: "Thread & History Lifecycle",
        docPath: "/agno/threads-lifecycle",
        summary:
          "How a thread id flows through a run, and how threads get scoped to a signed-in user.",
        status: "partial",
        premium: true,
      },
      {
        path: "/threads/import",
        title: "Synchronize Thread History",
        docPath: "/agno/threads-import",
        summary:
          "Importing existing ADK or LangGraph conversations into the same thread store.",
        status: "reference",
        premium: true,
        statusNote:
          "Import is a CLI operation against a licensed project; documented here, not executed.",
      },
      {
        path: "/threads/architecture",
        title: "Threads & Persistence Architecture",
        docPath: "/agno/premium/threads-explained",
        summary:
          "The event-replay model behind threads: durable history, live reconnect, and thread locking.",
        status: "reference",
        premium: true,
      },
    ],
  },
  {
    title: "Custom Look and Feel",
    routes: [
      {
        path: "/custom-look-and-feel/programmatic-control",
        hasDemo: true,
        title: "Programmatic Control",
        docPath: "/agno/programmatic-control",
        summary:
          "Driving the agent with no chat UI: read state and messages, run it, and stop it mid-run.",
        status: "working",
      },
      {
        path: "/custom-look-and-feel/inspector",
        hasDemo: true,
        title: "Inspector",
        docPath: "/agno/inspector",
        summary:
          "The built-in debugging overlay showing AG-UI events, agents, state, and registered tools.",
        status: "working",
      },
      {
        path: "/custom-look-and-feel/slots",
        hasDemo: true,
        title: "Slots",
        docPath: "/agno/custom-look-and-feel/slots",
        summary:
          "Replacing chat sub-components at three levels: class strings, prop overrides, and whole components.",
        status: "working",
        offNav: true,
      },
      {
        path: "/custom-look-and-feel/headless-ui",
        hasDemo: true,
        title: "Headless UI",
        docPath: "/agno/custom-look-and-feel/headless-ui",
        summary:
          "A chat interface built from scratch on the headless hooks, with no CopilotKit chrome.",
        status: "working",
        offNav: true,
      },
    ],
  },
  {
    title: "Generative UI",
    routes: [
      {
        path: "/generative-ui/your-components/display-only",
        hasDemo: true,
        title: "Your Components · Display-only",
        docPath: "/agno/generative-ui/your-components/display-only",
        summary:
          "Registering a React component as a tool the agent can render in the chat, with no handler and no interaction.",
        status: "working",
      },
      {
        path: "/generative-ui/your-components/interactive",
        title: "Your Components · Interactive",
        docPath: "/agno/generative-ui/your-components/interactive",
        summary:
          "Components the agent uses to interact with the user, rather than only to display.",
        status: "not-started",
        statusNote:
          "The upstream doc page is a stub — it renders a shared-content placeholder with no body. Left intentionally empty until it has content to implement.",
      },
      {
        path: "/generative-ui/tool-rendering",
        hasDemo: true,
        title: "Tool Rendering",
        docPath: "/agno/generative-ui/tool-rendering",
        summary:
          "Named tool calls rendered as custom React components, plus a catch-all renderer for everything else.",
        status: "working",
      },
    ],
  },
  {
    title: "App Control",
    routes: [
      {
        path: "/frontend-tools",
        hasDemo: true,
        title: "Frontend Tools",
        docPath: "/agno/frontend-tools",
        summary:
          "Tools the agent calls that execute in the browser and visibly change this page.",
        status: "working",
      },
      {
        path: "/human-in-the-loop",
        hasDemo: true,
        title: "Human in the Loop",
        docPath: "/agno/human-in-the-loop",
        summary:
          "A tool call that pauses the run until the user picks an option in the chat.",
        status: "working",
        offNav: true,
      },
    ],
  },
  {
    title: "Backend",
    routes: [
      {
        path: "/backend/copilot-runtime",
        hasDemo: true,
        title: "Copilot Runtime",
        docPath: "/agno/copilot-runtime",
        summary:
          "This repo's live runtime config, agent routing between two ids, and the direct-connection tradeoff.",
        status: "working",
      },
      {
        path: "/backend/ag-ui",
        hasDemo: true,
        title: "AG-UI",
        docPath: "/agno/ag-ui",
        summary:
          "A live capture of the raw AG-UI event stream flowing between the runtime and this page.",
        status: "working",
      },
    ],
  },
  {
    title: "Troubleshooting",
    routes: [
      {
        path: "/troubleshooting/error-debugging",
        hasDemo: true,
        title: "Error Debugging & Observability",
        docPath: "/agno/troubleshooting/error-debugging",
        summary:
          "A live error log fed by the provider-level onError callback, plus the error-code reference.",
        status: "working",
      },
    ],
  },
  {
    title: "Doc Sync",
    routes: [
      {
        path: "/doc-sync",
        title: "Doc drift",
        docPath: "/agno",
        summary:
          "Re-fetches the markdown behind every tracked doc page and diffs it against the stored snapshot, flagging changes inside code blocks.",
        status: "reference",
      },
    ],
  },
];

export const ALL_ROUTES: RouteMeta[] = NAV.flatMap((g) => g.routes);

export function findRoute(path: string): RouteMeta | undefined {
  return ALL_ROUTES.find((r) => r.path === path);
}

export function docUrl(route: RouteMeta): string {
  return `https://docs.copilotkit.ai${route.docPath}`;
}

export const STATUS_LABEL: Record<RouteStatus, string> = {
  working: "Working",
  partial: "Partial",
  reference: "Reference",
  broken: "Broken",
  "not-started": "Not started",
};
