import type {
  LLMProvider,
  SummarizeOptions,
  AvailabilityResult,
} from "@piffle/core";
import { buildPrompt, DEFAULT_SUMMARIZE_PROMPT } from "@piffle/core";

const DEFAULT_MODEL = "openai/gpt-oss-120b:free";
const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

export interface OpenRouterProviderOptions {
  apiKey?: string;
  model?: string;
}

interface ChatCompletionResponse {
  choices: {
    message: {
      content: string;
    };
  }[];
}

export class OpenRouterProvider implements LLMProvider {
  readonly name = "openrouter";
  private apiKey: string | undefined;
  private model: string;

  constructor(options: OpenRouterProviderOptions = {}) {
    this.apiKey = options.apiKey ?? process.env.OPENROUTER_API_KEY;
    this.model = options.model ?? process.env.OPENROUTER_MODEL ?? DEFAULT_MODEL;
  }

  async initialize(): Promise<void> {
    // No initialization needed
  }

  async isAvailable(): Promise<AvailabilityResult> {
    if (!this.apiKey) {
      return {
        available: false,
        reason: "OPENROUTER_API_KEY environment variable is not set",
      };
    }
    return { available: true };
  }

  async summarize(text: string, options?: SummarizeOptions): Promise<string> {
    if (!this.apiKey) {
      throw new Error(
        "OpenRouter API key not set. Set OPENROUTER_API_KEY environment variable."
      );
    }

    const language = options?.language ?? "日本語";
    const maxLength = options?.maxLength ?? 100;
    const promptTemplate = options?.prompt ?? DEFAULT_SUMMARIZE_PROMPT;

    const prompt = buildPrompt(promptTemplate, { text, maxLength, language });

    const response = await fetch(OPENROUTER_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: this.model,
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(
        `OpenRouter API error: ${response.status} - ${errorBody}`
      );
    }

    const data = (await response.json()) as ChatCompletionResponse;
    return data.choices[0].message.content.trim();
  }
}

export function createOpenRouterProvider(
  options?: OpenRouterProviderOptions
): LLMProvider {
  return new OpenRouterProvider(options);
}
