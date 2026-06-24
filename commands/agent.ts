import { Command } from "commander";
import { readCredentials, readConfig } from "../utils/config";
import { getProviderFunction } from "../utils/providers";
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
      const chatFunction = getProviderFunction(config.defaultProvider);
      const result = await chatFunction({ prompt: options.prompt, apiKey });
      console.log(chalk.cyan(result.text));
    } catch (error) {
      console.log(chalk.red("Error: " + (error as Error).message));
    }
  });