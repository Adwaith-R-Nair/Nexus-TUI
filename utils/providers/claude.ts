import type { ChatRequest, ChatResponse } from "./types";
import { executeReadFile, executeWriteFile, executeListDirectory, executeRunCommand } from "./tools";

const tools = [
  {
    name: "read_file",
    description: "Read the contents of a file at a given path on the user's filesystem",
    input_schema: {
      type: "object",
      properties: {
        path: { type: "string", description: "The relative or absolute path to the file to read" },
      },
      required: ["path"],
    },
  },
  {
    name: "write_file",
    description: "Writes content to a file at a given path, overwriting it if it already exists. Call this tool directly whenever the user asks you to create or write a file — do not ask the user for confirmation yourself in text, the system will handle confirmation automatically when this tool is called.",
    input_schema: {
      type: "object",
      properties: {
        path: { type: "string", description: "The relative or absolute path to the file to write" },
        content: { type: "string", description: "The full content to write into the file" },
      },
      required: ["path", "content"],
    },
  },
  {
    name: "list_directory",
    description: "List the files and folders inside a given directory path",
    input_schema: {
      type: "object",
      properties: {
        path: { type: "string", description: "The directory path to list. Use '.' for the current directory." },
      },
      required: ["path"],
    },
  },
  {
    name: "run_command",
    description: "Run a shell command on the user's machine and return its output. This is a sensitive action — call it directly, the system will handle user confirmation automatically.",
    input_schema: {
      type: "object",
      properties: {
        command: { type: "string", description: "The exact shell command to execute" },
      },
      required: ["command"],
    },
  },
];

export async function chatWithClaude(request: ChatRequest): Promise<ChatResponse> {

  const messages: any[] = [
    { role: "user", content: request.prompt }
  ];

  for (let i = 0; i < 5; i++) {

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
        messages,
        tools,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Claude API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();

    if (data.stop_reason !== "tool_use") {
      const textBlock = data.content.find((block: any) => block.type === "text");
      return { text: textBlock?.text || "(no response text)" };
    }

    const toolUseBlocks = data.content.filter((block: any) => block.type === "tool_use");

    messages.push({ role: "assistant", content: data.content });

    const toolResults = [];

    for (const block of toolUseBlocks) {
      let toolResult: string;

      if (block.name === "read_file") {
        toolResult = await executeReadFile(block.input);
      } else if (block.name === "write_file") {
        toolResult = await executeWriteFile(block.input);
      } else if (block.name === "list_directory") {
        toolResult = await executeListDirectory(block.input);
      } else if (block.name === "run_command") {
        toolResult = await executeRunCommand(block.input);
      } else {
        toolResult = `Unknown tool: ${block.name}`;
      }

      toolResults.push({
        type: "tool_result",
        tool_use_id: block.id,
        content: toolResult,
      });
    }

    messages.push({ role: "user", content: toolResults });
  }

  throw new Error("Too many tool call iterations — possible loop");
}