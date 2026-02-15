import type { LLMProvider, SummarizeOptions, AvailabilityResult } from "@piffle/core";
import { buildPrompt, DEFAULT_SUMMARIZE_PROMPT } from "@piffle/core";

const DEFAULT_MODEL = "claude-haiku-4-20250514";
const ANTHROPIC_URL = "https://api.anthropic.com/v1/messages";

export interface ClaudeProviderOptions {
  apiKey?: string;
  model?: string;
}

interface MessageResponse {
  content: {
    type: string;
    text: string;
  }[];
}

export class ClaudeProvider implements LLMProvider {
  readonly name = "claude";
  private apiKey: string | undefined;
  private model: string;

  constructor(options: ClaudeProviderOptions = {}) {
    this.apiKey = options.apiKey ?? process.env.ANTHROPIC_API_KEY;
    this.model = options.model ?? process.env.ANTHROPIC_MODEL ?? DEFAULT_MODEL;
  }

  async initialize(): Promise<void> {
    // No initialization needed
  }

  async isAvailable(): Promise<AvailabilityResult> {
    if (!this.apiKey) {
      return {
        available: false,
        reason: "ANTHROPIC_API_KEY environment variable is not set",
      };
    }
    return { available: true };
  }

  async summarize(text: string, options?: SummarizeOptions): Promise<string> {
    if (!this.apiKey) {
      throw new Error(
        "Anthropic API key not set. Set ANTHROPIC_API_KEY environment variable."
      );
    }

    const language = options?.language ?? "日本語";
    const maxLength = options?.maxLength ?? 100;
    const promptTemplate = options?.prompt ?? DEFAULT_SUMMARIZE_PROMPT;

    const prompt = buildPrompt(promptTemplate, { text, maxLength, language });

    const response = await fetch(ANTHROPIC_URL, {
      method: "POST",
      headers: {
        "x-api-key": this.apiKey,
        "anthropic-version": "2023-06-01",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: this.model,
        max_tokens: 256,
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`Claude API error: ${response.status}`);
    }

    const data = (await response.json()) as MessageResponse;
    const textContent = data.content.find((c) => c.type === "text");
    if (!textContent) {
      throw new Error("No text content in Claude response");
    }
    return textContent.text.trim();
  }
}

export function createClaudeProvider(
  options?: ClaudeProviderOptions
): LLMProvider {
  return new ClaudeProvider(options);
}
