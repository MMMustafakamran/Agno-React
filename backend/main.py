"""Serves the Agno agent over AG-UI.

`AgentOS` + the `AGUI` interface produce an ASGI app whose AG-UI endpoint lives
at `/agui`. The Next.js runtime route (`frontend/src/app/api/copilotkit/[[...slug]]/route.ts`)
is what actually talks to it; the browser never calls this service directly
except on the AG-UI debug route, which is why CORS is opened for the dev origin.
"""

import os
from pathlib import Path

from dotenv import load_dotenv

# Prefer backend/.env (what the Agno quickstart describes), then fall back to a
# repo-root .env so a single file at the top level also works.
_BACKEND_ENV = Path(__file__).parent / ".env"
_ROOT_ENV = Path(__file__).parent.parent / ".env"
load_dotenv(_BACKEND_ENV)
load_dotenv(_ROOT_ENV, override=False)

from agno.os import AgentOS  # noqa: E402 - must follow load_dotenv
from agno.os.interfaces.agui import AGUI  # noqa: E402

from agent import build_agent  # noqa: E402

PORT = int(os.getenv("AGENT_PORT", "8000"))

_ALLOWED_ORIGINS = [
    o.strip()
    for o in os.getenv(
        "AGENT_CORS_ORIGINS",
        "http://localhost:3000,http://127.0.0.1:3000",
    ).split(",")
    if o.strip()
]

# `.strip()` so a key pasted into a CI secret with a stray newline is caught
# here, where the message names it, rather than much later as an illegal HTTP
# header value reported as a generic connection error.
if not (os.getenv("OPENAI_API_KEY") or "").strip():
    raise SystemExit(
        "OPENAI_API_KEY is not set.\n"
        f"Create {_BACKEND_ENV} (or a repo-root .env) from .env.example and add your key."
    )

agent = build_agent()

agent_os = AgentOS(
    name="CopilotKit Agno Test Harness",
    agents=[agent],
    # [4] AG-UI: expose the Agno agent to CopilotKit
    # [!code highlight]
    interfaces=[AGUI(agent=agent)],
    cors_allowed_origins=_ALLOWED_ORIGINS,
    telemetry=False,
)

app = agent_os.get_app()

if __name__ == "__main__":
    agent_os.serve(app="main:app", port=PORT, reload=True)
