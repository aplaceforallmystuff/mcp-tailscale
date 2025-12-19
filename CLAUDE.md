# CLAUDE.md - mcp-tailscale

MCP server for Tailscale API - manage devices, check status, and configure tailnet.

## Tech Stack
- **Language:** TypeScript
- **Runtime:** Node.js (ES modules)
- **Protocol:** Model Context Protocol (MCP)

## Architecture
```
src/
├── index.ts          # Server entry, tool registration
└── tools/
    ├── devices.ts    # Device management
    ├── status.ts     # Network status
    └── dns.ts        # DNS configuration
```

## Environment Variables
| Variable | Required | Description |
|----------|----------|-------------|
| TAILSCALE_API_KEY | Yes | Tailscale API key (tskey-api-...) |
| TAILSCALE_TAILNET | No | Tailnet name (defaults to "-" for default) |

## Development
```bash
npm run build    # Compile TypeScript
npm run watch    # Watch mode
```

## Constraints
```yaml
rules:
  - id: api-key-format
    description: Tailscale keys start with "tskey-api-"
  - id: device-safety
    description: Device deletion/authorization changes need confirmation
  - id: dns-changes
    description: MagicDNS changes affect entire tailnet
```
