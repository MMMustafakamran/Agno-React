"""Prove the backend's own Python environment can reach OpenAI.

Run by ci/lib/preflight.mjs via `uv run`, so it uses the exact interpreter,
client version, resolver and TLS stack the agent will use at request time.
A Node-side check cannot stand in for this: a CI run passed the Node check and
then failed every demo with

    ERROR  API connection error from OpenAI API: Connection error.

Prints OK and exits 0 on success. On failure it prints a diagnosis to stderr and
exits 1.

The diagnosis matters. `openai.APIConnectionError` stringifies to the useless
"Connection error." — the real reason (DNS failure, refused connection, TLS
rejection, timeout) is in the exception's __cause__ chain, and the failure mode
we are chasing only reproduces on the runner. So on failure this reports the
resolved addresses, a raw socket attempt per address family, any proxy
variables in the environment, and the full exception chain. One failed run then
carries its own answer instead of costing another round trip.

Lists models rather than calling one: that exercises DNS, TLS and the whole
connection path without spending tokens, and the connection failure happens
long before a model is chosen.
"""

import os
import socket
import sys
import time

HOST = "api.openai.com"
PORT = 443
# Mirrors backend/agent.py. A probe that waits longer than the agent does would
# report "reachable" for a backend that still times out connecting, which is
# the exact failure this check exists to catch.
CONNECT_TIMEOUT = float(os.getenv("OPENAI_CONNECT_TIMEOUT", "30"))
REQUEST_TIMEOUT = float(os.getenv("OPENAI_REQUEST_TIMEOUT", "600"))
# One attempt, not the agent's five: preflight.mjs already runs the probe twice,
# and a dead network should be named in seconds rather than after five connect
# timeouts. It is the connect budget above that has to match, not the retries.
MAX_RETRIES = int(os.getenv("OPENAI_PROBE_MAX_RETRIES", "1"))
# The raw-socket probe below runs once per resolved address and only reports
# which family answers, so it keeps its own short budget instead of spending the
# agent's full connect timeout on each one.
TCP_PROBE_TIMEOUT = 10


def exception_chain(exc: BaseException) -> str:
    """Flatten __cause__/__context__ — the layer that names the real fault."""
    parts = []
    seen = set()
    current: BaseException | None = exc
    while current is not None and id(current) not in seen:
        seen.add(id(current))
        text = str(current).strip() or "(no message)"
        parts.append(f"{type(current).__name__}: {text}")
        current = current.__cause__ or current.__context__
    return "\n    caused by ".join(parts)


def report_environment() -> None:
    """Versions and any proxy configuration, by name only — never values."""
    # `httpx2` is listed first deliberately: openai 3.x moved to that package,
    # so the `httpx` version here belongs to agno and says nothing about the
    # client that just failed. Reporting only `httpx` sent one diagnosis down
    # the wrong path already.
    for name in ("openai", "httpx2", "httpcore2", "httpx", "httpcore", "anyio"):
        try:
            module = __import__(name)
            print(f"  {name}={getattr(module, '__version__', 'unknown')}", file=sys.stderr)
        except Exception:  # noqa: BLE001 - diagnostics must not raise
            print(f"  {name}=not installed", file=sys.stderr)

    proxy_vars = sorted(
        name
        for name in os.environ
        if "PROXY" in name.upper() or name.upper() in {"NO_PROXY", "REQUESTS_CA_BUNDLE", "SSL_CERT_FILE"}
    )
    print(f"  proxy/TLS env set: {proxy_vars or 'none'}", file=sys.stderr)


def report_connectivity() -> None:
    """Resolve the host, then try a raw TCP connect to each address.

    Separates 'cannot resolve' from 'resolves but cannot connect', and shows
    whether one address family works while another does not — the shape a
    runner with no IPv6 route produces.
    """
    try:
        infos = socket.getaddrinfo(HOST, PORT, proto=socket.IPPROTO_TCP)
    except Exception as exc:  # noqa: BLE001
        print(f"  DNS: {HOST} did NOT resolve -> {type(exc).__name__}: {exc}", file=sys.stderr)
        return

    families = {socket.AF_INET: "IPv4", socket.AF_INET6: "IPv6"}
    print(f"  DNS: {HOST} resolved to {len(infos)} address(es)", file=sys.stderr)

    for family, _type, _proto, _canon, sockaddr in infos:
        label = families.get(family, str(family))
        address = sockaddr[0]
        sock = socket.socket(family, socket.SOCK_STREAM)
        sock.settimeout(TCP_PROBE_TIMEOUT)
        try:
            sock.connect(sockaddr)
            print(f"  TCP {label} {address}:{PORT} -> connected", file=sys.stderr)
        except Exception as exc:  # noqa: BLE001
            print(
                f"  TCP {label} {address}:{PORT} -> FAILED {type(exc).__name__}: {exc}",
                file=sys.stderr,
            )
        finally:
            sock.close()


def main() -> int:
    try:
        from openai import OpenAI, Timeout
    except Exception as exc:  # noqa: BLE001 - report anything, including ImportError
        print(f"{type(exc).__name__}: {exc}", file=sys.stderr)
        return 1

    client = OpenAI(
        api_key=(os.getenv("OPENAI_API_KEY") or "").strip() or None,
        timeout=Timeout(timeout=REQUEST_TIMEOUT, connect=CONNECT_TIMEOUT),
        max_retries=MAX_RETRIES,
    )

    started = time.monotonic()
    try:
        next(iter(client.models.list()), None)
    except Exception as exc:  # noqa: BLE001 - the type is the diagnosis
        print("--- backend cannot reach OpenAI; diagnosis follows ---", file=sys.stderr)
        print(
            f"  gave up after {time.monotonic() - started:.1f}s "
            f"(connect timeout {CONNECT_TIMEOUT}s, {MAX_RETRIES} retries)",
            file=sys.stderr,
        )
        report_environment()
        report_connectivity()
        print(f"  exception: {exception_chain(exc)}", file=sys.stderr)
        print("--- end diagnosis ---", file=sys.stderr)
        # Last line stays a single summary, because preflight.mjs surfaces it.
        print(f"{type(exc).__name__}: {str(exc).strip() or 'no message'}", file=sys.stderr)
        return 1

    # The elapsed time is the useful part of a green run: a connect measured in
    # seconds rather than milliseconds is the runner warning us it is saturated.
    print(f"OK ({time.monotonic() - started:.2f}s)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
