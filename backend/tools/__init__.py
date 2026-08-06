"""Tool definitions for the CopilotKit + Agno test-harness agent."""

from .backend_tools import get_weather
from .frontend_tools import sayHello, setThemeColor

# Executed in this process; stream to the browser as AG-UI tool-call events.
BACKEND_TOOLS = [get_weather]

# Executed in the browser by CopilotKit; declared here so the model can call them.
FRONTEND_TOOLS = [sayHello, setThemeColor]

ALL_TOOLS = BACKEND_TOOLS + FRONTEND_TOOLS

__all__ = [
    "BACKEND_TOOLS",
    "FRONTEND_TOOLS",
    "ALL_TOOLS",
    "get_weather",
    "sayHello",
    "setThemeColor",
]
