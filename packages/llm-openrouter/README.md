# @piffle/llm-openrouter

OpenRouter LLM provider for piffle. Access multiple AI models through OpenRouter API.

## Installation

```bash
pnpm add @piffle/llm-openrouter
```

## Requirements

- OpenRouter API key ([Get one here](https://openrouter.ai/keys))

## Usage

```typescript
import { createOpenRouterProvider } from "@piffle/llm-openrouter";
import { registerLLMProvider } from "@piffle/core";

// Register with API key from environment
registerLLMProvider(createOpenRouterProvider());

// Or with custom options
registerLLMProvider(
  createOpenRouterProvider({
    apiKey: "sk-or-xxx",
    model: "anthropic/claude-3-haiku",
  })
);
```

### Summarization

```typescript
const provider = createOpenRouterProvider();

// Check availability (verifies API key is set)
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

| Variable             | Description        | Default                    |
| -------------------- | ------------------ | -------------------------- |
| `OPENROUTER_API_KEY` | API key (required) | -                          |
| `OPENROUTER_MODEL`   | Model name         | `openai/gpt-oss-120b:free` |

### Constructor Options

```typescript
interface OpenRouterProviderOptions {
  apiKey?: string; // API key (or use env var)
  model?: string; // Model name
}
```

### Config File

In `~/.config/piffle/config.json`:

```json
{
  "llm": {
    "openrouter": {
      "model": "anthropic/claude-3-haiku",
      "apiKeyEnv": "OPENROUTER_API_KEY"
    }
  }
}
```

Note: API keys are stored as environment variable names, not values.

## Available Models

OpenRouter provides access to many models. Some popular options:

| Model                       | Description           |
| --------------------------- | --------------------- |
| `openai/gpt-oss-120b:free`  | Free tier model       |
| `anthropic/claude-3-haiku`  | Fast Claude model     |
| `anthropic/claude-3-sonnet` | Balanced Claude model |
| `google/gemini-pro`         | Google's Gemini       |
| `meta-llama/llama-3-70b`    | Llama 3 70B           |

See [OpenRouter Models](https://openrouter.ai/models) for full list.

## API

### `createOpenRouterProvider(options?)`

Creates an OpenRouter LLM provider instance.

### `OpenRouterProvider`

| Method                      | Description                    |
| --------------------------- | ------------------------------ |
| `initialize()`              | Initialize provider (no-op)    |
| `isAvailable()`             | Check if API key is configured |
| `summarize(text, options?)` | Summarize text                 |

### `SummarizeOptions`

| Option      | Type     | Default    | Description     |
| ----------- | -------- | ---------- | --------------- |
| `language`  | `string` | `"日本語"` | Output language |
| `maxLength` | `number` | `100`      | Max characters  |

## License

MIT
