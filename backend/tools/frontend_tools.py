"""Tools the *browser* executes, not this process.

`external_execution=True` tells Agno to emit the tool call and then stop and wait
instead of running anything locally. CopilotKit picks the call up on the client,
runs the matching `useFrontendTool` / `useHumanInTheLoop` handler, and sends the
result back so the run can continue.

Two consequences shape this file:

* The bodies are intentionally empty. Whatever were written here would never run.
* The function names are camelCase, which is wrong for Python but required here:
  the name is the wire identifier, and it has to match the `name` passed to the
  frontend hook exactly or the call arrives with no registered handler.

Docstrings and type hints still matter — they become the schema the model sees.
"""

from agno.tools import tool


@tool(external_execution=True)
def sayHello(name: str):  # noqa: N802 - name is the wire identifier
    """
    Say hello to the user with a greeting banner in the UI.

    Args:
        name: The name of the user to greet.
    """


@tool(external_execution=True)
def setThemeColor(theme: str):  # noqa: N802 - name is the wire identifier
    """
    Change the accent color of the application UI.

    Args:
        theme: One of "emerald", "violet", "amber", "rose", or "sky".
    """


@tool(external_execution=True)
def addBookmark(title: str, url: str):  # noqa: N802 - name is the wire identifier
    """
    Add a bookmark to the user's bookmark list in the UI.

    Args:
        title: The label to show for the bookmark.
        url: The URL the bookmark points to.
    """


# region offer-options
@tool(external_execution=True)
def offerOptions(option_1: str, option_2: str):  # noqa: N802 - wire identifier
    """
    Give the user a choice between two options and have them select one.

    Args:
        option_1: The first option.
        option_2: The second option.
    """
# endregion


# region governed-action
@tool(external_execution=True)
def approve_governed_action(
    id: str,
    summary: str,
    tool: str,
    reference: str,
    verdict: str,
    arguments: dict,
):
    """
    Ask the user to approve a governed side-effect action before it runs.

    Args:
        id: Stable identifier for this proposed action.
        summary: One line describing what the action does.
        tool: The tool or API that would be called.
        reference: The policy or reference that produced the verdict.
        verdict: One of "allow", "deny", or "require_approval".
        arguments: The exact arguments the action would run with.
    """
# endregion
