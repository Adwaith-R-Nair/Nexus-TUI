# Nexus

```
███╗   ██╗███████╗██╗  ██╗██╗   ██╗███████╗
████╗  ██║██╔════╝╚██╗██╔╝██║   ██║██╔════╝
██╔██╗ ██║█████╗   ╚███╔╝ ██║   ██║███████╗
██║╚██╗██║██╔══╝   ██╔██╗ ██║   ██║╚════██║
██║ ╚████║███████╗██╔╝ ██╗╚██████╔╝███████║
╚═╝  ╚═══╝╚══════╝╚═╝  ╚═╝ ╚═════╝ ╚══════╝
```

**Your multi-provider AI powerhouse in the terminal.**

Nexus is a CLI agent that lets you chat with Claude, Gemini, OpenAI, Ollama, and 400+ models via OpenRouter from a single interface. Switch providers with one command, run agentic tool-use loops, and keep a persistent history of every conversation — all without leaving your terminal.

---

## Features

- **Multi-provider** — Claude, Gemini, OpenAI, Ollama (local), and OpenRouter (400+ models including free tier) out of the box
- **Agentic tool use** — Claude, Gemini, OpenAI, and OpenRouter providers run a full agentic loop — reading files, writing files, listing directories, and running shell commands autonomously
- **Human-in-the-loop safety** — file writes and shell commands require explicit approval before execution
- **Persistent history** — every prompt and response is saved to `~/.config/nexus/history.json`
- **Per-provider credentials** — API keys are stored locally in `~/.config/nexus/credentials.json`, never sent anywhere other than the respective provider

---

## Requirements

- [Bun](https://bun.sh) v1.0 or later

---

## Installation

```bash
git clone <repo-url>
cd tui
bun install
```

---

## Quick Start

```bash
# 1. Save your API key and set the default provider
bun cli.ts providers login -p claude -a YOUR_ANTHROPIC_KEY

# 2. Send a prompt
bun cli.ts agent -p "explain how recursion works"
```

---

## Commands

### `agent` — Chat with the active provider

```bash
bun cli.ts agent -p "<your prompt>"
```

Sends your prompt to the currently active provider, runs any tool calls the model makes (with your approval), and prints the final response in a styled box.

**Options**

| Flag | Description |
|---|---|
| `-p, --prompt <text>` | The prompt to send |

**Example**

```bash
bun cli.ts agent -p "read my package.json and summarize the dependencies"
```

---

### `models` — List available providers

```bash
bun cli.ts models
```

Shows all supported providers, their login status, and which one is currently set as default.

---

### `history` — View or clear past conversations

```bash
bun cli.ts history           # print all past conversations
bun cli.ts history --clear   # delete all history
```

**Options**

| Flag | Description |
|---|---|
| `-c, --clear` | Wipe all saved history |

---

### `interactive` — Launch interactive mode

```bash
bun cli.ts interactive
# or shorthand:
bun cli.ts i
```

Full keyboard-driven interface — no flags to memorize. Navigate with arrow keys, press Enter to select. Includes chat, history viewer, and provider management all in one menu.

---

### `providers` — Manage provider credentials

#### Login

```bash
bun cli.ts providers login -p <provider> -a <api_key>
```

Saves an API key for the given provider and sets it as the default.

| Provider | Where to get a key |
|---|---|
| `claude` | [console.anthropic.com](https://console.anthropic.com) |
| `gemini` | [aistudio.google.com](https://aistudio.google.com) |
| `openai` | [platform.openai.com](https://platform.openai.com) |
| `ollama` | No key needed — pass any value, e.g. `local` |
| `openrouter` | [openrouter.ai](https://openrouter.ai) — free tier available, pass as `KEY\|model-id` |

#### OpenRouter model selection

Specify your model by appending it after a `|` separator:

```bash
# Auto free router — picks best available free model
bun cli.ts providers login -p openrouter -a "sk-or-YOUR_KEY|openrouter/free"

# Specific free model
bun cli.ts providers login -p openrouter -a "sk-or-YOUR_KEY|meta-llama/llama-3.3-70b-instruct:free"

# Paid model
bun cli.ts providers login -p openrouter -a "sk-or-YOUR_KEY|anthropic/claude-haiku-4-5"
```

#### Set default

```bash
bun cli.ts providers set -p <provider>
```

Switches the active provider (must already be logged in).

#### Logout

```bash
bun cli.ts providers logout -p <provider>
```

Removes the stored API key for that provider.

---

## Agentic Tools

When using Claude, Gemini, OpenAI or OpenRouter, the model can invoke tools to interact with your local system. Each provider runs an agentic loop (up to 5 iterations) until it produces a final text response.

| Tool | What it does | Requires approval? |
|---|---|---|
| `read_file` | Read a file from the filesystem | No |
| `write_file` | Write content to a file | **Yes** |
| `list_directory` | List files and folders in a directory | No |
| `run_command` | Execute a shell command | **Yes** |

For tools that require approval, Nexus will show you exactly what the model wants to do and prompt you to confirm before anything is executed.

> **Ollama:** Tool use is implemented but currently blocked by an upstream Ollama pipeline bug with `qwen3` tool call serialisation. Simple chat works fully.

---

## Data Storage

All data is stored locally under `~/.config/nexus/`:

| File | Contents |
|---|---|
| `config.json` | Active default provider |
| `credentials.json` | API keys, keyed by provider name |
| `history.json` | All past prompts and responses |

---

## Project Structure

```
tui/
├── cli.ts                        # Entry point, registers all commands
├── commands/
│   ├── agent.ts                  # `agent` command
│   ├── history.ts                # `history` command
│   ├── interactive.ts            # `interactive` command
│   ├── models.ts                 # `models` command
│   └── providers/
│       ├── index.ts              # `providers` parent command
│       ├── login.ts              # `providers login`
│       ├── logout.ts             # `providers logout`
│       └── setProvider.ts        # `providers set`
└── utils/
    ├── config.ts                 # Read/write config, credentials, history
    ├── spinner.ts                # Shared ora spinner instance
    └── providers/
        ├── types.ts              # ChatRequest / ChatResponse / ChatFunction
        ├── index.ts              # Provider registry
        ├── claude.ts             # Anthropic provider (tool use)
        ├── gemini.ts             # Google Gemini provider (tool use)
        ├── openai.ts             # OpenAI provider (tool use, Responses API)
        ├── openrouter.ts         # OpenRouter provider (tool use, 400+ models)
        ├── ollama.ts             # Ollama local provider
        └── tools.ts              # Tool executors shared across providers
```

---

## Tech Stack

| Package | Purpose |
|---|---|
| [Bun](https://bun.sh) | Runtime and file I/O |
| [commander](https://github.com/tj/commander.js) | CLI argument parsing |
| [chalk](https://github.com/chalk/chalk) | Terminal colours |
| [boxen](https://github.com/sindresorhus/boxen) | Styled output boxes |
| [ora](https://github.com/sindresorhus/ora) | Spinner while waiting for responses |
| [@inquirer/prompts](https://github.com/SBoudrias/Inquirer.js) | Interactive confirmation prompts |

> All provider integrations use raw `fetch()` against each provider's HTTP API directly — no official SDKs. This keeps the dependency footprint minimal and makes the request/response contract explicit.