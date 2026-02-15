import type { LLMProvider } from "./llm-types.js";

const providers = new Map<string, LLMProvider>();
let defaultProviderName: string | null = null;

export function registerLLMProvider(provider: LLMProvider): void {
  providers.set(provider.name, provider);
  if (defaultProviderName === null) {
    defaultProviderName = provider.name;
  }
}

export function getLLMProvider(name: string): LLMProvider | undefined {
  return providers.get(name);
}

export function listLLMProviders(): string[] {
  return Array.from(providers.keys());
}

export function getDefaultLLMProvider(): LLMProvider {
  if (!defaultProviderName) {
    throw new Error("No LLM providers registered");
  }
  const provider = providers.get(defaultProviderName);
  if (!provider) {
    throw new Error("Default LLM provider not found");
  }
  return provider;
}

export function setDefaultLLMProvider(name: string): void {
  if (!providers.has(name)) {
    throw new Error(`LLM Provider "${name}" not found`);
  }
  defaultProviderName = name;
}
