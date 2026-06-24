import type { ChatRequest, ChatResponse } from "./types";

export async function chatWithClaude(request: ChatRequest): Promise<ChatResponse> {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "x-api-key": request.apiKey,
            "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
            model: "claude-haiku-4-5",
            max_tokens: 1024,
            messages: [
                { role: "user", content: request.prompt}
            ]
        }),
    });

    if(!response.ok) {
        const errorText = await response.text();
        throw new Error(`Claude API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    return { text: data.content[0].text};
}