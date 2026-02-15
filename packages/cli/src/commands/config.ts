import chalk from "chalk";
import {
  loadConfig,
  saveConfig,
  getConfigPath,
  resolveConfig,
  configExists,
  createDefaultConfig,
  getNestedValue,
  setNestedValue,
  parseValue,
  type PiffleConfig,
} from "@piffle/core";

export interface ConfigShowOptions {
  resolved?: boolean;
}

/**
 * piffle config show - 設定の表示
 */
export async function configShowCommand(
  options: ConfigShowOptions
): Promise<void> {
  if (options.resolved) {
    const resolved = await resolveConfig();
    console.log(chalk.bold("\nResolved configuration:\n"));
    console.log(JSON.stringify(resolved, null, 2));
    console.log();
    return;
  }

  const config = await loadConfig();
  if (!config) {
    console.log(chalk.yellow("\nNo configuration file found."));
    console.log(chalk.dim(`  Expected path: ${getConfigPath()}\n`));
    return;
  }

  console.log(chalk.bold(`\nConfiguration (${getConfigPath()}):\n`));
  console.log(JSON.stringify(config, null, 2));
  console.log();
}

/**
 * piffle config set <key> <value> - 設定の更新
 */
export async function configSetCommand(
  key: string,
  value: string
): Promise<void> {
  const config: PiffleConfig = (await loadConfig()) ?? createDefaultConfig();

  // ドット記法でネストしたキーを設定（例: llm.ollama.model）
  setNestedValue(
    config as unknown as Record<string, unknown>,
    key,
    parseValue(value)
  );

  await saveConfig(config);
  console.log(chalk.green(`\nSet ${key} = ${value}`));
  console.log(chalk.dim(`  File: ${getConfigPath()}\n`));
}

/**
 * piffle config get <key> - 特定のキーの値を取得
 */
export async function configGetCommand(key: string): Promise<void> {
  const config = await loadConfig();
  if (!config) {
    console.log(chalk.yellow("No configuration file found."));
    return;
  }

  const value = getNestedValue(config, key);
  if (value === undefined) {
    console.log(chalk.yellow(`Key "${key}" not found.`));
    return;
  }

  if (typeof value === "object") {
    console.log(JSON.stringify(value, null, 2));
  } else {
    console.log(value);
  }
}

/**
 * piffle config init - 設定ファイルの初期化
 */
export async function configInitCommand(): Promise<void> {
  if (await configExists()) {
    console.log(chalk.yellow("\nConfiguration file already exists."));
    console.log(chalk.dim(`  Path: ${getConfigPath()}\n`));
    return;
  }

  const config = createDefaultConfig();
  await saveConfig(config);
  console.log(chalk.green(`\nCreated configuration file: ${getConfigPath()}`));
  console.log(chalk.dim("  Permissions: 600 (owner read/write only)\n"));
}

/**
 * piffle config path - 設定ファイルのパスを表示
 */
export function configPathCommand(): void {
  console.log(getConfigPath());
}
