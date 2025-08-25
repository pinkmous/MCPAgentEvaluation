import { z } from "zod";
import 'dotenv/config';
import { DefaultAzureCredential, getBearerTokenProvider } from '@azure/identity';
import { AzureOpenAI } from 'openai';
import type { ChatCompletionMessageParam } from "openai/resources/chat";

import { addToConversationHistory } from "../resources/conversationHistory.js"

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

export const qaTool = {
  name: "qa-tool",
  config: {
    description: "Ask a question to LLM",
    inputSchema: {
      question: z.string(),
    },
  },
  handler: async (args: { question: string }) => {
    console.log("Received question:", args.question);
    const question = args.question;

    const messages: ChatCompletionMessageParam[] = [
      { role: "system", content: "You are a helpful assistant." },
      { role: "user", content: question },
    ];

    const response = await azClient.chat.completions.create({
      messages,
      model: model!,
    });

    const answer = response.choices[0].message?.content || "No answer";

    // Save both question and answer
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
  },
};