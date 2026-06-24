import type { ChatFunction } from "./types";
import { chatWithClaude } from "./claude";
import { chatWithGemini } from "./gemini";

export const providerRegistry: Record<string, ChatFunction> = {
  claude: chatWithClaude,
  gemini: chatWithGemini,
};

export function getProviderFunction(providerName: string): ChatFunction {
  const fn = providerRegistry[providerName];

  if (!fn) {
    throw new Error(`Unsupported provider: ${providerName}`);
  }

  return fn;
}