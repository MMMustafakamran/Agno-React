"""The Agno agent exercised by every route in the frontend test harness.

One agent backs the whole app. Each doc route drives it differently — some send
plain chat, some register frontend tools, some only read `agent.state` — so the
instructions below have to cover every tool without pushing the model to call
them unprompted.
"""

import os

from agno.agent import Agent
from agno.models.openai import OpenAIChat
from openai import Timeout

from tools import ALL_TOOLS

# The Agno quickstart prints `gpt-5.4`. That id is not available on every
# account, so the default here is a model anyone with an OpenAI key can call.
# Override with OPENAI_MODEL to test against whatever the docs currently show.
DEFAULT_MODEL = os.getenv("OPENAI_MODEL", "gpt-4o")

# The OpenAI SDK ships a 5-second *connect* timeout
# (`openai._constants.DEFAULT_TIMEOUT` is `Timeout(timeout=600, connect=5.0)`),
# and agno forwards a timeout to the client only when one is given, so leaving
# these unset meant the agent gave up on opening a socket after 5 seconds.
#
# That is invisible on an idle developer machine, where connecting takes about
# 100ms. It is not invisible on a CI runner: every recorded demo on GitHub
# Actions failed with
#
#     ERROR  API connection error from OpenAI API: Connection error.
#
# which is how `APIConnectionError` stringifies a wrapped `ConnectTimeout`. The
# job runs three shards, each building the Next.js app with Turbopack,
# installing Playwright and driving Chromium under xvfb, so the machine is
# saturated at the moment the agent first calls out. The Node-side credential
# check passed in the same job because it runs before any of that starts and
# allows itself 20 seconds.
#
# Connect stays separate from read: a slow connect is worth waiting for, a hung
# one is not, and streaming replies still need a long read budget.
CONNECT_TIMEOUT = float(os.getenv("OPENAI_CONNECT_TIMEOUT", "30"))
REQUEST_TIMEOUT = float(os.getenv("OPENAI_REQUEST_TIMEOUT", "600"))
# Retries cover the transient case and cost nothing when the first attempt
# succeeds. The SDK default of 2 only ever bought 15 seconds of patience.
MAX_RETRIES = int(os.getenv("OPENAI_MAX_RETRIES", "5"))


def _model() -> OpenAIChat:
    """The chat model, with its connection behaviour stated rather than inherited.

    `client_params` rather than agno's own `timeout=` field: that field is typed
    as a float, which would apply a single value to connect *and* read. Passing
    the SDK's own `Timeout` keeps the two apart.

    `openai.Timeout` is re-exported by the OpenAI SDK, so this pins no httpx
    version. That matters here — `openai` 3.x moved to the `httpx2` package
    while agno still type-checks `http_client` against `httpx` 0.28, so handing
    agno an `httpx.AsyncClient` would satisfy its isinstance check and then
    reach a client that no longer speaks that type.
    """
    return OpenAIChat(
        id=DEFAULT_MODEL,
        # A key pasted into a CI secret can arrive with surrounding whitespace,
        # which becomes an illegal HTTP header value rather than a clean 401.
        api_key=(os.getenv("OPENAI_API_KEY") or "").strip() or None,
        client_params={
            "timeout": Timeout(timeout=REQUEST_TIMEOUT, connect=CONNECT_TIMEOUT),
            "max_retries": MAX_RETRIES,
        },
    )

INSTRUCTIONS = """\
You are the test agent for a CopilotKit + Agno integration harness. Each page of
the app exercises a different part of the integration, so behave predictably.

Formatting:
- Use markdown. Keep answers brief unless asked to elaborate.

Tools:
- Call `get_weather` whenever the user asks about weather.
- Call `sayHello` when the user asks you to greet or say hello to someone.
- Call `setThemeColor` when the user asks to change the theme or accent color.
  Valid values: emerald, violet, amber, rose, sky.
  
Do not call a tool unless the user's request calls for it. When you are asked
what you can do, describe your tools rather than invoking them.
"""


def build_agent() -> Agent:
    """Create the agent. Called once at import time by `main.py`."""
    return Agent(
        # [5] Agno agent: configure the model and tools
        # [!code highlight:3]
        name="Agno Test Harness Agent",
        model=_model(),
        tools=ALL_TOOLS,
        description=(
            "A helpful assistant used to exercise every CopilotKit feature "
            "documented for the Agno integration."
        ),
        instructions=INSTRUCTIONS,
        markdown=True,
    )
