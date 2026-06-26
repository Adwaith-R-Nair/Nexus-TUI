import type { ChatRequest, ChatResponse } from "./types";
import { executeReadFile, executeWriteFile, executeListDirectory, executeRunCommand } from "./tools";

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

const writeFileFunctionDeclaration = {
  name: "write_file",
  description: "Writes content to a file at a given path, overwriting it if it already exists. Call this tool directly whenever the user asks you to create or write a file — do not ask the user for confirmation yourself in text, the system will handle confirmation automatically when this tool is called.",
  parameters: {
    type: "object",
    properties: {
      path: {
        type: "string",
        description: "The relative or absolute path to the file to write",
      },
      content: {
        type: "string",
        description: "The full content to write into the file",
      },
    },
    required: ["path", "content"],
  },
};

const listDirectoryFunctionDeclaration = {
  name: "list_directory",
  description: "List the files and folders inside a given directory path",
  parameters: {
    type: "object",
    properties: {
      path: {
        type: "string",
        description: "The relative or absolute path to the directory to list. Use '.' for the current directory.",
      },
    },
    required: ["path"],
  },
};

const runCommandFunctionDeclaration = {
  name: "run_command",
  description: "Run a shell command on the user's machine and return its output. Use this for tasks like running tests, checking versions, or git status. This is a sensitive action — call it directly, the system will handle user confirmation automatically.",
  parameters: {
    type: "object",
    properties: {
      command: {
        type: "string",
        description: "The exact shell command to execute",
      },
    },
    required: ["command"],
  },
};

export async function chatWithGemini(request: ChatRequest): Promise<ChatResponse> {
  const url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

  const contents: any[] = [
    { role: "user", parts: [{ text: request.prompt }] }
  ];

  for (let i = 0; i < 5; i++) {

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": request.apiKey,
      },
      body: JSON.stringify({
        contents,
        tools: [{ functionDeclarations: [readFileFunctionDeclaration, writeFileFunctionDeclaration, listDirectoryFunctionDeclaration, runCommandFunctionDeclaration,] }],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const candidate = data.candidates[0];
    const parts = candidate.content.parts;

    const functionCallPart = parts.find((p: any) => p.functionCall);

    if (!functionCallPart) {
      const textPart = parts.find((p: any) => p.text);
      return { text: textPart?.text || "(no response text)" };
    }

    const { name, args } = functionCallPart.functionCall;

    let toolResult: string;
    if (name === "read_file") {
      toolResult = await executeReadFile(args);
    } else if (name === "write_file") {
      toolResult = await executeWriteFile(args);
    } else if (name == "list_directory") {
      toolResult = await executeListDirectory(args);
    } else if (name == "run_command") {
      toolResult = await executeRunCommand(args);
    } else {
      toolResult = `Unknown tool: ${name}`;
    }

    contents.push({ role: "model", parts: [{ functionCall: functionCallPart.functionCall }] });
    contents.push({
      role: "user",
      parts: [{ functionResponse: { name, response: { result: toolResult } } }],
    });
  }

  throw new Error("Too many tool call iterations — possible loop");
}