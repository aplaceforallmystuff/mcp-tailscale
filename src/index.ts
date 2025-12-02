#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

const TAILSCALE_API_KEY = process.env.TAILSCALE_API_KEY;
const TAILSCALE_TAILNET = process.env.TAILSCALE_TAILNET || "-"; // "-" means current user's tailnet

if (!TAILSCALE_API_KEY) {
  console.error("Error: TAILSCALE_API_KEY environment variable is required");
  process.exit(1);
}

interface TailscaleDevice {
  id: string;
  nodeId: string;
  name: string;
  hostname: string;
  addresses: string[];
  user: string;
  os: string;
  clientVersion: string;
  updateAvailable: boolean;
  created: string;
  lastSeen: string;
  expires: string;
  keyExpiryDisabled: boolean;
  authorized: boolean;
  connectedToControl: boolean;
  blocksIncomingConnections: boolean;
}

interface TailscaleDevicesResponse {
  devices: TailscaleDevice[];
}

async function callTailscaleAPI(endpoint: string, options: RequestInit = {}): Promise<any> {
  const url = `https://api.tailscale.com/api/v2${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      "Authorization": `Bearer ${TAILSCALE_API_KEY}`,
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`Tailscale API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

const server = new Server(
  {
    name: "tailscale-mcp",
    version: "0.1.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "tailscale_list_devices",
        description: "List all devices in your Tailscale network (tailnet). Shows device name, hostname, IP addresses, OS, connection status, and more.",
        inputSchema: {
          type: "object",
          properties: {
            fields: {
              type: "array",
              items: { type: "string" },
              description: "Optional: Specific fields to return (e.g., ['name', 'addresses', 'os']). If not specified, returns all fields.",
            },
          },
        },
      },
      {
        name: "tailscale_get_device",
        description: "Get detailed information about a specific device by its device ID or name.",
        inputSchema: {
          type: "object",
          properties: {
            deviceId: {
              type: "string",
              description: "Device ID (numeric) or device name (e.g., 'opus.centaur-snapper.ts.net')",
            },
          },
          required: ["deviceId"],
        },
      },
      {
        name: "tailscale_list_online_devices",
        description: "List only devices that are currently online and connected to the control plane.",
        inputSchema: {
          type: "object",
          properties: {},
        },
      },
      {
        name: "tailscale_list_offline_devices",
        description: "List devices that are currently offline or disconnected.",
        inputSchema: {
          type: "object",
          properties: {},
        },
      },
      {
        name: "tailscale_check_updates",
        description: "Check which devices have updates available for their Tailscale client.",
        inputSchema: {
          type: "object",
          properties: {},
        },
      },
      {
        name: "tailscale_device_summary",
        description: "Get a summary of devices by OS type, online/offline status, and update availability.",
        inputSchema: {
          type: "object",
          properties: {},
        },
      },
    ],
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case "tailscale_list_devices": {
        const data: TailscaleDevicesResponse = await callTailscaleAPI(
          `/tailnet/${TAILSCALE_TAILNET}/devices`
        );

        const fields = args?.fields as string[] | undefined;

        let devices = data.devices;
        if (fields && fields.length > 0) {
          // Filter to only requested fields
          devices = devices.map((device) => {
            const filtered: any = {};
            fields.forEach((field) => {
              if (field in device) {
                filtered[field] = (device as any)[field];
              }
            });
            return filtered;
          });
        }

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  total: devices.length,
                  devices,
                },
                null,
                2
              ),
            },
          ],
        };
      }

      case "tailscale_get_device": {
        const deviceId = args?.deviceId as string;
        if (!deviceId) {
          throw new Error("deviceId parameter is required");
        }

        const data: TailscaleDevicesResponse = await callTailscaleAPI(
          `/tailnet/${TAILSCALE_TAILNET}/devices`
        );

        // Try to find by ID or name
        const device = data.devices.find(
          (d) => d.id === deviceId || d.name === deviceId || d.hostname === deviceId
        );

        if (!device) {
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(
                  {
                    error: `Device not found: ${deviceId}`,
                    hint: "Try using tailscale_list_devices to see available devices",
                  },
                  null,
                  2
                ),
              },
            ],
          };
        }

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(device, null, 2),
            },
          ],
        };
      }

      case "tailscale_list_online_devices": {
        const data: TailscaleDevicesResponse = await callTailscaleAPI(
          `/tailnet/${TAILSCALE_TAILNET}/devices`
        );

        const onlineDevices = data.devices.filter((d) => d.connectedToControl);

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  total: onlineDevices.length,
                  devices: onlineDevices.map((d) => ({
                    name: d.name,
                    hostname: d.hostname,
                    addresses: d.addresses,
                    os: d.os,
                    lastSeen: d.lastSeen,
                  })),
                },
                null,
                2
              ),
            },
          ],
        };
      }

      case "tailscale_list_offline_devices": {
        const data: TailscaleDevicesResponse = await callTailscaleAPI(
          `/tailnet/${TAILSCALE_TAILNET}/devices`
        );

        const offlineDevices = data.devices.filter((d) => !d.connectedToControl);

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  total: offlineDevices.length,
                  devices: offlineDevices.map((d) => ({
                    name: d.name,
                    hostname: d.hostname,
                    os: d.os,
                    lastSeen: d.lastSeen,
                  })),
                },
                null,
                2
              ),
            },
          ],
        };
      }

      case "tailscale_check_updates": {
        const data: TailscaleDevicesResponse = await callTailscaleAPI(
          `/tailnet/${TAILSCALE_TAILNET}/devices`
        );

        const devicesWithUpdates = data.devices.filter((d) => d.updateAvailable);

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  total: devicesWithUpdates.length,
                  devices: devicesWithUpdates.map((d) => ({
                    name: d.name,
                    hostname: d.hostname,
                    os: d.os,
                    currentVersion: d.clientVersion,
                    connectedToControl: d.connectedToControl,
                  })),
                },
                null,
                2
              ),
            },
          ],
        };
      }

      case "tailscale_device_summary": {
        const data: TailscaleDevicesResponse = await callTailscaleAPI(
          `/tailnet/${TAILSCALE_TAILNET}/devices`
        );

        const osCounts: Record<string, number> = {};
        let onlineCount = 0;
        let offlineCount = 0;
        let updatesAvailable = 0;

        data.devices.forEach((device) => {
          // Count by OS
          osCounts[device.os] = (osCounts[device.os] || 0) + 1;

          // Count online/offline
          if (device.connectedToControl) {
            onlineCount++;
          } else {
            offlineCount++;
          }

          // Count updates
          if (device.updateAvailable) {
            updatesAvailable++;
          }
        });

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  totalDevices: data.devices.length,
                  online: onlineCount,
                  offline: offlineCount,
                  updatesAvailable,
                  devicesByOS: osCounts,
                },
                null,
                2
              ),
            },
          ],
        };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            {
              error: error instanceof Error ? error.message : String(error),
            },
            null,
            2
          ),
        },
      ],
      isError: true,
    };
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Tailscale MCP server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
