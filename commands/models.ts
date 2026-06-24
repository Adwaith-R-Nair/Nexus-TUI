import { Command } from "commander";
import { providerRegistry } from "../utils/providers";
import { readConfig, readCredentials } from "../utils/config";
import chalk from "chalk";
import boxen from "boxen";

export const modelsCommand = new Command("models")
  .description('Returns all the supported providers')
  .action(() => {
    const config = readConfig();
    const credentials = readCredentials();

    const providerNames = Object.keys(providerRegistry);

    let output = "";

    for (const name of providerNames) {
      const isLoggedIn = !!credentials[name];
      const isDefault = config.defaultProvider === name;

      const status = isLoggedIn ? chalk.green("✓ logged in") : chalk.gray("not logged in");
      const defaultTag = isDefault ? chalk.cyan(" (default)") : "";

      output += `${chalk.bold(name)}${defaultTag} — ${status}\n`;
    }

    console.log(
      boxen(output.trim(), {
        padding: 1,
        margin: 1,
        borderColor: "magenta",
        borderStyle: "round",
        title: "Available Providers",
        titleAlignment: "left",
      })
    );
  });