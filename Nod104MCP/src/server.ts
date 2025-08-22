import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const server = new McpServer({
  name: "demo-mcp-server",
  version: "1.0.0",
});

// Register a tool
server.registerTool(
  "echo-tool",
  {
    title: "LLM Echo Tool",
    description: "Echoes the input prompt",
    inputSchema: {
      prompt: z.string(),
    },
    // outputSchema is optional; content defines actual response
  },
  async (args, extra) => {
    const prompt = args.prompt as string;

    // MCP expects the response as a CallToolResult
    return {
      content: [
        {
          type: "text",
          text: `Echo from MCP Server: ${prompt}`,
        },
      ],
    };
  }
);

// Create a transport (this actually “starts” the server)
const transport = new StdioServerTransport();

// Start the server with the transport
await server.connect(transport);

console.log("MCP Server started and ready...");