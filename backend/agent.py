"""The Agno agent exercised by every route in the frontend test harness.

One agent backs the whole app. Each doc route drives it differently — some send
plain chat, some register frontend tools, some only read `agent.state` — so the
instructions below have to cover every tool without pushing the model to call
them unprompted.
"""

import os

from agno.agent import Agent
from agno.models.openai import OpenAIChat

from tools import ALL_TOOLS

# The Agno quickstart prints `gpt-5.4`. That id is not available on every
# account, so the default here is a model anyone with an OpenAI key can call.
# Override with OPENAI_MODEL to test against whatever the docs currently show.
DEFAULT_MODEL = os.getenv("OPENAI_MODEL", "gpt-4o")

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
        model=OpenAIChat(id=DEFAULT_MODEL),
        tools=ALL_TOOLS,
        description=(
            "A helpful assistant used to exercise every CopilotKit feature "
            "documented for the Agno integration."
        ),
        instructions=INSTRUCTIONS,
        markdown=True,
    )
