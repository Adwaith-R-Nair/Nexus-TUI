import type { ChatRequest, ChatResponse } from "./types";

export async function chatWithGemini(request: ChatRequest): Promise<ChatResponse> {
  const url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": request.apiKey,
    },
    body: JSON.stringify({
      contents: [
        { parts: [{ text: request.prompt }] }
      ]
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  return { text: data.candidates[0].content.parts[0].text };
}