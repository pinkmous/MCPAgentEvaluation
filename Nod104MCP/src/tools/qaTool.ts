import { z } from "zod";
import "dotenv/config";
import { addToConversationHistory } from "../resources/conversationHistory.js";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

// Factory function that takes MCP server instance
export function qaTool(mcpServer: McpServer) {
  return {
    name: "qa-tool",
    config: {
      description: "Ask a question to LLM",
      inputSchema: { question: z.string() },
    },
    handler: async (args: { question: string }) => {
      const question = args.question;
      console.log("Received question:", question);

      try {
        const param = {
          messages: [
            {
              role: "user" as const,
              content: {
                type: "text" as const,
                text: `Please answer concisely:\n\n${question}`,
              },
            },
          ],
          maxTokens: 500,
          model: "gpt-5-mini", // REQUIRED
        };

        // Call the LLM through MCP server
        const response = await mcpServer.server.createMessage(param);

        const answer =
          response.content.type === "text"
            ? response.content.text
            : "Unable to generate answer";

        addToConversationHistory("user", question);
        addToConversationHistory("assistant", answer);

        return {
          content: [
            {
              type: "text" as const,
              text: answer,
            },
          ],
        };
      } catch (err) {
        console.error("Error calling createMessage:", err);
        return {
          content: [
            {
              type: "text" as const,
              text: "Error calling LLM",
            },
          ],
        };
      }
    },
  };
}