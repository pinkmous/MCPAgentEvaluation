import { z } from "zod";

export const echoTool = {
  name: "echo-tool",
  config: {
    title: "LLM Echo Tool",
    description: "Echoes the input prompt",
    inputSchema: {
      prompt: z.string(),
    },
  },
  handler: async (
    args: { prompt: string }
  ) => {
    const prompt = args.prompt;

    return {
      content: [
        {
          type: "text" as const,  // must be literal "text"
          text: `Echo from MCP Server: ${prompt}`,
        },
      ],
    };
  },
};