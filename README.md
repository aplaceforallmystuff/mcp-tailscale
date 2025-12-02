# Tailscale MCP Server

MCP server for managing your Tailscale network (tailnet) through Claude Code and other MCP clients.

## Features

- **List Devices** - View all devices in your tailnet with detailed information
- **Device Status** - Check online/offline status and connection health
- **Update Management** - See which devices have Tailscale client updates available
- **Network Summary** - Get overview statistics of your tailnet
- **Device Search** - Find specific devices by ID, name, or hostname

## Available Tools

| Tool | Description |
|------|-------------|
| `tailscale_list_devices` | List all devices in your tailnet |
| `tailscale_get_device` | Get details about a specific device |
| `tailscale_list_online_devices` | List only online/connected devices |
| `tailscale_list_offline_devices` | List only offline/disconnected devices |
| `tailscale_check_updates` | Check which devices need updates |
| `tailscale_device_summary` | Get summary stats (online/offline, by OS, etc.) |

## Installation

```bash
npm install
npm run build
```

## Configuration

### Environment Variables

- `TAILSCALE_API_KEY` - **Required**. Your Tailscale API key from https://login.tailscale.com/admin/settings/keys
- `TAILSCALE_TAILNET` - Optional. Defaults to `-` (your current user's tailnet)

### Get an API Key

1. Go to https://login.tailscale.com/admin/settings/keys
2. Click "Generate auth key"
3. Configure:
   - Expiry: Choose duration (1-90 days)
   - Description: "MCP Server"
4. Copy the key (starts with `tskey-api-`)

## Claude Desktop Configuration

Add to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "tailscale": {
      "command": "node",
      "args": ["/absolute/path/to/mcp-tailscale/dist/index.js"],
      "env": {
        "TAILSCALE_API_KEY": "tskey-api-your-key-here"
      }
    }
  }
}
```

## Claude Code Configuration

```bash
claude mcp add mcp-tailscale --type stdio
claude mcp config mcp-tailscale command "node"
claude mcp config mcp-tailscale args '["'$(pwd)'/dist/index.js"]'
claude mcp config mcp-tailscale env.TAILSCALE_API_KEY "tskey-api-your-key-here"
```

## Usage Examples

### List All Devices
```
Can you list all my Tailscale devices?
```

### Check Online Devices
```
Which of my Tailscale devices are currently online?
```

### Check for Updates
```
Do any of my Tailscale devices need updates?
```

### Get Device Details
```
Show me details about my device named "opus"
```

### Network Summary
```
Give me a summary of my Tailscale network
```

## Development

```bash
# Build
npm run build

# Watch mode
npm run watch

# Test locally
TAILSCALE_API_KEY=your-key node dist/index.js
```

## API Permissions

This MCP server uses read-only API calls. It does **not** modify your Tailscale configuration. The API key only needs:
- Device list access
- Device status access

## Security Notes

- API keys are case-sensitive
- Keys expire based on the duration you set
- Store keys securely (never commit to version control)
- Use environment variables or secure configuration management

## License

MIT

## Author

Jim Christian
