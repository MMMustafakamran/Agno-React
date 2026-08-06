import "server-only";

/**
 * Reachability + configuration snapshot for the connection panel.
 *
 * Server-side by necessity: the browser has no route to the Agno process (and
 * should not have one), so a client-side probe would report a failure even on a
 * correctly configured install.
 */

export interface HealthReport {
  agent: { ok: boolean; detail: string };
  agentUrl: string;
  licenseKeySet: boolean;
}

export const AGNO_URL = process.env.AGNO_AGENT_URL ?? "http://localhost:8000/agui";

export async function getHealth(): Promise<HealthReport> {
  // AgentOS serves /status alongside the /agui interface.
  const statusUrl = new URL("/status", AGNO_URL).toString();

  let agent: HealthReport["agent"];
  try {
    const res = await fetch(statusUrl, {
      signal: AbortSignal.timeout(4000),
      cache: "no-store",
    });
    agent = res.ok
      ? { ok: true, detail: `${res.status} from ${statusUrl}` }
      : { ok: false, detail: `${statusUrl} returned ${res.status}` };
  } catch (error) {
    agent = {
      ok: false,
      detail:
        error instanceof Error
          ? `${statusUrl} unreachable — ${error.message}`
          : `${statusUrl} unreachable`,
    };
  }

  return {
    agent,
    agentUrl: AGNO_URL,
    licenseKeySet: Boolean(process.env.NEXT_PUBLIC_COPILOTKIT_LICENSE_KEY),
  };
}
