# @piffle/llm-claude-code

Claude Code (headless mode) LLM provider for piffle. Enables text summarization using the local Claude Code CLI.

## Requirements

- Claude Code CLI installed and authenticated

## Usage

```typescript
import { createClaudeCodeProvider } from "@piffle/llm-claude-code";
import { registerLLMProvider } from "@piffle/core";

// Register with default settings
registerLLMProvider(createClaudeCodeProvider());

// Or with custom options
registerLLMProvider(
  createClaudeCodeProvider({
    claudePath: "/usr/local/bin/claude",
    timeout: 120000,
  })
);
```

### Summarization

```typescript
const provider = createClaudeCodeProvider();

if ((await provider.isAvailable()).available) {
  await provider.initialize();

  const summary = await provider.summarize("Long text...", {
    language: "日本語",
    maxLength: 100,
  });
}
```

## Configuration

### Environment Variables

| Variable              | Description             | Default  |
| --------------------- | ----------------------- | -------- |
| `CLAUDE_CODE_PATH`    | Path to claude CLI      | `claude` |
| `CLAUDE_CODE_TIMEOUT` | Timeout in milliseconds | `60000`  |

### Constructor Options

```typescript
interface ClaudeCodeProviderOptions {
  claudePath?: string; // Path to claude CLI
  timeout?: number; // Timeout in milliseconds
}
```

## How It Works

This provider executes the Claude Code CLI in headless mode:

```bash
claude -p "your prompt" --output-format text -H
```
