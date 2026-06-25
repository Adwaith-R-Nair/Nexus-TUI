import type { ChatRequest, ChatResponse } from "./types";
import { executeReadFile } from "./tools";

const readFileFunctionDeclaration = {
  name: "read_file",
  description: "Read the contents of a file at a given path on the user's filesystem",
  parameters: {
    type: "object",
    properties: {
      path: {
        type: "string",
        description: "The relative or absolute path to the file to read",
      },
    },
    required: ["path"],
  },
};

export async function chatWithGemini(request: ChatRequest): Promise<ChatResponse> {
  const url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

  // We keep the running conversation here, since tool use needs multiple back-and-forths
  const contents: any[] = [
    { role: "user", parts: [{ text: request.prompt }] }
  ];

  // We loop because Gemini might ask for a tool, then ask for ANOTHER tool, etc.
  // We cap it at 5 rounds so a bug can't cause an infinite loop
  for (let i = 0; i < 5; i++) {

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": request.apiKey,
      },
      body: JSON.stringify({
        contents,
        tools: [{ functionDeclarations: [readFileFunctionDeclaration] }],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const candidate = data.candidates[0];
    const parts = candidate.content.parts;

    // Check if Gemini wants to call a tool
    const functionCallPart = parts.find((p: any) => p.functionCall);

    if (!functionCallPart) {
      // No tool call — Gemini gave us a final text answer, we're done
      const textPart = parts.find((p: any) => p.text);
      return { text: textPart?.text || "(no response text)" };
    }

    // Gemini wants to call a tool — let's execute it
    const { name, args } = functionCallPart.functionCall;

    let toolResult: string;
    if (name === "read_file") {
      toolResult = await executeReadFile(args);
    } else {
      toolResult = `Unknown tool: ${name}`;
    }

    // Add Gemini's tool request AND our tool result to the conversation,
    // so the next loop iteration has full context
    contents.push({ role: "model", parts: [{ functionCall: functionCallPart.functionCall }] });
    contents.push({
      role: "user",
      parts: [{ functionResponse: { name, response: { result: toolResult } } }],
    });
  }

  throw new Error("Too many tool call iterations — possible loop");
}