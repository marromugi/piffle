import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@piffle/core", () => ({
  getConfigPath: vi.fn(() => "/mock/path/config.json"),
  loadConfig: vi.fn(),
  saveConfig: vi.fn(),
  resolveConfig: vi.fn(),
  configExists: vi.fn(),
  createDefaultConfig: vi.fn(() => ({
    version: 1,
    llm: { defaultProvider: "claude-code" },
    tts: { defaultProvider: "kokoro" },
    summarize: { language: "English", maxLength: 100 },
  })),
  getNestedValue: vi.fn(),
  setNestedValue: vi.fn(),
  parseValue: vi.fn((v: string) => v),
}));

vi.mock("chalk", () => ({
  default: {
    bold: (s: string) => s,
    green: (s: string) => s,
    yellow: (s: string) => s,
    dim: (s: string) => s,
    cyan: (s: string) => s,
  },
}));

import {
  configPathCommand,
  configShowCommand,
  configSetCommand,
  configGetCommand,
  configInitCommand,
} from "./config.js";
import {
  getConfigPath,
  loadConfig,
  saveConfig,
  resolveConfig,
  configExists,
  createDefaultConfig,
  getNestedValue,
  setNestedValue,
} from "@piffle/core";

describe("config commands", () => {
  let consoleSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.clearAllMocks();
    consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});
  });

  describe("configPathCommand", () => {
    it("prints the config file path", () => {
      configPathCommand();
      expect(getConfigPath).toHaveBeenCalled();
      expect(consoleSpy).toHaveBeenCalledWith("/mock/path/config.json");
    });
  });

  describe("configShowCommand", () => {
    it("shows resolved config when --resolved flag is passed", async () => {
      const mockResolved = { llm: { defaultProvider: "ollama" } };
      vi.mocked(resolveConfig).mockResolvedValue(mockResolved as never);

      await configShowCommand({ resolved: true });

      expect(resolveConfig).toHaveBeenCalled();
      expect(consoleSpy).toHaveBeenCalledWith(
        JSON.stringify(mockResolved, null, 2)
      );
    });

    it("shows message when no config file exists", async () => {
      vi.mocked(loadConfig).mockResolvedValue(null as never);

      await configShowCommand({});

      expect(loadConfig).toHaveBeenCalled();
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining("No configuration file found")
      );
    });

    it("shows file config when it exists", async () => {
      const mockConfig = { version: 1, llm: { defaultProvider: "ollama" } };
      vi.mocked(loadConfig).mockResolvedValue(mockConfig as never);

      await configShowCommand({});

      expect(consoleSpy).toHaveBeenCalledWith(
        JSON.stringify(mockConfig, null, 2)
      );
    });
  });

  describe("configInitCommand", () => {
    it("does not overwrite existing config", async () => {
      vi.mocked(configExists).mockResolvedValue(true);

      await configInitCommand();

      expect(saveConfig).not.toHaveBeenCalled();
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining("already exists")
      );
    });

    it("creates default config when none exists", async () => {
      vi.mocked(configExists).mockResolvedValue(false);

      await configInitCommand();

      expect(createDefaultConfig).toHaveBeenCalled();
      expect(saveConfig).toHaveBeenCalled();
    });
  });

  describe("configGetCommand", () => {
    it("shows message when no config file exists", async () => {
      vi.mocked(loadConfig).mockResolvedValue(null as never);

      await configGetCommand("llm.defaultProvider");

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining("No configuration file found")
      );
    });

    it("shows message when key is not found", async () => {
      vi.mocked(loadConfig).mockResolvedValue({ version: 1 } as never);
      vi.mocked(getNestedValue).mockReturnValue(undefined);

      await configGetCommand("nonexistent.key");

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining("not found")
      );
    });

    it("prints scalar value directly", async () => {
      vi.mocked(loadConfig).mockResolvedValue({ version: 1 } as never);
      vi.mocked(getNestedValue).mockReturnValue("ollama");

      await configGetCommand("llm.defaultProvider");

      expect(consoleSpy).toHaveBeenCalledWith("ollama");
    });

    it("prints object values as JSON", async () => {
      const nested = { defaultProvider: "ollama", model: "llama3" };
      vi.mocked(loadConfig).mockResolvedValue({ version: 1 } as never);
      vi.mocked(getNestedValue).mockReturnValue(nested);

      await configGetCommand("llm");

      expect(consoleSpy).toHaveBeenCalledWith(JSON.stringify(nested, null, 2));
    });
  });

  describe("configSetCommand", () => {
    it("sets a value and saves config", async () => {
      const mockConfig = { version: 1, llm: {} };
      vi.mocked(loadConfig).mockResolvedValue(mockConfig as never);

      await configSetCommand("llm.defaultProvider", "ollama");

      expect(setNestedValue).toHaveBeenCalled();
      expect(saveConfig).toHaveBeenCalled();
    });

    it("creates default config if none exists", async () => {
      vi.mocked(loadConfig).mockResolvedValue(null as never);

      await configSetCommand("llm.defaultProvider", "ollama");

      expect(createDefaultConfig).toHaveBeenCalled();
      expect(saveConfig).toHaveBeenCalled();
    });
  });
});
