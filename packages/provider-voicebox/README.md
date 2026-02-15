# @piffle/provider-voicebox

VOICEVOX TTS provider for piffle. High-quality Japanese text-to-speech using VOICEVOX engine.

## Installation

```bash
pnpm add @piffle/provider-voicebox
```

## Requirements

- [VOICEVOX](https://voicevox.hiroshiba.jp/) engine running locally
- セットアップ方法は [VOICEBOX_SETUP.md](./VOICEBOX_SETUP.md) を参照

## Usage

```typescript
// Auto-registers on import
import "@piffle/provider-voicebox";

import { getProvider } from "@piffle/core";

const voicebox = getProvider("voicebox");
await voicebox.initialize();

// Use speaker name
const audio = await voicebox.generate("こんにちは", "四国めたん:ノーマル");

// Or use speaker ID directly
const audio2 = await voicebox.generate("こんにちは", "2");
```

### Direct Usage

```typescript
import { VoiceBoxProvider } from "@piffle/provider-voicebox";

const provider = new VoiceBoxProvider({
  host: "localhost",
  port: 50021,
  defaultSpeakerId: 1,
});

await provider.initialize();

// Generate speech
const audioBuffer = await provider.generate(
  "こんにちは",
  "ずんだもん:ノーマル"
);

// List available voices
const voices = await provider.listVoices();
// ["四国めたん:ノーマル", "四国めたん:あまあま", "ずんだもん:ノーマル", ...]
```

## Configuration

### Environment Variables

| Variable                   | Description          | Default     |
| -------------------------- | -------------------- | ----------- |
| `VOICEVOX_HOST`            | VOICEVOX server host | `localhost` |
| `VOICEVOX_PORT`            | VOICEVOX server port | `50021`     |
| `VOICEVOX_DEFAULT_SPEAKER` | Default speaker ID   | `1`         |

### Constructor Options

```typescript
interface VoiceBoxConfig {
  host?: string; // Server host
  port?: number; // Server port
  defaultSpeakerId?: number; // Default speaker ID
}
```

### Config File

In `~/.config/piffle/config.json`:

```json
{
  "tts": {
    "voicebox": {
      "host": "localhost",
      "port": 50021,
      "defaultSpeakerId": 1
    }
  }
}
```

## Voice Selection

Voices can be specified in multiple ways:

```typescript
// By speaker name and style
await provider.generate("テキスト", "四国めたん:ノーマル");

// By style name only (if unique)
await provider.generate("テキスト", "ノーマル");

// By speaker ID
await provider.generate("テキスト", "2");
```

## API

### `VoiceBoxProvider`

| Method                  | Description                                |
| ----------------------- | ------------------------------------------ |
| `initialize()`          | Connect to VOICEVOX and load speakers      |
| `generate(text, voice)` | Generate speech, returns WAV buffer        |
| `listVoices()`          | List available voices as `"Speaker:Style"` |
| `getDefaultVoice()`     | Returns default speaker ID as string       |

## Available Speakers

Speakers depend on your VOICEVOX installation. Common speakers include:

- 四国めたん
- ずんだもん
- 春日部つむぎ
- 雨晴はう
- 波音リツ
- 玄野武宏
- 白上虎太郎
- 青山龍星
- 冥鳴ひまり
- And more...

Run `piffle voices -p voicebox` to see available voices.

## Requirements

- Node.js >= 20.0.0
- VOICEVOX engine running

## License

MIT
