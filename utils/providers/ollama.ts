import type { ChatRequest, ChatResponse } from "./types";

export async function chatWithOllama(request: ChatRequest): Promise<ChatResponse> {
  const response = await fetch("http://localhost:11434/api/generate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "qwen3:4b",
      prompt: request.prompt,
      stream: false,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Ollama API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  return { text: data.response };
}