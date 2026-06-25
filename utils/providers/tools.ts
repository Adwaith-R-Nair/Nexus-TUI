import { confirm } from "@inquirer/prompts";
import chalk from "chalk";
import { spinner } from "../spinner";

export async function executeReadFile(input: { path: string }): Promise<string> {
  try {
    const content = await Bun.file(input.path).text();
    return content;
  } catch (error) {
    return `Error reading file: ${(error as Error).message}`;
  }
}

export async function executeWriteFile(input: { path: string; content: string }): Promise<string> {
  spinner.stop();

  console.log("");
  console.log(chalk.yellow(`Gemini wants to write to: ${input.path}`));
  console.log(chalk.gray("--- Content preview ---"));
  console.log(input.content);
  console.log(chalk.gray("------------------------"));

  const approved = await confirm({
    message: `Allow writing to ${input.path}?`,
    default: false,
  });

  spinner.start();

  if (!approved) {
    return "User denied permission to write this file.";
  }

  try {
    await Bun.write(input.path, input.content);
    return `Successfully wrote to ${input.path}`;
  } catch (error) {
    return `Error writing file: ${(error as Error).message}`;
  }
}