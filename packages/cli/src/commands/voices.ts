import ora from "ora";
import chalk from "chalk";
import { getProvider, getDefaultProvider, logger } from "@piffle/core";

export interface VoicesOptions {
  provider: string;
}

export async function voicesCommand(options: VoicesOptions): Promise<void> {
  const spinner = ora("Loading voices...").start();

  try {
    const provider = getProvider(options.provider) ?? getDefaultProvider();

    await provider.initialize();
    const voices = await provider.listVoices();
    spinner.stop();

    console.log(chalk.bold(`\nAvailable voices for ${provider.name}:\n`));

    // Group by prefix
    const groups: Record<string, string[]> = {};
    for (const voice of voices) {
      const prefix = voice.slice(0, 3);
      if (!groups[prefix]) {
        groups[prefix] = [];
      }
      groups[prefix].push(voice);
    }

    const prefixLabels: Record<string, string> = {
      af_: "American English (Female)",
      am_: "American English (Male)",
      bf_: "British English (Female)",
      bm_: "British English (Male)",
    };

    for (const [prefix, voiceList] of Object.entries(groups)) {
      const label = prefixLabels[prefix] ?? prefix;
      console.log(chalk.cyan(`  ${label}:`));
      console.log(`    ${voiceList.join(", ")}\n`);
    }

    console.log(chalk.dim(`  Default: ${provider.getDefaultVoice()}\n`));
  } catch (error) {
    spinner.fail("Error occurred");
    logger.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}
