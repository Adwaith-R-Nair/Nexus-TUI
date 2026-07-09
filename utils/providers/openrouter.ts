import type { ChatRequest, ChatResponse } from "./types";
import { executeReadFile, executeWriteFile, executeListDirectory, executeRunCommand } from "./tools";

const tools = [
  {
    type: "function",
    function: {
      name: "read_file",
      description: "Read the contents of a file at a given path on the user's filesystem",
      parameters: {
        type: "object",
        properties: {
          path: { type: "string", description: "The relative or absolute path to the file to read" },
        },
        required: ["path"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "write_file",
      description: "Writes content to a file at a given path, overwriting it if it already exists. Call this tool directly - the system handles user confirmation automatically.",
      parameters: {
        type: "object",
        properties: {
          path: { type: "string", description: "The path to write to" },
          content: { type: "string", description: "The full content to write" },
        },
        required: ["path", "content"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "list_directory",
      description: "List the files and folders inside a given directory path",
      parameters: {
        type: "object",
        properties: {
          path: { type: "string", description: "The directory path to list. Use '.' for current directory." },
        },
        required: ["path"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "run_command",
      description: "Run a shell command on the user's machine and return its output. This is a sensitive action - call it directly, the system handles user confirmation automatically.",
      parameters: {
        type: "object",
        properties: {
          command: { type: "string", description: "The exact shell command to execute" },
        },
        required: ["command"],
      },
    },
  },
];

export async function chatWithOpenRouter(request: ChatRequest): Promise<ChatResponse> {

  const [apiKey, model = "openrouter/free"] = request.apiKey.split("|");
  const messages: any[] = [
    { role: "user", content: request.prompt }
  ];

  for (let i = 0; i < 5; i++) {

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
        "HTTP-Referer": "https://github.com/nexus-tui",
        "X-Title": "Nexus TUI",
      },
      body: JSON.stringify({
        model,
        messages,
        tools,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenRouter API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const message = data.choices[0].message;
    const finishReason = data.choices[0].finish_reason;

    if (finishReason !== "tool_calls") {
      return { text: message.content || "(no response text)" };
    }

    messages.push(message);

    for (const call of message.tool_calls) {
      const args = JSON.parse(call.function.arguments);
      let toolResult: string;

      if (call.function.name === "read_file") {
        toolResult = await executeReadFile(args);
      } else if (call.function.name === "write_file") {
        toolResult = await executeWriteFile(args);
      } else if (call.function.name === "list_directory") {
        toolResult = await executeListDirectory(args);
      } else if (call.function.name === "run_command") {
        toolResult = await executeRunCommand(args);
      } else {
        toolResult = `Unknown tool: ${call.function.name}`;
      }

      messages.push({
        role: "tool",
        tool_call_id: call.id,
        content: toolResult,
      });
    }
  }

  throw new Error("Too many tool call iterations - possible loop");
}