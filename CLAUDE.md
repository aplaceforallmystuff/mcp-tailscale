# CLAUDE.md - mcp-tailscale

MCP server for managing and monitoring a Tailscale network (tailnet). Read-only.

## Tech Stack

- **Language:** TypeScript
- **Runtime:** Node.js (ES modules)
- **Protocol:** Model Context Protocol (MCP)
- **Build:** TypeScript compiler (tsc)

## Architecture

```
src/
  index.ts          # Server, Tailscale API client, all tool handlers inline
```

## Development Commands

```bash
npm run build       # tsc
npm run watch       # tsc --watch
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `TAILSCALE_API_KEY` | Yes | API key from login.tailscale.com (starts with `tskey-api-`) |
| `TAILSCALE_TAILNET` | No | Tailnet name (defaults to `-` for current user) |

## Tools (6)

`tailscale_list_devices`, `tailscale_get_device`, `tailscale_list_online_devices`, `tailscale_list_offline_devices`, `tailscale_check_updates`, `tailscale_device_summary`

## Key Patterns

- Uses `Server` class from MCP SDK (low-level API with `setRequestHandler`)
- Tools defined inline in the `ListToolsRequestSchema` handler
- `callTailscaleAPI()` helper with Bearer token auth
- `tailscale_get_device` searches by ID, name, or hostname
- `tailscale_device_summary` aggregates by OS, online/offline, updates
- `TailscaleDevice` interface for typed API responses

## Constraints

- Read-only: no device modifications, only queries
- Exits at startup if `TAILSCALE_API_KEY` is not set
- API keys expire (1-90 days configurable at Tailscale)
