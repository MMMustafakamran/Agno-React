"""Server-executed tools.

These run inside the Agno process. Their tool calls still stream to the browser
as AG-UI TOOL_CALL_* events, which is what the Generative UI routes render with
`useRenderTool` / `useDefaultRenderTool`.

Values are deterministic stand-ins rather than live API calls so the test
harness stays runnable with nothing but an OpenAI key.
"""

from agno.tools import tool


@tool
def get_weather(location: str):
    """
    Get the weather for a given location.
    """
    # [6] server-side tool: render its call in the frontend
    # [!code highlight]
    return f"The weather for {location} is 70 degrees."


