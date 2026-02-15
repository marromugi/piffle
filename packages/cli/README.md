# @piffle/cli

Command-line interface for piffle. Text-to-speech with LLM summarization.

## Installation

```bash
# From monorepo
pnpm build
pnpm link --global

# Or run directly
pnpm --filter @piffle/cli dev "Hello"
```

## Commands

### Speak Text

```bash
# Basic usage
piffle "Hello, world!"

# With specific voice
piffle "Hello" -v af_bella

# Save to file
piffle "Hello" -o output.wav

# Use specific TTS provider
piffle "Hello" -p voicebox
```

### Summarize and Speak

```bash
# Summarize with default LLM (Ollama)
piffle -s "Long text to summarize..."

# Use Claude
piffle -s -l claude "Text"

# Use OpenRouter
piffle -s -l openrouter "Text"

# Pipe from stdin
cat article.txt | piffle -s

# Fallback message if LLM unavailable
piffle -s -f "Fallback" "Text"
```

### List Resources

```bash
# List available voices
piffle voices

# List voices for specific provider
piffle voices -p voicebox

# List TTS providers
piffle providers
```

### Configuration

```bash
# Initialize config file
piffle config init

# Show current config
piffle config show

# Show resolved config (merged with env and defaults)
piffle config show -r

# Set config value
piffle config set llm.defaultProvider claude
piffle config set llm.ollama.model llama3.2:3b
piffle config set tts.kokoro.defaultVoice af_bella

# Get config value
piffle config get llm.defaultProvider

# Show config file path
piffle config path
```

## Options

| Option        | Short | Description                 | Default       |
| ------------- | ----- | --------------------------- | ------------- |
| `--voice`     | `-v`  | Voice to use                | `af_heart`    |
| `--provider`  | `-p`  | TTS provider                | `kokoro`      |
| `--output`    | `-o`  | Save to file                | (plays audio) |
| `--summarize` | `-s`  | Summarize with LLM          | `false`       |
| `--llm`       | `-l`  | LLM provider                | `ollama`      |
| `--fallback`  | `-f`  | Fallback if LLM unavailable | -             |
| `--help`      | `-h`  | Show help                   | -             |
| `--version`   | `-V`  | Show version                | -             |

## Environment Variables

### LLM Providers

| Variable             | Description        | Default                    |
| -------------------- | ------------------ | -------------------------- |
| `OLLAMA_MODEL`       | Ollama model       | `llama3.2:1b`              |
| `OLLAMA_URL`         | Ollama URL         | `http://localhost:11434`   |
| `ANTHROPIC_API_KEY`  | Claude API key     | -                          |
| `ANTHROPIC_MODEL`    | Claude model       | `claude-haiku-4-20250514`  |
| `OPENROUTER_API_KEY` | OpenRouter API key | -                          |
| `OPENROUTER_MODEL`   | OpenRouter model   | `openai/gpt-oss-120b:free` |

### TTS Providers

| Variable                   | Description        | Default     |
| -------------------------- | ------------------ | ----------- |
| `VOICEVOX_HOST`            | VOICEVOX host      | `localhost` |
| `VOICEVOX_PORT`            | VOICEVOX port      | `50021`     |
| `VOICEVOX_DEFAULT_SPEAKER` | Default speaker ID | `1`         |

## Configuration File

Location: `~/.config/piffle/config.json`

```json
{
  "version": 1,
  "llm": {
    "defaultProvider": "claude",
    "ollama": { "model": "llama3.2:3b" },
    "claude": { "apiKeyEnv": "ANTHROPIC_API_KEY" }
  },
  "tts": {
    "defaultProvider": "kokoro",
    "kokoro": { "defaultVoice": "af_heart" }
  },
  "summarize": {
    "language": "日本語",
    "maxLength": 100
  }
}
```

### Priority

1. CLI arguments (`-l claude`)
2. Environment variables (`PIFFLE_LLM_PROVIDER=claude`)
3. Config file (`llm.defaultProvider`)
4. Default values

## Examples

```bash
# Simple speech
piffle "Hello, world!"

# Summarize a file
cat long_document.txt | piffle -s

# Use Japanese summarization with Claude
ANTHROPIC_API_KEY=sk-xxx piffle -s -l claude "テキスト"

# Save summarized speech
piffle -s -o summary.wav "Long text..."

# British voice
piffle "Good morning" -v bf_emma
```

## Requirements

- Node.js >= 20.0.0
- macOS (uses `afplay` for audio playback)
- Ollama (for local LLM) or API keys for Claude/OpenRouter
- VOICEVOX (optional, for voicebox provider)

## License

MIT
