import chalk from "chalk";
import { listProviders, getDefaultProvider } from "@piffle/core";

export function providersCommand(): void {
  const providers = listProviders();
  const defaultProvider = getDefaultProvider();

  console.log(chalk.bold("\nAvailable TTS providers:\n"));

  for (const name of providers) {
    const isDefault = name === defaultProvider.name;
    const suffix = isDefault ? chalk.dim(" (default)") : "";
    console.log(`  ${chalk.cyan(name)}${suffix}`);
  }

  console.log();
}
