import { Command } from "commander";
import { readCredentials, readConfig } from "../utils/config";
import { chatWithGemini } from "../utils/providers/gemini";
import { chatWithClaude } from "../utils/providers/claude";
import chalk from "chalk";

export const agentCommand = new Command("agent")
  .description('Runs the agent')
  .option('-p, --prompt <prompt>', 'prompt', '')
  .action(async (options) => {

    if (!options.prompt) {
      console.log(chalk.red("Please provide a prompt"));
      console.log(chalk.yellow('Example: bun cli.ts agent -p "explain recursion"'));
      return;
    }

    const config = readConfig();
    const credentials = readCredentials();
    const apiKey = credentials[config.defaultProvider];

    if (!apiKey) {
      console.log(chalk.red(`No API key found for ${config.defaultProvider}`));
      console.log(chalk.yellow(`Run: bun cli.ts providers login -p ${config.defaultProvider} -a YOUR_KEY`));
      return;
    }

    console.log(chalk.gray("Thinking..."));

    try {
      let result;

      if (config.defaultProvider === "claude") {
        result = await chatWithClaude({ prompt: options.prompt, apiKey });
      } else if (config.defaultProvider === "gemini") {
        result = await chatWithGemini({ prompt: options.prompt, apiKey });
      } else {
        console.log(chalk.red(`Unsupported provider: ${config.defaultProvider}`));
        return;
      }

      console.log(chalk.cyan(result.text));
    } catch (error) {
      console.log(chalk.red("Error: " + (error as Error).message));
    }
  });