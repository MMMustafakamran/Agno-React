"""Tool definitions for the CopilotKit + Agno test-harness agent."""

from .backend_tools import get_weather
from .frontend_tools import (
    addBookmark,
    approve_governed_action,
    offerOptions,
    sayHello,
    setThemeColor,
)

# Executed in this process; stream to the browser as AG-UI tool-call events.
BACKEND_TOOLS = [get_weather]

# Executed in the browser by CopilotKit; declared here so the model can call them.
#
# `addBookmark` and `offerOptions` were defined in `frontend_tools.py` from the
# first commit but never added to this list, so the agent was never told they
# existed. The model cannot call a tool it has not been given: the Human in the
# Loop route could not pause for a choice, and the bookmark tool on App Control
# could not fire. Both failed silently -- no error anywhere, the model simply
# answered in prose -- which is exactly the "silent failure" case the brief says
# the pipeline cannot catch.
FRONTEND_TOOLS = [
    sayHello,
    setThemeColor,
    addBookmark,
    offerOptions,
    approve_governed_action,
]

ALL_TOOLS = BACKEND_TOOLS + FRONTEND_TOOLS

__all__ = [
    "BACKEND_TOOLS",
    "FRONTEND_TOOLS",
    "ALL_TOOLS",
    "get_weather",
    "sayHello",
    "setThemeColor",
    "addBookmark",
    "offerOptions",
    "approve_governed_action",
]
