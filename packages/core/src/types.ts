export interface TTSProvider {
  readonly name: string;
  initialize(): Promise<void>;
  generate(text: string, voice: string): Promise<Buffer>;
  listVoices(): Promise<string[]>;
  getDefaultVoice(): string;
}
