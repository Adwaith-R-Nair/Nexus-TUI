import { Command } from "commander";
import { readHistory, clearHistory } from "../utils/config";
import chalk from "chalk";
import boxen from "boxen";

export const historyCommand = new Command("history")
  .description('View or clear your past conversations')
  .option('-c, --clear', 'clear all history', false)
  .action((options) => {

    if (options.clear) {
      clearHistory();
      console.log(chalk.green("History cleared"));
      return;
    }

    const history = readHistory();

    if (history.length === 0) {
      console.log(chalk.gray("No history yet. Run 'nexus agent -p \"your prompt\"' to get started."));
      return;
    }

    for (const entry of history) {
      const date = new Date(entry.timestamp).toLocaleString();

      console.log(
        boxen(
          `${chalk.bold("Prompt:")} ${entry.prompt}\n${chalk.bold("Response:")} ${entry.response}`,
          {
            padding: 1,
            margin: { top: 1, bottom: 0, left: 1, right: 1 },
            borderColor: "blue",
            borderStyle: "round",
            title: `${entry.provider} — ${date}`,
            titleAlignment: "left",
          }
        )
      );
    }
  });