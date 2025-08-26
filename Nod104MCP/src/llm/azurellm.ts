// azureLLM.ts
import { DefaultAzureCredential, getBearerTokenProvider } from "@azure/identity";
import { AzureOpenAI } from "openai";
import type { ChatCompletionMessageParam } from "openai/resources/chat";
import "dotenv/config";

const endpoint = process.env.AZURE_OPENAI_ENDPOINT!;
const deployment = process.env.AZURE_OPENAI_DEPLOYMENT!;

const credential = new DefaultAzureCredential();
const scope = "https://cognitiveservices.azure.com/.default";
const azureADTokenProvider = getBearerTokenProvider(credential, scope);

const azClient = new AzureOpenAI({
  endpoint,
  azureADTokenProvider,
  apiVersion: "2024-08-01-preview",
  deployment,
});

export async function askAzureLLM(question: string, model: string): Promise<string> {
  const messages: ChatCompletionMessageParam[] = [
    { role: "system", content: "You are a helpful assistant." },
    { role: "user", content: question },
  ];

  const response = await azClient.chat.completions.create({
    messages,
    model,
  });

  return response.choices[0].message?.content || "No answer";
}