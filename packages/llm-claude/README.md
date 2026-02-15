# @piffle/llm-claude

Claude (Anthropic) LLM provider for piffle. Enables text summarization using Claude API.

## Installation

```bash
pnpm add @piffle/llm-claude
```

## Requirements

- Anthropic API key ([Get one here](https://console.anthropic.com/))

## Usage

```typescript
import { createClaudeProvider } from "@piffle/llm-claude";
import { registerLLMProvider } from "@piffle/core";

// Register with API key from environment
registerLLMProvider(createClaudeProvider());

// Or with custom options
registerLLMProvider(
  createClaudeProvider({
    apiKey: "sk-ant-xxx",
    model: "claude-haiku-4-20250514",
  })
);
```

### Summarization

```typescript
const provider = createClaudeProvider();

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

| Variable            | Description        | Default                   |
| ------------------- | ------------------ | ------------------------- |
| `ANTHROPIC_API_KEY` | API key (required) | -                         |
| `ANTHROPIC_MODEL`   | Model name         | `claude-haiku-4-20250514` |

### Constructor Options

```typescript
interface ClaudeProviderOptions {
  apiKey?: string; // API key (or use env var)
  model?: string; // Model name
}
```

### Config File

In `~/.config/piffle/config.json`:

```json
{
  "llm": {
    "claude": {
      "model": "claude-haiku-4-20250514",
      "apiKeyEnv": "ANTHROPIC_API_KEY"
    }
  }
}
```

Note: API keys are stored as environment variable names, not values.

## API

### `createClaudeProvider(options?)`

Creates a Claude LLM provider instance.

### `ClaudeProvider`

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
