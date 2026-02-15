# piffle

Text-to-speech CLI tool with LLM summarization. Speak text instantly from your terminal, optionally summarizing long text using AI.

## Features

- Multiple TTS providers (Kokoro, VoiceBox/VOICEVOX)
- LLM-powered text summarization (Ollama, Claude, OpenRouter)
- Configurable via file or environment variables
- Pipe-friendly for shell scripting

## Installation

```bash
pnpm install
pnpm build
pnpm link --global
```

## Quick Start

```bash
# Speak text
piffle "Hello, world!"

# Summarize and speak
piffle -s "Long text to summarize..."

# Pipe from other commands
cat article.txt | piffle -s

# Use Claude for summarization
piffle -s -l claude "Your text here"
```

## Usage

```bash
# Basic speech
piffle "Hello, world!"

# Use a specific voice
piffle "Hello" -v af_bella

# Save to file
piffle "Hello" -o output.wav

# Summarize before speaking
piffle -s "Long text..."

# Use specific LLM provider
piffle -s -l claude "Text"
piffle -s -l openrouter "Text"

# Fallback message if LLM unavailable
piffle -s -f "Default message" "Long text..."

# List voices
piffle voices

# List TTS providers
piffle providers
```

## Configuration

piffle supports configuration via file (`~/.config/piffle/config.json`) or environment variables.

### Config Commands

```bash
# Initialize config file
piffle config init

# Show config
piffle config show

# Show resolved config (merged with env)
piffle config show -r

# Set values
piffle config set llm.defaultProvider claude
piffle config set llm.ollama.model llama3.2:3b

# Get values
piffle config get llm.defaultProvider
```

### Config File Example

```json
{
  "version": 1,
  "llm": {
    "defaultProvider": "claude",
    "ollama": {
      "model": "llama3.2:3b"
    },
    "claude": {
      "apiKeyEnv": "ANTHROPIC_API_KEY"
    }
  },
  "tts": {
    "defaultProvider": "kokoro",
    "kokoro": {
      "defaultVoice": "af_heart"
    },
    "voicebox": {
      "host": "localhost",
      "port": 50021
    }
  },
  "summarize": {
    "language": "日本語",
    "maxLength": 100
  }
}
```

### Environment Variables

| Variable             | Description           |
| -------------------- | --------------------- |
| `OLLAMA_MODEL`       | Ollama model name     |
| `OLLAMA_URL`         | Ollama server URL     |
| `ANTHROPIC_API_KEY`  | Claude API key        |
| `ANTHROPIC_MODEL`    | Claude model name     |
| `OPENROUTER_API_KEY` | OpenRouter API key    |
| `OPENROUTER_MODEL`   | OpenRouter model name |
| `VOICEVOX_HOST`      | VOICEVOX server host  |
| `VOICEVOX_PORT`      | VOICEVOX server port  |

### Priority

CLI args > Environment variables > Config file > Defaults

## CLI Options

| Option        | Short | Description                 | Default       |
| ------------- | ----- | --------------------------- | ------------- |
| `--voice`     | `-v`  | Voice to use                | `af_heart`    |
| `--provider`  | `-p`  | TTS provider                | `kokoro`      |
| `--output`    | `-o`  | Save to file                | (plays audio) |
| `--summarize` | `-s`  | Summarize with LLM          | `false`       |
| `--llm`       | `-l`  | LLM provider                | `ollama`      |
| `--fallback`  | `-f`  | Fallback if LLM unavailable | -             |

## Packages

| Package                     | Description                            |
| --------------------------- | -------------------------------------- |
| `@piffle/cli`               | CLI application                        |
| `@piffle/core`              | Core library (registry, config, types) |
| `@piffle/provider-kokoro`   | Kokoro TTS provider                    |
| `@piffle/provider-voicebox` | VOICEVOX TTS provider                  |
| `@piffle/llm-ollama`        | Ollama LLM provider                    |
| `@piffle/llm-claude`        | Claude LLM provider                    |
| `@piffle/llm-openrouter`    | OpenRouter LLM provider                |

## Available Voices (Kokoro)

### American English (Female)

`af_heart`, `af_alloy`, `af_aoede`, `af_bella`, `af_jessica`, `af_kore`, `af_nicole`, `af_nova`, `af_river`, `af_sarah`, `af_sky`

### American English (Male)

`am_adam`, `am_echo`, `am_eric`, `am_fenrir`, `am_liam`, `am_michael`, `am_onyx`, `am_puck`, `am_santa`

### British English (Female)

`bf_emma`, `bf_isabella`, `bf_alice`, `bf_lily`

### British English (Male)

`bm_george`, `bm_lewis`, `bm_daniel`, `bm_fable`

## Development

```bash
# Install dependencies
pnpm install

# Build all packages
pnpm build

# Type check
pnpm typecheck

# Run CLI directly
pnpm --filter @piffle/cli dev "Hello"
```

## Requirements

- Node.js >= 20.0.0
- macOS (uses `afplay` for audio playback)
- Ollama (for local LLM) or API keys for Claude/OpenRouter

## License

MIT
