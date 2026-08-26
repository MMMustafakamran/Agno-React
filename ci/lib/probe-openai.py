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

HOST = "api.openai.com"
PORT = 443
CONNECT_TIMEOUT = 10


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
    try:
        import httpx
        import openai

        print(f"  openai={openai.__version__} httpx={httpx.__version__}", file=sys.stderr)
    except Exception:  # noqa: BLE001 - diagnostics must not raise
        pass

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
        sock.settimeout(CONNECT_TIMEOUT)
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
        from openai import OpenAI
    except Exception as exc:  # noqa: BLE001 - report anything, including ImportError
        print(f"{type(exc).__name__}: {exc}", file=sys.stderr)
        return 1

    try:
        next(iter(OpenAI().models.list()), None)
    except Exception as exc:  # noqa: BLE001 - the type is the diagnosis
        print("--- backend cannot reach OpenAI; diagnosis follows ---", file=sys.stderr)
        report_environment()
        report_connectivity()
        print(f"  exception: {exception_chain(exc)}", file=sys.stderr)
        print("--- end diagnosis ---", file=sys.stderr)
        # Last line stays a single summary, because preflight.mjs surfaces it.
        print(f"{type(exc).__name__}: {str(exc).strip() or 'no message'}", file=sys.stderr)
        return 1

    print("OK")
    return 0


if __name__ == "__main__":
    sys.exit(main())
