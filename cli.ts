import { program } from 'commander';
import { modelsCommand } from './commands/models';
import { agentCommand } from './commands/agent';
import { providerCommand } from './commands/providers';
import { historyCommand } from './commands/history';
import { interactiveCommand } from './commands/interactive';
import chalk from 'chalk';

console.log(
  chalk.cyan.bold(`
  ███╗   ██╗███████╗██╗  ██╗██╗   ██╗███████╗
  ████╗  ██║██╔════╝╚██╗██╔╝██║   ██║██╔════╝
  ██╔██╗ ██║█████╗   ╚███╔╝ ██║   ██║███████╗
  ██║╚██╗██║██╔══╝   ██╔██╗ ██║   ██║╚════██║
  ██║ ╚████║███████╗██╔╝ ██╗╚██████╔╝███████║
  ╚═╝  ╚═══╝╚══════╝╚═╝  ╚═╝ ╚═════╝ ╚══════╝
  `)
);
console.log(chalk.gray("  Your multi-provider AI powerhouse in the terminal\n"));

program
  .name('nexus')
  .description('Your multi-provider AI powerhouse in the terminal')
  .version('0.1.0')
  .addCommand(modelsCommand)
  .addCommand(agentCommand)
  .addCommand(providerCommand)
  .addCommand(historyCommand)
  .addCommand(interactiveCommand);

program.parse();