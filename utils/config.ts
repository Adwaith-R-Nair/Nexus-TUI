import { join } from "path";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";

const CONFIG_DIR = join(process.env.HOME || "~", ".config", "nexus");

const CONFIG_FILE = join(CONFIG_DIR, "config.json");
const CREDENTIALS_FILE = join(CONFIG_DIR, "credentials.json");
const HISTORY_FILE = join(CONFIG_DIR, "history.json");

export type NexusConfig = {
    defaultProvider: string;
}

export type NexusCredentials = {
    [provider: string]: string;
}

export type HistoryEntry = {
  id: string;
  provider: string;
  prompt: string;
  response: string;
  timestamp: string;
};

export function ensureConfigDir() {
  if (!existsSync(CONFIG_DIR)) {
    mkdirSync(CONFIG_DIR, { recursive: true });
  }
}

export function readConfig(): NexusConfig {
  ensureConfigDir();
  if (!existsSync(CONFIG_FILE)) {
    return { defaultProvider: "claude" };
  }
  const raw = readFileSync(CONFIG_FILE, "utf-8");
  return JSON.parse(raw) as NexusConfig;
}

export function writeConfig(config: NexusConfig) {
  ensureConfigDir();
  writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
}

export function readCredentials(): NexusCredentials {
  ensureConfigDir();
  if (!existsSync(CREDENTIALS_FILE)) {
    return {};
  }
  const raw = readFileSync(CREDENTIALS_FILE, "utf-8");
  return JSON.parse(raw) as NexusCredentials;
}

export function writeCredentials(credentials: NexusCredentials) {
  ensureConfigDir();
  writeFileSync(CREDENTIALS_FILE, JSON.stringify(credentials, null, 2));
}

export function readHistory(): HistoryEntry[] {
  ensureConfigDir();
  if (!existsSync(HISTORY_FILE)) {
    return [];
  }
  const raw = readFileSync(HISTORY_FILE, "utf-8");
  return JSON.parse(raw) as HistoryEntry[];
}

export function addHistoryEntry(entry: HistoryEntry) {
  const history = readHistory();
  history.push(entry);
  writeFileSync(HISTORY_FILE, JSON.stringify(history, null, 2));
}

export function clearHistory() {
  writeFileSync(HISTORY_FILE, JSON.stringify([], null, 2));
}