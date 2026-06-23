import { Command } from 'commander';
import { readCredentials, writeConfig } from '../../utils/config';
import chalk from 'chalk';

export const setProviderCommand = new Command("set")
  .description('Set your default AI provider')
  .option('-p, --provider <providerName>', 'Name of the provider to set as default', '')
  .action((options) => {

    if (!options.provider) {
      console.log(chalk.red("Please provide --provider"));
      console.log(chalk.yellow("Example: bun cli.ts providers set -p gemini"));
      return;
    }

    const credentials = readCredentials();
    if (!credentials[options.provider]) {
      console.log(chalk.red(`You haven't logged into ${options.provider} yet`));
      console.log(chalk.yellow(`Run: bun cli.ts providers login -p ${options.provider} -a YOUR_KEY`));
      return;
    }

    writeConfig({ defaultProvider: options.provider });
    console.log(chalk.green(`Default provider set to ${options.provider}`));
  });