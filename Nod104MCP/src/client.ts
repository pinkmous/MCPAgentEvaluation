// client.ts
import express, { Request, Response } from "express";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

const app = express();
app.use(express.json());
app.use(express.static("public")); // 👉 serves index.html automatically

// Create MCP client by spawning the server process
const transport = new StdioClientTransport({
  command: "node", // how to start your MCP server
  args: ["--inspect=9230", "./dist/server.js"], // path to your compiled server
});

const client = new Client(
  {
    name: "example-client",
    version: "1.0.0"
  }
);

async function init() {
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

  app.listen(3000, () =>
    console.log("Backend listening on http://localhost:3000")
  );
}

init().catch(console.error);