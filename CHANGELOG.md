# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2025-12-02

### Added
- Initial release of Tailscale MCP server
- Six MCP tools for Tailscale network management:
  - `tailscale_list_devices` - List all devices with optional field filtering
  - `tailscale_get_device` - Get detailed device information by ID or name
  - `tailscale_list_online_devices` - List currently connected devices
  - `tailscale_list_offline_devices` - List disconnected devices
  - `tailscale_check_updates` - Check for available Tailscale client updates
  - `tailscale_device_summary` - Get network summary statistics
- TypeScript implementation with full type safety
- stdio transport for Claude Desktop and Claude Code compatibility
- MIT license
- Comprehensive README with setup instructions
- Configuration examples for both Claude Desktop and Claude Code

### Technical Details
- Uses Tailscale API v2 (read-only operations)
- Requires Node.js 18+
- Built with @modelcontextprotocol/sdk v1.0.4
- Environment variable configuration for API key and tailnet

[0.1.0]: https://github.com/yourusername/tailscale-mcp/releases/tag/v0.1.0
