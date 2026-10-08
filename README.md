# netlab

A zero-dependency network explorer CLI: DNS lookups, IP and interface info,
TCP port checks and TCP latency measurement.

> Built as a learning project alongside the ProCodrr Node.js course.

## Requirements

Node.js 20 or newer.

## Install

```bash
git clone <repo-url> && cd netlab
npm link
```

## Usage

```bash
netlab --help
netlab <command> --help
```

| Command | What it does |
|---|---|
| `netlab dns <domain>` | DNS records (A, CNAME, MX) |
| `netlab ip` | Public IP, private IPs, interfaces |
| `netlab port <host> <port>` | Is a TCP port open? |
| `netlab tcping <host> <port>` | TCP connect latency |

Every command accepts `--json` for machine-readable output.
Colour is disabled automatically when piped, or with `NO_COLOR=1`.

## Exit codes

| Code | Meaning |
|---|---|
| 0 | Success |
| 1 | Runtime failure (DNS error, timeout, ...) |
| 2 | Usage error (bad command or flag) |

## Project layout

```
bin/          entry point (shebang + one call into src/)
src/cli.js    argument parsing and routing
src/commands/ one file per subcommand: prints output
src/lib/      reusable logic: no console output, easy to test
test/         node:test suites
```

## Development

```bash
npm test
```

## What I learned

(Fill this in per feature: the networking concept each command made concrete.)

## License

MIT