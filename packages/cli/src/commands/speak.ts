import ora from "ora";
import { writeFile } from "node:fs/promises";
import type { ResolvedConfig } from "@piffle/core";
import {
  getProvider,
  getDefaultProvider,
  getLLMProvider,
  getDefaultLLMProvider,
  playAudio,
  logger,
} from "@piffle/core";

export interface SpeakOptions {
  voice?: string;
  provider: string;
  output?: string;
  summarize?: boolean;
  llm?: string;
  prompt?: string;
  fallback?: string;
}

export async function speakCommand(
  text: string | undefined,
  options: SpeakOptions,
  config: ResolvedConfig
): Promise<void> {
  const spinner = ora("Loading...").start();

  try {
    // Handle text input
    let inputText = text ?? "";

    // If no text provided, try reading from stdin
    if (!inputText && !process.stdin.isTTY) {
      spinner.text = "Reading from stdin...";
      inputText = await readStdin();
    }

    if (!inputText) {
      spinner.fail("No text provided");
      process.exit(1);
    }

    // Handle summarization
    let textToSpeak = inputText;

    if (options.summarize) {
      spinner.text = "Summarizing...";

      try {
        const llmProvider = options.llm
          ? getLLMProvider(options.llm)
          : getDefaultLLMProvider();

        if (!llmProvider) {
          throw new Error(`LLM provider "${options.llm}" not found`);
        }

        // Check if provider is available
        const availability = await llmProvider.isAvailable();
        if (!availability.available) {
          if (options.fallback) {
            textToSpeak = options.fallback;
          } else {
            const reason = availability.reason ?? "unexpected error";
            throw new Error(
              `LLM provider "${llmProvider.name}" is not available: ${reason}`
            );
          }
        } else {
          await llmProvider.initialize();
          textToSpeak = await llmProvider.summarize(inputText, {
            maxLength: config.summarize.maxLength,
            language: config.summarize.language,
            prompt: options.prompt ?? config.summarize.prompt,
          });
        }
      } catch (error) {
        if (options.fallback) {
          textToSpeak = options.fallback;
        } else {
          throw error;
        }
      }
    }

    // Get TTS provider
    spinner.text = "Loading model...";
    const provider = getProvider(options.provider) ?? getDefaultProvider();

    // Initialize provider
    await provider.initialize();
    spinner.text = "Generating speech...";

    // Use specified voice or default
    const voice = options.voice ?? provider.getDefaultVoice();

    // Generate audio
    const audioBuffer = await provider.generate(textToSpeak, voice);

    if (options.output) {
      // Save to file
      spinner.text = "Saving file...";
      await writeFile(options.output, audioBuffer);
      spinner.succeed(`Saved to ${options.output}`);
    } else {
      // Play audio directly
      spinner.text = "Playing...";
      spinner.stop();
      await playAudio(audioBuffer);
    }
  } catch (error) {
    spinner.fail("Error occurred");
    logger.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

async function readStdin(): Promise<string> {
  return new Promise((resolve) => {
    let data = "";
    process.stdin.setEncoding("utf8");
    process.stdin.on("data", (chunk) => {
      data += chunk;
    });
    process.stdin.on("end", () => {
      resolve(data.trim());
    });
  });
}
