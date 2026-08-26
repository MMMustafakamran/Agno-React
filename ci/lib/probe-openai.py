"""Prove the backend's own Python environment can reach OpenAI.

Run by ci/lib/preflight.mjs via `uv run`, so it uses the exact interpreter,
client version, resolver and TLS stack the agent will use at request time.
A Node-side check cannot stand in for this: a CI run has passed the Node check
and then failed every demo with

    ERROR  API connection error from OpenAI API: Connection error.

Prints OK and exits 0 on success; prints "<ExceptionType>: <message>" to stderr
and exits 1 otherwise.

Lists models rather than calling one — that exercises DNS, TLS and the whole
connection path without spending tokens, and the connection failure this exists
to catch happens long before a model is chosen.
"""

import sys


def main() -> int:
    try:
        from openai import OpenAI
    except Exception as exc:  # noqa: BLE001 - report anything, including ImportError
        print(f"{type(exc).__name__}: {exc}", file=sys.stderr)
        return 1

    try:
        next(iter(OpenAI().models.list()), None)
    except Exception as exc:  # noqa: BLE001 - the type is the diagnosis
        print(f"{type(exc).__name__}: {exc}", file=sys.stderr)
        return 1

    print("OK")
    return 0


if __name__ == "__main__":
    sys.exit(main())
