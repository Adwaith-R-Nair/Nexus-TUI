import type { ChatRequest, ChatResponse } from "./types";
import { executeReadFile, executeWriteFile, executeListDirectory, executeRunCommand } from "./tools";

const tools = [
  {
    type: "function",
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
  {
    type: "function",
    name: "write_file",
    description: "Writes content to a file at a given path, overwriting it if it already exists. Call this tool directly whenever the user asks you to create or write a file — do not ask the user for confirmation yourself in text, the system will handle confirmation automatically when this tool is called.",
    parameters: {
      type: "object",
      properties: {
        path: { type: "string", description: "The relative or absolute path to the file to write" },
        content: { type: "string", description: "The full content to write into the file" },
      },
      required: ["path", "content"],
    },
  },
  {
    type: "function",
    name: "list_directory",
    description: "List the files and folders inside a given directory path",
    parameters: {
      type: "object",
      properties: {
        path: { type: "string", description: "The directory path to list. Use '.' for the current directory." },
      },
      required: ["path"],
    },
  },
  {
    type: "function",
    name: "run_command",
    description: "Run a shell command on the user's machine and return its output. This is a sensitive action — call it directly, the system will handle user confirmation automatically.",
    parameters: {
      type: "object",
      properties: {
        command: { type: "string", description: "The exact shell command to execute" },
      },
      required: ["command"],
    },
  },
];

export async function chatWithOpenAI(request: ChatRequest): Promise<ChatResponse> {

  const input: any[] = [
    { role: "user", content: request.prompt }
  ];

  for (let i = 0; i < 5; i++) {

    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${request.apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        input,
        tools,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();

    const functionCalls = data.output.filter((item: any) => item.type === "function_call");

    if (functionCalls.length === 0) {
      const messageItem = data.output.find((item: any) => item.type === "message");
      const textContent = messageItem?.content?.find((c: any) => c.type === "output_text");
      return { text: textContent?.text || "(no response text)" };
    }

    input.push(...data.output);

    for (const call of functionCalls) {
      const args = JSON.parse(call.arguments);

      let toolResult: string;
      if (call.name === "read_file") {
        toolResult = await executeReadFile(args);
      } else if (call.name === "write_file") {
        toolResult = await executeWriteFile(args);
      } else if (call.name === "list_directory") {
        toolResult = await executeListDirectory(args);
      } else if (call.name === "run_command") {
        toolResult = await executeRunCommand(args);
      } else {
        toolResult = `Unknown tool: ${call.name}`;
      }

      input.push({
        type: "function_call_output",
        call_id: call.call_id,
        output: toolResult,
      });
    }
  }

  throw new Error("Too many tool call iterations — possible loop");
}