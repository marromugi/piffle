export interface AvailabilityResult {
  available: boolean;
  reason?: string;
}

export interface LLMProvider {
  readonly name: string;
  initialize(): Promise<void>;
  summarize(text: string, options?: SummarizeOptions): Promise<string>;
  isAvailable(): Promise<AvailabilityResult>;
}

export interface SummarizeOptions {
  maxLength?: number;
  language?: string;
  prompt?: string;
}
