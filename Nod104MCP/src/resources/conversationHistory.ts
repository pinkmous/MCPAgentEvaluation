import { ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";

import type { Variables } from "@modelcontextprotocol/sdk/shared/uriTemplate.js";

type Role = "system" | "user" | "assistant";

interface Message {
  role: Role;
  text: string;
}

// Define the resource
export const conversationHistoryResource = {
  name: "conversationHistory",
  template: new ResourceTemplate("conversation://history/{action}", {list: undefined}),
  config: {
    title: "Conversation History",
    description: "Stores the conversation context between user and assistant",
  },
  history: [] as Message[],

  handler: async (
    uri: URL,
    variables: Variables,
  ) => {
    const action = variables.action as string;

    if (action === "Delete") {
      conversationHistoryResource.history = [];
      return { contents: [{ uri: uri.href, text: "History cleared." }] };
    }

    // Default: return history as text
    const log = conversationHistoryResource.history
      .map(({ role, text }) => `${role}: ${text}`)
      .join("\n");

    return { contents: [{ uri: uri.href, text: log || "(empty)" }] };
  },
};

// helper function for tools to append messages
export function addToConversationHistory(role: "user" | "assistant", text: string) {
  conversationHistoryResource.history.push({ role, text });
}