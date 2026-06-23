import { Command } from 'commander';
import { readCredentials, writeCredentials } from '../../utils/config';
import chalk from 'chalk';

export const logoutCommand = new Command("logout")
  .description('Remove your API key for a provider')
  .option('-p, --provider <providerName>', 'Name of the provider to logout from', '')
  .action((options) => {

    if (!options.provider) {
      console.log(chalk.red("Please provide --provider"));
      console.log(chalk.yellow("Example: bun cli.ts providers logout -p claude"));
      return;
    }

    const credentials = readCredentials();

    if (!credentials[options.provider]) {
      console.log(chalk.red(`No API key found for ${options.provider}`));
      return;
    }

    delete credentials[options.provider];
    writeCredentials(credentials);

    console.log(chalk.green(`Logged out from ${options.provider} successfully!`));
  });