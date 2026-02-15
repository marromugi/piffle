import type { TTSProvider } from "@piffle/core";
import type {
  VoiceBoxSpeaker,
  VoiceBoxAudioQuery,
  VoiceBoxConfig,
} from "./types.js";

const DEFAULT_CONFIG: VoiceBoxConfig = {
  host: process.env.VOICEVOX_HOST ?? "localhost",
  port: parseInt(process.env.VOICEVOX_PORT ?? "50021", 10),
  defaultSpeakerId: parseInt(process.env.VOICEVOX_DEFAULT_SPEAKER ?? "1", 10),
};

export class VoiceBoxProvider implements TTSProvider {
  readonly name = "voicebox";
  private config: VoiceBoxConfig;
  private speakers: VoiceBoxSpeaker[] = [];
  private speakerMap = new Map<string, number>();

  constructor(config: Partial<VoiceBoxConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  private get baseUrl(): string {
    return `http://${this.config.host}:${this.config.port}`;
  }

  async initialize(): Promise<void> {
    if (this.speakers.length > 0) return;

    await this.checkEngineAvailability();

    const response = await fetch(`${this.baseUrl}/speakers`);
    if (!response.ok) {
      throw new Error(`Failed to fetch speakers: ${response.statusText}`);
    }

    this.speakers = (await response.json()) as VoiceBoxSpeaker[];

    for (const speaker of this.speakers) {
      for (const style of speaker.styles) {
        const key = `${speaker.name}:${style.name}`;
        this.speakerMap.set(key, style.id);
        this.speakerMap.set(style.name, style.id);
      }
    }
  }

  private async checkEngineAvailability(): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/version`, {
        signal: AbortSignal.timeout(5000),
      });
      if (!response.ok) {
        throw new Error(`VOICEVOX engine returned: ${response.statusText}`);
      }
    } catch (error) {
      if (error instanceof Error && error.name === "TimeoutError") {
        throw new Error(
          `VOICEVOX engine not responding at ${this.baseUrl}. ` +
            "Please ensure VOICEVOX is running."
        );
      }
      throw new Error(
        `Cannot connect to VOICEVOX engine at ${this.baseUrl}. ` +
          `Error: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  async generate(text: string, voice: string): Promise<Buffer> {
    if (this.speakers.length === 0) {
      throw new Error("Provider not initialized");
    }

    const speakerId = this.resolveSpeakerId(voice);
    const audioQuery = await this.createAudioQuery(text, speakerId);
    const audioBuffer = await this.synthesize(audioQuery, speakerId);

    return audioBuffer;
  }

  private resolveSpeakerId(voice: string): number {
    const numericId = parseInt(voice, 10);
    if (!isNaN(numericId)) {
      return numericId;
    }

    const mappedId = this.speakerMap.get(voice);
    if (mappedId !== undefined) {
      return mappedId;
    }

    console.warn(
      `Voice "${voice}" not found, using default speaker ID: ${this.config.defaultSpeakerId}`
    );
    return this.config.defaultSpeakerId;
  }

  private async createAudioQuery(
    text: string,
    speakerId: number
  ): Promise<VoiceBoxAudioQuery> {
    const params = new URLSearchParams({
      text,
      speaker: speakerId.toString(),
    });

    const response = await fetch(`${this.baseUrl}/audio_query?${params}`, {
      method: "POST",
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Failed to create audio query: ${response.statusText} - ${errorText}`
      );
    }

    return (await response.json()) as VoiceBoxAudioQuery;
  }

  private async synthesize(
    audioQuery: VoiceBoxAudioQuery,
    speakerId: number
  ): Promise<Buffer> {
    const params = new URLSearchParams({
      speaker: speakerId.toString(),
    });

    const response = await fetch(`${this.baseUrl}/synthesis?${params}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(audioQuery),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Failed to synthesize audio: ${response.statusText} - ${errorText}`
      );
    }

    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  }

  async listVoices(): Promise<string[]> {
    if (this.speakers.length === 0) {
      throw new Error("Provider not initialized");
    }

    const voices: string[] = [];
    for (const speaker of this.speakers) {
      for (const style of speaker.styles) {
        voices.push(`${speaker.name}:${style.name}`);
      }
    }
    return voices;
  }

  getDefaultVoice(): string {
    return this.config.defaultSpeakerId.toString();
  }
}
