import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

import { echoTool } from "./tools/echoTool.js";
import { qaTool } from "./tools/qaTool.js";
import { conversationHistoryResource } from "./resources/conversationHistory.js";

const server = new McpServer({
  name: "demo-mcp-server",
  version: "1.0.0",
});

// Register tools
server.registerTool(echoTool.name, echoTool.config, echoTool.handler);

// Create qaTool using the server instance
const qa = qaTool(server);
server.registerTool(qa.name, qa.config, qa.handler);

// Register resources
server.registerResource(
  conversationHistoryResource.name,
  conversationHistoryResource.template,
  conversationHistoryResource.config,
  conversationHistoryResource.handler
);

// Create a transport (this actually “starts” the server)
const transport = new StdioServerTransport();

// Start the server with the transport
await server.connect(transport);

console.log("MCP Server started and ready...");