import { Command } from 'commander';
import { readCredentials, writeCredentials, writeConfig } from '../../utils/config';
import chalk from 'chalk';

export const loginCommand = new Command("login")
  .description('Save your API key for a provider')
  .option('-p, --provider <providerName>', 'Name of the provider (claude, gemini, openai, ollama)', '')
  .option('-a, --api_key <apiKey>', 'Your API key', '')
  .action((options) => {

    if (!options.provider || !options.api_key) {
      console.log(chalk.red("Please provide both --provider and --api_key"));
      console.log(chalk.yellow("Example: bun cli.ts providers login -p claude -a YOUR_KEY"));
      return;
    }

    const credentials = readCredentials();

    credentials[options.provider] = options.api_key;

    writeCredentials(credentials);

    writeConfig({ defaultProvider: options.provider });

    console.log(chalk.green(`Logged in to ${options.provider} successfully!`));
    console.log(chalk.gray(`API key saved to ~/.config/nexus/credentials.json`));
  });