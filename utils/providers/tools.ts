import { confirm } from "@inquirer/prompts";
import chalk from "chalk";
import { spinner } from "../spinner";
import { readdirSync } from "fs";
import { spawn } from "child_process";

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

export async function executeListDirectory(input: { path : string}): Promise<string> {
  try {
    const entries = readdirSync(input.path, { withFileTypes: true});
    const formatted = entries.map((entry) => {
      const type = entry.isDirectory() ? "📁" : "📄";
      return `${type} ${entry.name}`;
    });
    return formatted.join("\n");
  } catch (error) {
    return `Error listing directory: ${(error as Error).message}`;
  }
}

export async function executeRunCommand (input: { command: string }): Promise<string> {
  spinner.stop();

  console.log("");
  console.log(chalk.red.bold(`Gemini wants to run a shell command:`));
  console.log(chalk.red(`   ${input.command}`));
  console.log(chalk.yellow("This could modify or delete files, or do anything your account can do"));

  const approved = await confirm({
    message: `Allow running this command?`,
    default: false,
  });

  spinner.start();

  if(!approved) {
    return "User denied permission to run this command";
  }

  return new Promise((resolve) => {
    const child = spawn(input.command, { shell: true });

    let output = "";

    child.stdout.on("data", (data) => {
      output += data.toString();
    });

    child.stderr.on("data", (data) => {
      output += data.toString();
    });

    child.on("close", (code) => {
      resolve(`Exit code: ${code}\nOutput:\n${output}`);
    });
  });
}