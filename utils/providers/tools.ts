export const readFileTool = {
  name: "read_file",
  description: "Read the contents of a file at a given path on the user's filesystem",
  input_schema: {
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

export async function executeReadFile(input: { path: string }): Promise<string> {
  try {
    const content = await Bun.file(input.path).text();
    return content;
  } catch (error) {
    return `Error reading file: ${(error as Error).message}`;
  }
}