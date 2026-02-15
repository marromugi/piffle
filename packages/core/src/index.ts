export type { TTSProvider } from "./types.js";
export {
  registerProvider,
  getProvider,
  listProviders,
  getDefaultProvider,
  setDefaultProvider,
} from "./registry.js";
export { logger } from "./logger.js";
export { playAudio } from "./player.js";

// LLM Provider
export type { LLMProvider, SummarizeOptions, AvailabilityResult } from "./llm-types.js";
export {
  registerLLMProvider,
  getLLMProvider,
  listLLMProviders,
  getDefaultLLMProvider,
  setDefaultLLMProvider,
} from "./llm-registry.js";

// Config
export type {
  PiffleConfig,
  LLMConfig,
  TTSConfig,
  SummarizeConfig,
  ResolvedConfig,
  CLIOptions,
} from "./config-types.js";
export type { PromptVariables } from "./config.js";
export {
  getConfigDir,
  getConfigPath,
  loadConfig,
  saveConfig,
  configExists,
  createDefaultConfig,
  resolveConfig,
  getNestedValue,
  setNestedValue,
  parseValue,
  buildPrompt,
  DEFAULT_SUMMARIZE_PROMPT,
} from "./config.js";
