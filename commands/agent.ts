import { Command } from "commander";
import { readCredentials, readConfig, addHistoryEntry } from "../utils/config";
import { getProviderFunction } from "../utils/providers";
import chalk from "chalk";
import { spinner } from "../utils/spinner";
import boxen from "boxen";

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

    spinner.text = chalk.gray(`Thinking with ${config.defaultProvider}...`);
    spinner.start();

    try {
      const chatFunction = getProviderFunction(config.defaultProvider);
      const result = await chatFunction({ prompt: options.prompt, apiKey });

      spinner.succeed(chalk.green("Response ready!"));

      addHistoryEntry({
        id: Date.now().toString(),
        provider: config.defaultProvider,
        prompt: options.prompt,
        response: result.text,
        timestamp: new Date().toISOString(),
      });

      console.log(
        boxen(result.text, {
          padding: 1,
          margin: 1,
          borderColor: "cyan",
          borderStyle: "round",
          title: config.defaultProvider,
          titleAlignment: "left",
        })
      );
    } catch (error) {
      spinner.fail(chalk.red("Something went wrong"));
      console.log(chalk.red("Error: " + (error as Error).message));
    }
  });