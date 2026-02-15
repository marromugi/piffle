import { KokoroTTS } from "kokoro-js";
import type { TTSProvider } from "@piffle/core";

const MODEL_ID = "onnx-community/Kokoro-82M-v1.0-ONNX";

export class KokoroProvider implements TTSProvider {
  readonly name = "kokoro";
  private tts: KokoroTTS | null = null;

  async initialize(): Promise<void> {
    if (this.tts) return;
    this.tts = await KokoroTTS.from_pretrained(MODEL_ID, {
      dtype: "q8",
      device: "cpu",
    });
  }

  async generate(text: string, voice: string): Promise<Buffer> {
    if (!this.tts) {
      throw new Error("Provider not initialized");
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const audio = await this.tts.generate(text, { voice: voice as any });
    // RawAudio.toWav() returns ArrayBuffer
    return Buffer.from(audio.toWav());
  }

  async listVoices(): Promise<string[]> {
    if (!this.tts) {
      throw new Error("Provider not initialized");
    }
    return Object.keys(this.tts.voices);
  }

  getDefaultVoice(): string {
    return "af_heart";
  }
}
