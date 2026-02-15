import { promises as fs } from "node:fs";
import { homedir } from "node:os";
import { join, dirname } from "node:path";
import type {
  PiffleConfig,
  ResolvedConfig,
  CLIOptions,
} from "./config-types.js";

/** Default summarization prompt template */
export const DEFAULT_SUMMARIZE_PROMPT = `Summarize the following text concisely in {language}, within {maxLength} characters.
Ignore code blocks and focus only on the work content.
Output only the summary, no additional explanations.

Text:
{text}`;

/** プロンプトテンプレートの変数 */
export interface PromptVariables {
  text: string;
  maxLength: number;
  language: string;
}

/**
 * プロンプトテンプレート内のプレースホルダを実際の値で置換
 * @param template プロンプトテンプレート（{text}, {maxLength}, {language} をプレースホルダとして使用）
 * @param variables 置換する変数
 */
export function buildPrompt(
  template: string,
  variables: PromptVariables
): string {
  return template
    .replace(/\{text\}/g, variables.text)
    .replace(/\{maxLength\}/g, String(variables.maxLength))
    .replace(/\{language\}/g, variables.language);
}

/** デフォルト値 */
const DEFAULTS: ResolvedConfig = {
  llm: {
    defaultProvider: "claude-code",
    ollama: {
      model: "llama3.2:1b",
      baseUrl: "http://localhost:11434",
    },
    claude: {
      model: "claude-haiku-4-20250514",
      apiKey: undefined,
    },
    openrouter: {
      model: "openai/gpt-oss-120b:free",
      apiKey: undefined,
    },
  },
  tts: {
    defaultProvider: "kokoro",
    kokoro: {
      defaultVoice: "af_heart",
    },
    voicebox: {
      host: "localhost",
      port: 50021,
      defaultSpeakerId: 1,
    },
  },
  summarize: {
    language: "English",
    maxLength: 100,
    prompt: DEFAULT_SUMMARIZE_PROMPT,
  },
};

/**
 * XDG Base Directory 準拠の設定ディレクトリパスを取得
 */
export function getConfigDir(): string {
  const xdgConfigHome = process.env.XDG_CONFIG_HOME;
  if (xdgConfigHome) {
    return join(xdgConfigHome, "piffle");
  }
  return join(homedir(), ".config", "piffle");
}

/**
 * 設定ファイルのパスを取得
 */
export function getConfigPath(): string {
  return join(getConfigDir(), "config.json");
}

/**
 * 設定ファイルを読み込む
 * @returns 設定オブジェクト。ファイルが存在しない場合は null
 */
export async function loadConfig(): Promise<PiffleConfig | null> {
  const configPath = getConfigPath();
  try {
    const content = await fs.readFile(configPath, "utf-8");
    return JSON.parse(content) as PiffleConfig;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return null;
    }
    throw error;
  }
}

/**
 * 設定ファイルを保存（chmod 600 適用）
 */
export async function saveConfig(config: PiffleConfig): Promise<void> {
  const configPath = getConfigPath();
  const configDir = dirname(configPath);

  // ディレクトリ作成（chmod 700 = 所有者のみアクセス可能）
  await fs.mkdir(configDir, { recursive: true, mode: 0o700 });

  // ファイル書き込み（chmod 600 = 所有者のみ読み書き可能）
  const content = JSON.stringify(config, null, 2);
  await fs.writeFile(configPath, content, {
    encoding: "utf-8",
    mode: 0o600,
  });
}

/**
 * 設定ファイルが存在するか確認
 */
export async function configExists(): Promise<boolean> {
  const configPath = getConfigPath();
  try {
    await fs.access(configPath);
    return true;
  } catch {
    return false;
  }
}

/**
 * デフォルト設定を作成
 */
export function createDefaultConfig(): PiffleConfig {
  return {
    version: 1,
    llm: {
      defaultProvider: "claude-code",
    },
    tts: {
      defaultProvider: "kokoro",
    },
    summarize: {
      language: "日本語",
      maxLength: 100,
    },
  };
}

/**
 * 設定をマージして解決
 * 優先順位: cliOptions > 環境変数 > 設定ファイル > デフォルト値
 */
