import { spawn } from "node:child_process";
import type {
  LLMProvider,
  SummarizeOptions,
  AvailabilityResult,
} from "@piffle/core";
import { buildPrompt, DEFAULT_SUMMARIZE_PROMPT } from "@piffle/core";

const DEFAULT_TIMEOUT = 60000;

export interface ClaudeCodeProviderOptions {
  /** Path to claude CLI (default: "claude") */
  claudePath?: string;
  /** Timeout in milliseconds (default: 60000) */
  timeout?: number;
}

export class ClaudeCodeProvider implements LLMProvider {
  readonly name = "claude-code";
  private claudePath: string;
  private timeout: number;

  constructor(options: ClaudeCodeProviderOptions = {}) {
    this.claudePath =
      options.claudePath ?? process.env.CLAUDE_CODE_PATH ?? "claude";
    this.timeout =
      options.timeout ??
      (parseInt(process.env.CLAUDE_CODE_TIMEOUT ?? "", 10) || DEFAULT_TIMEOUT);
  }

  async initialize(): Promise<void> {
    // No initialization needed
  }

  async isAvailable(): Promise<AvailabilityResult> {
    try {
      const result = await this.executeCommand(["--version"], 5000);
      if (result.exitCode === 0) {
        return { available: true };
      }
      return {
        available: false,
        reason: `claude command failed with exit code ${result.exitCode}`,
      };
    } catch (error) {
      return {
        available: false,
        reason: `claude command not found or not executable: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
  }

  async summarize(text: string, options?: SummarizeOptions): Promise<string> {
    const language = options?.language ?? "日本語";
    const maxLength = options?.maxLength ?? 100;
    const promptTemplate = options?.prompt ?? DEFAULT_SUMMARIZE_PROMPT;

    const prompt = buildPrompt(promptTemplate, { text, maxLength, language });

    // Use stdin to avoid command line length limits
    const result = await this.executeCommandWithStdin(
      ["--output-format", "text"],
      prompt,
      this.timeout
    );

    if (result.exitCode !== 0) {
      throw new Error(
        `Claude Code command failed with exit code ${result.exitCode}: ${result.stderr}`
      );
    }

    return result.stdout.trim();
  }

  private executeCommand(
    args: string[],
    timeout: number
  ): Promise<{ stdout: string; stderr: string; exitCode: number }> {
    return this.executeCommandWithStdin(args, undefined, timeout);
  }

  private executeCommandWithStdin(
    args: string[],
    stdin: string | undefined,
    timeout: number
  ): Promise<{ stdout: string; stderr: string; exitCode: number }> {
    return new Promise((resolve, reject) => {
      const proc = spawn(this.claudePath, args, {
        stdio: ["pipe", "pipe", "pipe"],
      });

      let stdout = "";
      let stderr = "";

      proc.stdout.on("data", (data: Buffer) => {
        stdout += data.toString();
      });

      proc.stderr.on("data", (data: Buffer) => {
        stderr += data.toString();
      });

      proc.on("error", (error) => {
        reject(error);
      });

      proc.on("close", (code) => {
        resolve({
          stdout,
          stderr,
          exitCode: code ?? 1,
        });
      });

      const timer = setTimeout(() => {
        proc.kill("SIGTERM");
        reject(new Error(`Command timed out after ${timeout}ms`));
      }, timeout);

      proc.on("close", () => {
        clearTimeout(timer);
      });

      // Write prompt to stdin if provided
      if (stdin !== undefined) {
        proc.stdin.write(stdin);
        proc.stdin.end();
      }
    });
  }
}

export function createClaudeCodeProvider(
  options?: ClaudeCodeProviderOptions
): LLMProvider {
  return new ClaudeCodeProvider(options);
}
