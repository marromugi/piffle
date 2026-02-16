import type {
  LLMProvider,
  SummarizeOptions,
  AvailabilityResult,
} from "@piffle/core";
import { buildPrompt, DEFAULT_SUMMARIZE_PROMPT } from "@piffle/core";

const DEFAULT_MODEL = "llama3.2:1b";
const OLLAMA_URL = "http://localhost:11434";

export interface OllamaProviderOptions {
  model?: string;
  baseUrl?: string;
}

export class OllamaProvider implements LLMProvider {
  readonly name = "ollama";
  private model: string;
  private baseUrl: string;

  constructor(options: OllamaProviderOptions = {}) {
    this.model = options.model ?? process.env.OLLAMA_MODEL ?? DEFAULT_MODEL;
    this.baseUrl = options.baseUrl ?? process.env.OLLAMA_URL ?? OLLAMA_URL;
  }

  async initialize(): Promise<void> {
    // No initialization needed for Ollama
  }

  async isAvailable(): Promise<AvailabilityResult> {
    try {
      const response = await fetch(`${this.baseUrl}/api/tags`, {
        method: "GET",
        signal: AbortSignal.timeout(3000),
      });
      if (!response.ok) {
        return {
          available: false,
          reason: `Ollama server returned ${response.status}`,
        };
      }
      return { available: true };
    } catch {
      return {
        available: false,
        reason: `Cannot connect to Ollama server at ${this.baseUrl}`,
      };
    }
  }

  async summarize(text: string, options?: SummarizeOptions): Promise<string> {
    const language = options?.language ?? "日本語";
    const maxLength = options?.maxLength ?? 100;
    const promptTemplate = options?.prompt ?? DEFAULT_SUMMARIZE_PROMPT;

    const prompt = buildPrompt(promptTemplate, { text, maxLength, language });

    const response = await fetch(`${this.baseUrl}/api/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: this.model,
        prompt,
        stream: false,
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.status}`);
    }

    const data = (await response.json()) as { response: string };
    return data.response.trim();
  }
}

export function createOllamaProvider(
  options?: OllamaProviderOptions
): LLMProvider {
  return new OllamaProvider(options);
}
