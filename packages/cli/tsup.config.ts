import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm"],
  dts: true,
  clean: true,
  sourcemap: true,
  target: "node20",
  banner: {
    js: "#!/usr/bin/env node",
  },
  // Bundle internal @piffle/* packages, keep external deps
  noExternal: [
    "@piffle/core",
    "@piffle/provider-kokoro",
    "@piffle/provider-voicebox",
    "@piffle/llm-ollama",
    "@piffle/llm-openrouter",
    "@piffle/llm-claude",
    "@piffle/llm-claude-code",
  ],
  external: ["chalk", "commander", "ora", "kokoro-js"],
});
