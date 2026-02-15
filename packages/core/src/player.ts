import { spawn } from "node:child_process";
import { writeFile, unlink } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { randomUUID } from "node:crypto";

export async function playAudio(audioBuffer: Buffer): Promise<void> {
  // Write buffer to temporary file
  const tempPath = join(tmpdir(), `piffle-${randomUUID()}.wav`);

  try {
    await writeFile(tempPath, audioBuffer);

    // Play using afplay (macOS)
    await new Promise<void>((resolve, reject) => {
      const player = spawn("afplay", [tempPath]);

      player.on("close", (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`afplay exited with code ${code}`));
        }
      });

      player.on("error", (err) => {
        reject(new Error(`Failed to play audio: ${err.message}`));
      });
    });
  } finally {
    // Clean up temp file
    await unlink(tempPath).catch(() => {});
  }
}
