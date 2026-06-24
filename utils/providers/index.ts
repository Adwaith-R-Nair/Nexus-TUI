import type { ChatFunction } from "./types";
import { chatWithClaude } from "./claude";
import { chatWithGemini } from "./gemini";
import { chatWithOllama } from "./ollama";

export const providerRegistry: Record<string, ChatFunction> = {
  claude: chatWithClaude,
  gemini: chatWithGemini,
  ollama: chatWithOllama,
};

export function getProviderFunction(providerName: string): ChatFunction {
  const fn = providerRegistry[providerName];

  if (!fn) {
    throw new Error(`Unsupported provider: ${providerName}`);
  }

  return fn;
}