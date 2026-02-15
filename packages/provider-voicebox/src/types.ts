export interface VoiceBoxSpeaker {
  name: string;
  speaker_uuid: string;
  styles: VoiceBoxStyle[];
  version: string;
}

export interface VoiceBoxStyle {
  name: string;
  id: number;
}

export interface VoiceBoxAudioQuery {
  accent_phrases: AccentPhrase[];
  speedScale: number;
  pitchScale: number;
  intonationScale: number;
  volumeScale: number;
  prePhonemeLength: number;
  postPhonemeLength: number;
  outputSamplingRate: number;
  outputStereo: boolean;
  kana?: string;
}

export interface AccentPhrase {
  moras: Mora[];
  accent: number;
  pause_mora?: Mora | null;
  is_interrogative?: boolean;
}

export interface Mora {
  text: string;
  consonant?: string | null;
  consonant_length?: number | null;
  vowel: string;
  vowel_length: number;
  pitch: number;
}

export interface VoiceBoxConfig {
  host: string;
  port: number;
  defaultSpeakerId: number;
}
