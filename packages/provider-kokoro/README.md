# @piffle/provider-kokoro

Kokoro TTS provider for piffle. High-quality local text-to-speech using Kokoro-82M.

## Installation

```bash
pnpm add @piffle/provider-kokoro
```

## Features

- Runs locally (no API key required)
- Multiple voice options (American/British English)
- Fast inference on CPU
- High-quality neural TTS

## Usage

```typescript
// Auto-registers on import
import "@piffle/provider-kokoro";

import { getProvider } from "@piffle/core";

const kokoro = getProvider("kokoro");
await kokoro.initialize(); // Downloads model on first run

const audio = await kokoro.generate("Hello, world!", "af_heart");
```

### Direct Usage

```typescript
import { KokoroProvider } from "@piffle/provider-kokoro";

const provider = new KokoroProvider();
await provider.initialize();

// Generate speech
const audioBuffer = await provider.generate("Hello!", "af_bella");

// List available voices
const voices = await provider.listVoices();
```

## Available Voices

### American English (Female)

| Voice        | Description   |
| ------------ | ------------- |
| `af_heart`   | Default voice |
| `af_alloy`   | -             |
| `af_aoede`   | -             |
| `af_bella`   | -             |
| `af_jessica` | -             |
| `af_kore`    | -             |
| `af_nicole`  | -             |
| `af_nova`    | -             |
| `af_river`   | -             |
| `af_sarah`   | -             |
| `af_sky`     | -             |

### American English (Male)

| Voice        | Description |
| ------------ | ----------- |
| `am_adam`    | -           |
| `am_echo`    | -           |
| `am_eric`    | -           |
| `am_fenrir`  | -           |
| `am_liam`    | -           |
| `am_michael` | -           |
| `am_onyx`    | -           |
| `am_puck`    | -           |
| `am_santa`   | -           |

### British English (Female)

| Voice         | Description |
| ------------- | ----------- |
| `bf_emma`     | -           |
| `bf_isabella` | -           |
| `bf_alice`    | -           |
| `bf_lily`     | -           |

### British English (Male)

| Voice       | Description |
| ----------- | ----------- |
| `bm_george` | -           |
| `bm_lewis`  | -           |
| `bm_daniel` | -           |
| `bm_fable`  | -           |

## API

### `KokoroProvider`

| Method                  | Description                         |
| ----------------------- | ----------------------------------- |
| `initialize()`          | Load model (downloads on first run) |
| `generate(text, voice)` | Generate speech, returns WAV buffer |
| `listVoices()`          | List available voice names          |
| `getDefaultVoice()`     | Returns `"af_heart"`                |

## Model

Uses [Kokoro-82M](https://huggingface.co/onnx-community/Kokoro-82M-v1.0-ONNX) ONNX model.

- Model ID: `onnx-community/Kokoro-82M-v1.0-ONNX`
- Quantization: q8 (8-bit)
- Device: CPU

## Requirements

- Node.js >= 20.0.0
- ~200MB disk space for model

## License

MIT
