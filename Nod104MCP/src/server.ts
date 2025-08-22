import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

import 'dotenv/config';
import { DefaultAzureCredential, getBearerTokenProvider } from '@azure/identity';
import { AzureOpenAI } from 'openai';
import type { ChatCompletionMessageParam } from "openai/resources/chat";

// Azure OpenAI config
const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
const deployment = process.env.AZURE_OPENAI_DEPLOYMENT;
const model = process.env.AZURE_OPENAI_MODEL;

// Azure AD auth
const credential = new DefaultAzureCredential();
const scope = "https://cognitiveservices.azure.com/.default";
const azureADTokenProvider = getBearerTokenProvider(credential, scope);

// Instantiate client
const azClient = new AzureOpenAI({ endpoint, azureADTokenProvider, apiVersion: '2024-08-01-preview', deployment });


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

// Register Q&A tool
server.registerTool(
  "qa-tool",
  {
    description: "Ask a question to LLM",
    inputSchema: {
      question: z.string(),
    },
  },
  async (args) => {
    console.log("Received question:", args.question);
    const question = args.question;

    // Prepare messages array for Azure OpenAI
    const messages: ChatCompletionMessageParam[] = [
      { role: "system", content: "You are a helpful assistant." },
      { role: "user", content: question },
    ];

    // Azure OpenAI chat completion
    const response = await azClient.chat.completions.create({
      messages,
      model: model!, // must match deployment name
    });

    const answer = response.choices[0].message?.content || "No answer";

    return {
      content: [
        {
          type: "text",
          text: answer,
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