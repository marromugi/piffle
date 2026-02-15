/**
 * 設定ファイルのルートスキーマ
 * ~/.config/piffle/config.json に保存される
 */
export interface PiffleConfig {
  /** 設定ファイルのバージョン（マイグレーション用） */
  version: 1;

  /** LLM プロバイダ設定 */
  llm?: LLMConfig;

  /** TTS プロバイダ設定 */
  tts?: TTSConfig;

  /** 要約設定 */
  summarize?: SummarizeConfig;
}

/**
 * LLM プロバイダ設定
 */
export interface LLMConfig {
  /** デフォルトで使用する LLM プロバイダ */
  defaultProvider?: "ollama" | "claude" | "openrouter" | "claude-code";

  /** Ollama 固有設定 */
  ollama?: {
    model?: string;
    baseUrl?: string;
  };

  /** Claude (Anthropic) 固有設定 */
  claude?: {
    model?: string;
    /** 環境変数名（例: "ANTHROPIC_API_KEY"） */
    apiKeyEnv?: string;
  };

  /** OpenRouter 固有設定 */
  openrouter?: {
    model?: string;
    /** 環境変数名（例: "OPENROUTER_API_KEY"） */
    apiKeyEnv?: string;
  };
}

/**
 * TTS プロバイダ設定
 */
export interface TTSConfig {
  /** デフォルトで使用する TTS プロバイダ */
  defaultProvider?: "kokoro" | "voicebox";

  /** Kokoro 固有設定 */
  kokoro?: {
    defaultVoice?: string;
  };

  /** VoiceBox (VOICEVOX) 固有設定 */
  voicebox?: {
    host?: string;
    port?: number;
    defaultSpeakerId?: number;
  };
}

/**
 * 要約設定
 */
export interface SummarizeConfig {
  /** 要約の言語 */
  language?: string;

  /** 最大文字数 */
  maxLength?: number;

  /** カスタムプロンプトテンプレート（{text}, {maxLength}, {language} をプレースホルダとして使用可能） */
  prompt?: string;
}

/**
 * 解決済み設定（CLI引数、環境変数、設定ファイル、デフォルト値をマージ後）
 */
export interface ResolvedConfig {
  llm: {
    defaultProvider: string;
    ollama: {
      model: string;
      baseUrl: string;
    };
    claude: {
      model: string;
      apiKey: string | undefined;
    };
    openrouter: {
      model: string;
      apiKey: string | undefined;
    };
  };
  tts: {
    defaultProvider: string;
    kokoro: {
      defaultVoice: string;
    };
    voicebox: {
      host: string;
      port: number;
      defaultSpeakerId: number;
    };
  };
  summarize: {
    language: string;
    maxLength: number;
    prompt: string;
  };
}

/**
 * CLI オプションの部分型（resolveConfig に渡す用）
 */
export interface CLIOptions {
  llm?: string;
  provider?: string;
  voice?: string;
}
