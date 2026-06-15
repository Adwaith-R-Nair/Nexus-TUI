import { join } from "path";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";

const CONFIG_DIR = join(process.env.HOME || "~", ".config", "nexus");

const CONFIG_FILE = join(CONFIG_DIR, "config.json");
const CREDENTIALS_FILE = join(CONFIG_DIR, "credentials.json");

export type NexusConfig = {
    defaultProvider: string;
}

export type NexusCredentials = {
    [provider: string]: string;
}

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


// TEMP: test — remove this after
ensureConfigDir();
writeConfig({ defaultProvider: "claude" });
writeCredentials({ claude: "test-key-123" });
console.log(readConfig());
console.log(readCredentials());