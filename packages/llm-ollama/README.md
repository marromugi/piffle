# @piffle/llm-ollama

Ollama LLM provider for piffle. Enables local LLM summarization using Ollama.

## Installation

```bash
pnpm add @piffle/llm-ollama
```

## Requirements

- [Ollama](https://ollama.ai/) running locally
- A downloaded model (e.g., `ollama pull llama3.2:1b`)

## Usage

```typescript
import { createOllamaProvider } from "@piffle/llm-ollama";
import { registerLLMProvider } from "@piffle/core";

// Register with default options
registerLLMProvider(createOllamaProvider());

// Or with custom options
registerLLMProvider(
  createOllamaProvider({
    model: "llama3.2:3b",
    baseUrl: "http://localhost:11434",
  })
);
```

### Summarization

```typescript
const provider = createOllamaProvider();

// Check availability
if (await provider.isAvailable()) {
  await provider.initialize();

  const summary = await provider.summarize("Long text...", {
    language: "日本語",
    maxLength: 100,
  });
}
```

## Configuration

### Environment Variables

| Variable       | Description       | Default                  |
| -------------- | ----------------- | ------------------------ |
| `OLLAMA_MODEL` | Model name        | `llama3.2:1b`            |
| `OLLAMA_URL`   | Ollama server URL | `http://localhost:11434` |

### Constructor Options

```typescript
interface OllamaProviderOptions {
  model?: string; // Model name
  baseUrl?: string; // Server URL
}
```

## API

### `createOllamaProvider(options?)`

Creates an Ollama LLM provider instance.

### `OllamaProvider`

| Method                      | Description                            |
| --------------------------- | -------------------------------------- |
| `initialize()`              | Initialize provider (no-op for Ollama) |
| `isAvailable()`             | Check if Ollama server is reachable    |
| `summarize(text, options?)` | Summarize text                         |

### `SummarizeOptions`

| Option      | Type     | Default    | Description     |
| ----------- | -------- | ---------- | --------------- |
| `language`  | `string` | `"日本語"` | Output language |
| `maxLength` | `number` | `100`      | Max characters  |

## License

MIT
