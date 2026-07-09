import { Command } from "commander";
import { select, input, password } from "@inquirer/prompts";
import { readConfig, readCredentials, readHistory, writeConfig, writeCredentials } from "../utils/config";
import { getProviderFunction } from "../utils/providers";
import { providerRegistry } from "../utils/providers";
import chalk from "chalk";
import boxen from "boxen";
import { spinner } from "../utils/spinner";
import { addHistoryEntry } from "../utils/config";

export const interactiveCommand = new Command("interactive")
    .alias("i")
    .description("Launch interactive mode with arrow-key menus")
    .action(async () => {
        console.clear();
        console.log(chalk.cyan.bold("Welcome to Nexus Interactive Mode"));
        console.log(chalk.gray("Use arrow keys to navigate, Enter to select\n"));

        while(true) {
            const action = await select({
                message: "What do you want to do?",
                choices: [
                    { name: "Chat with AI", value: "chat"},
                    { name: "View history", value: "history"},
                    { name: "Manage providers", value: "providers"},
                    { name: "Exit", value: "exit"},
                ],
            });

            if (action === "exit") {
                console.log(chalk.gray("See ya later!\n"));
                process.exit(0);
            }
            if (action === "chat") await handleChat();
            if (action === "history") handleHistory();
            if (action === "providers") await handleProviders();

            console.log("");
        }
    });


async function handleChat() {
     const config = readConfig();
     const credentials = readCredentials();
     const providers = Object.keys(providerRegistry);


     const provider = await select({
        message: "Which provider?",
        choices: providers.map((p) => ({
            name: p === config.defaultProvider ? `${p} (default)` : p,
            value: p,
            disabled: !credentials[p] ? "(not logged in)" : false,
        })),
        default: config.defaultProvider,
     });

     const prompt = await input({
        message: "Your prompt:",
        validate: (value) => value.trim().length > 0 || "Prompt cannot be empty",
     });

     const apiKey = credentials[provider];

     spinner.text = chalk.gray(`Thinking with ${provider}...`);
     spinner.start();

     try {
        const chatFunction = getProviderFunction(provider);
        const result = await chatFunction({ prompt, apiKey});

        spinner.succeed(chalk.green("Response ready!"));

        addHistoryEntry({
            id: Date.now().toString(),
            provider,
            prompt,
            response: result.text,
            timestamp: new Date().toISOString(),
        });

        console.log(
            boxen(result.text, {
                padding: 1,
                margin: 1,
                borderColor: "cyan",
                borderStyle: "round",
                title: provider,
                titleAlignment: "left",
            })
        );
     } catch (error) {
        spinner.fail(chalk.red("Something went wrong"));
        console.log(chalk.red("Error: " + (error as Error).message));
     }
}

function handleHistory() {
  const history = readHistory();

  if (history.length === 0) {
    console.log(chalk.yellow("\nNo history yet. Start chatting first!\n"));
    return;
  }

  const recent = history.slice(-5).reverse();

  for (const entry of recent) {
    const date = new Date(entry.timestamp).toLocaleString();
    const content =
      chalk.gray(date) + "\n\n" +
      chalk.bold("You: ") + entry.prompt + "\n\n" +
      chalk.cyan(`${entry.provider}: `) + entry.response;

    console.log(
      boxen(content, {
        padding: 1,
        margin: { top: 1, bottom: 0, left: 0, right: 0 },
        borderColor: "gray",
        borderStyle: "round",
      })
    );
  }
}
async function handleProviders() {
    const action = await select({
        message: "Provide management:",
        choices: [
            { name: "Login to a provider", value: "login" },
            { name: "Logout from a provider", value: "logout" },
            { name: "Set default provider", value: "set" },
            { name: "View all providers", value: "view" },
            { name: "Back", value: "back" },
        ]
    });

    if (action == "back") return;

    const config = readConfig();
    const credentials = readCredentials();
    const providers = Object.keys(providerRegistry);

    if (action === "view") {
        let output = "";
        for (const name of providers) {
            const isLoggedIn = !!credentials[name];
            const isDefault = config.defaultProvider === name;
            const status = isLoggedIn ? chalk.green("✓ logged in") : chalk.gray("✗ not logged in");
            const defaultTag = isDefault ? chalk.cyan(" (default)") : "";
            output += `${chalk.bold(name)}${defaultTag} - ${status}\n`;
        }
        console.log(
            boxen(output.trim(), {
                padding: 1,
                margin: 1,
                borderColor: "magenta",
                borderStyle: "round",
                title: "Providers",
                titleAlignment: "left",
            })
        );
        return;
    }

    if (action === "login") {
        const provider = await select({
            message: "Which provider to login to?",
            choices: providers.map((p) => ({ name: p, value: p})),
        });

        const apiKey = await password({
            message: `Enter API key for ${provider}:`,
            validate: (value) => value.trim().length > 0 || "API key cannot be empty",
        });

        credentials[provider] = apiKey;
        writeCredentials(credentials);
        writeConfig({ defaultProvider: provider });
        console.log(chalk.green(`\n Logged into ${provider} and set as default!\n`));
        return;
    }

    if (action == "logout") {
        const loggedIn = providers.filter((p) => !!credentials[p]);

        if (loggedIn.length === 0) {
            console.log(chalk.yellow("\nNo providers logged in.\n"));
            return;
        }

        const provider = await select({
            message: "Which provider to logout from?",
            choices: loggedIn.map((p) => ({ name: p, value: p })),
        });

        delete credentials[provider];
        writeCredentials(credentials);
        console.log(chalk.green(`\nLogged out from ${provider}\n`));
        return;
    }

    if (action === "set") {
        const loggedIn = providers.filter((p) => !!credentials[p]);

        if(loggedIn.length === 0) {
            console.log(chalk.yellow("\nNo providers logged in. Login first.\n"));
            return;
        }

        const provider = await select({
            message: "Set default provider:",
            choices: loggedIn.map((p) => ({
                name: p === config.defaultProvider ? `${p} (current)` : p,
                value: p,
            })),
        });

        writeConfig({ defaultProvider: provider });
        console.log(chalk.green(`\nDefault provider set to ${provider}\n`));
    }
}