export async function resolveConfig(
  cliOptions?: Partial<CLIOptions>
): Promise<ResolvedConfig> {
  const fileConfig = await loadConfig();

  return {
    llm: {
      defaultProvider:
        cliOptions?.llm ??
        process.env.PIFFLE_LLM_PROVIDER ??
        fileConfig?.llm?.defaultProvider ??
        DEFAULTS.llm.defaultProvider,
      ollama: {
        model:
          process.env.OLLAMA_MODEL ??
          fileConfig?.llm?.ollama?.model ??
          DEFAULTS.llm.ollama.model,
        baseUrl:
          process.env.OLLAMA_URL ??
          fileConfig?.llm?.ollama?.baseUrl ??
          DEFAULTS.llm.ollama.baseUrl,
      },
      claude: {
        model:
          process.env.ANTHROPIC_MODEL ??
          fileConfig?.llm?.claude?.model ??
          DEFAULTS.llm.claude.model,
        apiKey: resolveApiKey(
          fileConfig?.llm?.claude?.apiKeyEnv,
          "ANTHROPIC_API_KEY"
        ),
      },
      openrouter: {
        model:
          process.env.OPENROUTER_MODEL ??
          fileConfig?.llm?.openrouter?.model ??
          DEFAULTS.llm.openrouter.model,
        apiKey: resolveApiKey(
          fileConfig?.llm?.openrouter?.apiKeyEnv,
          "OPENROUTER_API_KEY"
        ),
      },
    },
    tts: {
      defaultProvider:
        cliOptions?.provider ??
        process.env.PIFFLE_TTS_PROVIDER ??
        fileConfig?.tts?.defaultProvider ??
        DEFAULTS.tts.defaultProvider,
      kokoro: {
        defaultVoice:
          cliOptions?.voice ??
          process.env.PIFFLE_VOICE ??
          fileConfig?.tts?.kokoro?.defaultVoice ??
          DEFAULTS.tts.kokoro.defaultVoice,
      },
      voicebox: {
        host:
          process.env.VOICEVOX_HOST ??
          fileConfig?.tts?.voicebox?.host ??
          DEFAULTS.tts.voicebox.host,
        port:
          parseInt(process.env.VOICEVOX_PORT ?? "", 10) ||
          (fileConfig?.tts?.voicebox?.port ?? DEFAULTS.tts.voicebox.port),
        defaultSpeakerId:
          parseInt(process.env.VOICEVOX_DEFAULT_SPEAKER ?? "", 10) ||
          (fileConfig?.tts?.voicebox?.defaultSpeakerId ??
            DEFAULTS.tts.voicebox.defaultSpeakerId),
      },
    },
    summarize: {
      language:
        process.env.PIFFLE_LANGUAGE ??
        fileConfig?.summarize?.language ??
        DEFAULTS.summarize.language,
      maxLength:
        parseInt(process.env.PIFFLE_MAX_LENGTH ?? "", 10) ||
        (fileConfig?.summarize?.maxLength ?? DEFAULTS.summarize.maxLength),
      prompt:
        process.env.PIFFLE_PROMPT ??
        fileConfig?.summarize?.prompt ??
        DEFAULTS.summarize.prompt,
    },
  };
}

/**
 * API キーを解決
 * 設定ファイルの apiKeyEnv で指定された環境変数名、またはデフォルトの環境変数名から取得
 */
function resolveApiKey(
  envVarName: string | undefined,
  defaultEnvVar: string
): string | undefined {
  if (envVarName) {
    return process.env[envVarName];
  }
  return process.env[defaultEnvVar];
}

/**
 * ネストしたキーで設定値を取得
 * @param obj 設定オブジェクト
 * @param path ドット区切りのキーパス（例: "llm.ollama.model"）
 */
export function getNestedValue(obj: unknown, path: string): unknown {
  const keys = path.split(".");
  let current: unknown = obj;
  for (const key of keys) {
    if (current === undefined || current === null) return undefined;
    current = (current as Record<string, unknown>)[key];
  }
  return current;
}

/**
 * ネストしたキーで設定値を設定
 * @param obj 設定オブジェクト
 * @param path ドット区切りのキーパス（例: "llm.ollama.model"）
 * @param value 設定する値
 */
export function setNestedValue(
  obj: Record<string, unknown>,
  path: string,
  value: unknown
): void {
  const keys = path.split(".");
  let current: Record<string, unknown> = obj;
  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    if (!(key in current) || typeof current[key] !== "object") {
      current[key] = {};
    }
    current = current[key] as Record<string, unknown>;
  }
  current[keys[keys.length - 1]] = value;
}

/**
 * 文字列値を適切な型に変換
 */
export function parseValue(value: string): unknown {
  // 数値
  if (/^\d+$/.test(value)) return parseInt(value, 10);
  // 真偽値
  if (value === "true") return true;
  if (value === "false") return false;
  // 文字列
  return value;
}
