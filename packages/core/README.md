# @piffle/core

Core library for piffle. Provides provider registries, configuration management, and shared types.

## Installation

```bash
pnpm add @piffle/core
```

## Features

- TTS provider registry
- LLM provider registry
- Configuration file management
- Audio playback utilities

## Usage

### TTS Provider Registry

```typescript
import {
  registerProvider,
  getProvider,
  listProviders,
  getDefaultProvider,
} from "@piffle/core";

// Register a provider
registerProvider(myProvider);

// Get provider by name
const provider = getProvider("kokoro");

// List all providers
const providers = listProviders(); // ["kokoro", "voicebox"]

// Get default provider
const defaultProvider = getDefaultProvider();
```

### LLM Provider Registry

```typescript
import {
  registerLLMProvider,
  getLLMProvider,
  listLLMProviders,
  setDefaultLLMProvider,
} from "@piffle/core";

// Register providers
registerLLMProvider(ollamaProvider);
registerLLMProvider(claudeProvider);

// Get provider
const llm = getLLMProvider("claude");

// Set default
setDefaultLLMProvider("claude");
```

### Configuration

```typescript
import {
  loadConfig,
  saveConfig,
  resolveConfig,
  getConfigPath,
  createDefaultConfig,
} from "@piffle/core";

// Get config file path
const path = getConfigPath(); // ~/.config/piffle/config.json

// Load config (returns null if not exists)
const config = await loadConfig();

// Save config (creates with chmod 600)
await saveConfig(createDefaultConfig());

// Resolve config with priority: CLI > env > file > defaults
const resolved = await resolveConfig({ llm: "claude" });
```

### Audio Playback

```typescript
import { playAudio } from "@piffle/core";

// Play audio buffer (WAV format)
await playAudio(audioBuffer);
```

## Types

### TTSProvider

```typescript
interface TTSProvider {
  readonly name: string;
  initialize(): Promise<void>;
  generate(text: string, voice: string): Promise<Buffer>;
  listVoices(): Promise<string[]>;
  getDefaultVoice(): string;
}
```

### LLMProvider

```typescript
interface LLMProvider {
  readonly name: string;
  initialize(): Promise<void>;
  summarize(text: string, options?: SummarizeOptions): Promise<string>;
  isAvailable(): Promise<boolean>;
}

interface SummarizeOptions {
  maxLength?: number;
  language?: string;
}
```

### PiffleConfig

```typescript
interface PiffleConfig {
  version: 1;
  llm?: {
    defaultProvider?: "ollama" | "claude" | "openrouter";
    ollama?: { model?: string; baseUrl?: string };
    claude?: { model?: string; apiKeyEnv?: string };
    openrouter?: { model?: string; apiKeyEnv?: string };
  };
  tts?: {
    defaultProvider?: "kokoro" | "voicebox";
    kokoro?: { defaultVoice?: string };
    voicebox?: { host?: string; port?: number; defaultSpeakerId?: number };
  };
  summarize?: {
    language?: string;
    maxLength?: number;
  };
}
```

## API

### Registry Functions

| Function                        | Description                 |
| ------------------------------- | --------------------------- |
| `registerProvider(provider)`    | Register a TTS provider     |
| `getProvider(name)`             | Get TTS provider by name    |
| `listProviders()`               | List all TTS provider names |
| `getDefaultProvider()`          | Get default TTS provider    |
| `setDefaultProvider(name)`      | Set default TTS provider    |
| `registerLLMProvider(provider)` | Register an LLM provider    |
| `getLLMProvider(name)`          | Get LLM provider by name    |
| `listLLMProviders()`            | List all LLM provider names |
| `getDefaultLLMProvider()`       | Get default LLM provider    |
| `setDefaultLLMProvider(name)`   | Set default LLM provider    |

### Config Functions

| Function                     | Description                     |
| ---------------------------- | ------------------------------- |
| `getConfigDir()`             | Get config directory path       |
| `getConfigPath()`            | Get config file path            |
| `loadConfig()`               | Load config from file           |
| `saveConfig(config)`         | Save config to file (chmod 600) |
| `configExists()`             | Check if config file exists     |
| `createDefaultConfig()`      | Create default config object    |
| `resolveConfig(cliOptions?)` | Resolve config with priority    |

### Utilities

| Function                           | Description                      |
| ---------------------------------- | -------------------------------- |
| `playAudio(buffer)`                | Play audio buffer                |
| `logger`                           | Logging utility                  |
| `getNestedValue(obj, path)`        | Get nested value by dot path     |
| `setNestedValue(obj, path, value)` | Set nested value by dot path     |
| `parseValue(value)`                | Parse string to appropriate type |

## License

MIT
