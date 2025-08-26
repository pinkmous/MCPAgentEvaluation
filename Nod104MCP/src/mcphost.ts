// client.ts
import express, { Request, Response } from "express";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { askAzureLLM } from "./llm/azurellm.js";
import { CreateMessageRequestSchema } from "@modelcontextprotocol/sdk/types.js";

const app = express();
app.use(express.json());
app.use(express.static("public")); // 👉 serves index.html automatically

// Create MCP client by spawning the server process
const transport = new StdioClientTransport({
  command: "node", // how to start your MCP server
  args: ["--inspect=9230", "./dist/server.js"], // path to your compiled server
});

// Initialize client with sampling capability
const client = new Client(
  {
    name: "example-client",
    version: "1.0.0",
  },
  {
    capabilities: {
      sampling: {}, // Enable sampling support
    },
  }
);

async function init() {
  // Sampling handler → wires Azure LLM to server’s requests
  // Register a handler for sampling requests
  client.setRequestHandler(CreateMessageRequestSchema, async (req) => {
    // req.params.messages is the array sent by the MCP server tool
    const userMsg = req.params.messages?.find((m: any) => m.role === "user");
    const userMessage =
      userMsg && userMsg.content && userMsg.content.type === "text"
        ? (userMsg.content.text as string)
        : undefined;
    const model = req.params.model || process.env.AZURE_OPENAI_MODEL;
    // const maxTokens = req.params.maxTokens || 500;
    const answer = userMessage ? await askAzureLLM(userMessage, model as string) : "No input provided";

    return {
      role: "assistant",
      content: {
        type: "text",
        text: answer, // must be string
      },  
      model: req.params.model
    };
});

  await client.connect(transport); // establish connection with server
  console.log("MCP Client connected to server");

  app.post("/query", async (req: Request, res: Response) => {
    const { question } = req.body as { question: string };
    try {
        const response = await client.callTool({
            name: "qa-tool",
            arguments: {
                question,
            }
    });
      res.json(response);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/history", async (req, res) => {
    const { action } = req.body as { action: string };
    // Compose the full URI using the action variable
    const uri = `conversation://history/${action}`;

    try {
      const response = await client.readResource({ uri});
      res.json(response);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.listen(3000, () =>
    console.log("Backend listening on http://localhost:3000")
  );
}

init().catch(console.error);