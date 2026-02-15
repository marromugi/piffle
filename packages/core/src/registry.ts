import type { TTSProvider } from "./types.js";

const providers = new Map<string, TTSProvider>();
let defaultProviderName: string | null = null;

export function registerProvider(provider: TTSProvider): void {
  providers.set(provider.name, provider);
  if (defaultProviderName === null) {
    defaultProviderName = provider.name;
  }
}

export function getProvider(name: string): TTSProvider | undefined {
  return providers.get(name);
}

export function listProviders(): string[] {
  return Array.from(providers.keys());
}

export function getDefaultProvider(): TTSProvider {
  if (!defaultProviderName) {
    throw new Error("No providers registered");
  }
  const provider = providers.get(defaultProviderName);
  if (!provider) {
    throw new Error("Default provider not found");
  }
  return provider;
}

export function setDefaultProvider(name: string): void {
  if (!providers.has(name)) {
    throw new Error(`Provider "${name}" not found`);
  }
  defaultProviderName = name;
}
