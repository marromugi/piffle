#!/usr/bin/env node

// Import TTS providers (side effect: registers providers)
import "@piffle/provider-kokoro";
import "@piffle/provider-voicebox";

// Import core utilities
import {
  registerLLMProvider,
  setDefaultLLMProvider,
  resolveConfig,
} from "@piffle/core";
import { createOllamaProvider } from "@piffle/llm-ollama";
import { createOpenRouterProvider } from "@piffle/llm-openrouter";
import { createClaudeProvider } from "@piffle/llm-claude";
import { createClaudeCodeProvider } from "@piffle/llm-claude-code";

import { Command } from "commander";
import { speakCommand, type SpeakOptions } from "./commands/speak.js";
import { voicesCommand } from "./commands/voices.js";
import { providersCommand } from "./commands/providers.js";
import {
  configShowCommand,
  configSetCommand,
  configGetCommand,
  configInitCommand,
  configPathCommand,
} from "./commands/config.js";

async function main() {
  // Load configuration
  const config = await resolveConfig();

  // Register LLM providers with configuration
  registerLLMProvider(
    createOllamaProvider({
      model: config.llm.ollama.model,
      baseUrl: config.llm.ollama.baseUrl,
    })
  );
  registerLLMProvider(
    createOpenRouterProvider({
      apiKey: config.llm.openrouter.apiKey,
      model: config.llm.openrouter.model,
    })
  );
  registerLLMProvider(
    createClaudeProvider({
      apiKey: config.llm.claude.apiKey,
      model: config.llm.claude.model,
    })
  );
  registerLLMProvider(createClaudeCodeProvider());

  // Set default LLM provider from configuration
  if (config.llm.defaultProvider) {
    try {
      setDefaultLLMProvider(config.llm.defaultProvider);
    } catch {
      // Provider might not be registered yet, ignore
    }
  }

  const program = new Command();

  program
    .name("piffle")
    .description("Text-to-speech CLI tool with LLM summarization")
    .version("0.0.0");

  // Default command: speak text
  program
    .argument("[text]", "Text to speak (or pipe from stdin)")
    .option("-v, --voice <voice>", "Voice to use")
    .option("-p, --provider <provider>", "TTS provider", "kokoro")
    .option("-o, --output <file>", "Save to file instead of playing")
    .option("-s, --summarize", "Summarize text using LLM before speaking")
    .option(
      "-l, --llm <provider>",
      "LLM provider for summarization (ollama, openrouter, claude, claude-code)",
      config.llm.defaultProvider
    )
    .option(
      "--prompt <template>",
      "Custom prompt template for summarization (use {text}, {maxLength}, {language} placeholders)"
    )
    .option(
      "-f, --fallback <message>",
      "Fallback message if LLM is unavailable"
    )
    .action((text: string | undefined, options: SpeakOptions) =>
      speakCommand(text, options, config)
    );

  // Voices subcommand
  program
    .command("voices")
    .description("List available voices")
    .option("-p, --provider <provider>", "TTS provider", "kokoro")
    .action(voicesCommand);

  // Providers subcommand
  program
    .command("providers")
    .description("List available TTS providers")
    .action(providersCommand);

  // Config subcommand
  const configCmd = program
    .command("config")
    .description("Manage configuration");

  configCmd
    .command("show")
    .description("Show current configuration")
    .option(
      "-r, --resolved",
      "Show resolved configuration (merged with env and defaults)"
    )
    .action(configShowCommand);

  configCmd
    .command("set <key> <value>")
    .description(
      "Set a configuration value (e.g., llm.ollama.model llama3.2:3b)"
    )
    .action(configSetCommand);

  configCmd
    .command("get <key>")
    .description("Get a configuration value")
    .action(configGetCommand);

  configCmd
    .command("init")
    .description("Initialize configuration file")
    .action(configInitCommand);

  configCmd
    .command("path")
    .description("Show configuration file path")
    .action(configPathCommand);

  program.parse();
}

main().catch(console.error);
