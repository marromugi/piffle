import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { VoiceBoxProvider } from "./voicebox.js";

const mockSpeakers = [
  {
    name: "ずんだもん",
    speaker_uuid: "uuid-1",
    version: "1.0.0",
    styles: [
      { name: "ノーマル", id: 1 },
      { name: "あまあま", id: 2 },
    ],
  },
  {
    name: "四国めたん",
    speaker_uuid: "uuid-2",
    version: "1.0.0",
    styles: [{ name: "ノーマル", id: 3 }],
  },
];

const mockAudioQuery = {
  accent_phrases: [],
  speedScale: 1.0,
  pitchScale: 0.0,
  intonationScale: 1.0,
  volumeScale: 1.0,
  prePhonemeLength: 0.1,
  postPhonemeLength: 0.1,
  outputSamplingRate: 24000,
  outputStereo: false,
};

describe("VoiceBoxProvider", () => {
  let fetchSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    fetchSpy = vi.spyOn(globalThis, "fetch");
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("constructor", () => {
    it("デフォルト設定で初期化される", () => {
      const provider = new VoiceBoxProvider();
      expect(provider.name).toBe("voicebox");
      expect(provider.getDefaultVoice()).toBe("1");
    });

    it("カスタム設定でデフォルト値を上書きできる", () => {
      const provider = new VoiceBoxProvider({
        host: "custom-host",
        port: 12345,
        defaultSpeakerId: 99,
      });
      expect(provider.getDefaultVoice()).toBe("99");
    });
  });

  describe("initialize", () => {
    it("正常に初期化され、speakersを取得する", async () => {
      fetchSpy.mockImplementation(async (url) => {
        const urlStr = url.toString();
        if (urlStr.includes("/version")) {
          return new Response("0.14.0", { status: 200 });
        }
        if (urlStr.includes("/speakers")) {
          return new Response(JSON.stringify(mockSpeakers), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          });
        }
        throw new Error(`Unexpected URL: ${urlStr}`);
      });

      const provider = new VoiceBoxProvider();
      await provider.initialize();

      const voices = await provider.listVoices();
      expect(voices).toContain("ずんだもん:ノーマル");
      expect(voices).toContain("四国めたん:ノーマル");
    });

    it("2回目の初期化はスキップされる", async () => {
      fetchSpy.mockImplementation(async (url) => {
        const urlStr = url.toString();
        if (urlStr.includes("/version")) {
          return new Response("0.14.0", { status: 200 });
        }
        if (urlStr.includes("/speakers")) {
          return new Response(JSON.stringify(mockSpeakers), { status: 200 });
        }
        throw new Error(`Unexpected URL: ${urlStr}`);
      });

      const provider = new VoiceBoxProvider();
      await provider.initialize();
      await provider.initialize();

      expect(fetchSpy).toHaveBeenCalledTimes(2);
    });

    it("エンジンが利用不可の場合エラーをスローする", async () => {
      fetchSpy.mockRejectedValue(new Error("Connection refused"));

      const provider = new VoiceBoxProvider();
      await expect(provider.initialize()).rejects.toThrow(
        /Cannot connect to VOICEVOX engine/
      );
    });

    it("タイムアウト時に適切なエラーメッセージを返す", async () => {
      const timeoutError = new Error("Timeout");
      timeoutError.name = "TimeoutError";
      fetchSpy.mockRejectedValue(timeoutError);

      const provider = new VoiceBoxProvider();
      await expect(provider.initialize()).rejects.toThrow(
        /VOICEVOX engine not responding/
      );
    });

    it("speakers API がエラーを返した場合エラーをスローする", async () => {
      fetchSpy.mockImplementation(async (url) => {
        const urlStr = url.toString();
        if (urlStr.includes("/version")) {
          return new Response("0.14.0", { status: 200 });
        }
        if (urlStr.includes("/speakers")) {
          return new Response("Internal Server Error", {
            status: 500,
            statusText: "Internal Server Error",
          });
        }
        throw new Error(`Unexpected URL: ${urlStr}`);
      });

      const provider = new VoiceBoxProvider();
      await expect(provider.initialize()).rejects.toThrow(
        /Failed to fetch speakers/
      );
    });
  });

  describe("generate", () => {
    let provider: VoiceBoxProvider;

    beforeEach(async () => {
      fetchSpy.mockImplementation(async (url) => {
        const urlStr = url.toString();
        if (urlStr.includes("/version")) {
          return new Response("0.14.0", { status: 200 });
        }
        if (urlStr.includes("/speakers")) {
          return new Response(JSON.stringify(mockSpeakers), { status: 200 });
        }
        if (urlStr.includes("/audio_query")) {
          return new Response(JSON.stringify(mockAudioQuery), { status: 200 });
        }
        if (urlStr.includes("/synthesis")) {
          const wavBuffer = new ArrayBuffer(44);
          return new Response(wavBuffer, {
            status: 200,
            headers: { "Content-Type": "audio/wav" },
          });
        }
        throw new Error(`Unexpected URL: ${urlStr}`);
      });

      provider = new VoiceBoxProvider();
      await provider.initialize();
    });

    it("テキストから音声データを生成する", async () => {
      const result = await provider.generate("こんにちは", "1");
      expect(result).toBeInstanceOf(Buffer);
      expect(result.length).toBeGreaterThan(0);
    });

    it("voice 名で speaker を解決できる", async () => {
      await provider.generate("テスト", "ずんだもん:ノーマル");

      const audioQueryCall = fetchSpy.mock.calls.find((call) =>
        call[0].toString().includes("/audio_query")
      );
      expect(audioQueryCall?.[0].toString()).toContain("speaker=1");
    });

    it("未初期化の場合エラーをスローする", async () => {
      const uninitializedProvider = new VoiceBoxProvider();
      await expect(
        uninitializedProvider.generate("テスト", "1")
      ).rejects.toThrow("Provider not initialized");
    });

    it("audio_query API エラー時に適切なエラーをスローする", async () => {
      fetchSpy.mockImplementation(async (url) => {
        const urlStr = url.toString();
        if (urlStr.includes("/audio_query")) {
          return new Response("Bad Request", {
            status: 400,
            statusText: "Bad Request",
          });
        }
        if (urlStr.includes("/version")) {
          return new Response("0.14.0", { status: 200 });
        }
        if (urlStr.includes("/speakers")) {
          return new Response(JSON.stringify(mockSpeakers), { status: 200 });
        }
        throw new Error(`Unexpected URL: ${urlStr}`);
      });

      const newProvider = new VoiceBoxProvider();
      await newProvider.initialize();

      await expect(newProvider.generate("テスト", "1")).rejects.toThrow(
        /Failed to create audio query/
      );
    });

    it("synthesis API エラー時に適切なエラーをスローする", async () => {
      fetchSpy.mockImplementation(async (url) => {
        const urlStr = url.toString();
        if (urlStr.includes("/synthesis")) {
          return new Response("Internal Error", {
            status: 500,
            statusText: "Internal Server Error",
          });
        }
        if (urlStr.includes("/audio_query")) {
          return new Response(JSON.stringify(mockAudioQuery), { status: 200 });
        }
        if (urlStr.includes("/version")) {
          return new Response("0.14.0", { status: 200 });
        }
        if (urlStr.includes("/speakers")) {
          return new Response(JSON.stringify(mockSpeakers), { status: 200 });
        }
        throw new Error(`Unexpected URL: ${urlStr}`);
      });

      const newProvider = new VoiceBoxProvider();
      await newProvider.initialize();

      await expect(newProvider.generate("テスト", "1")).rejects.toThrow(
        /Failed to synthesize audio/
      );
    });
  });

  describe("resolveSpeakerId", () => {
    let provider: VoiceBoxProvider;

    beforeEach(async () => {
      fetchSpy.mockImplementation(async (url) => {
        const urlStr = url.toString();
        if (urlStr.includes("/version")) {
          return new Response("0.14.0", { status: 200 });
        }
        if (urlStr.includes("/speakers")) {
          return new Response(JSON.stringify(mockSpeakers), { status: 200 });
        }
        if (urlStr.includes("/audio_query")) {
          return new Response(JSON.stringify(mockAudioQuery), { status: 200 });
        }
        if (urlStr.includes("/synthesis")) {
          return new Response(new ArrayBuffer(44), { status: 200 });
        }
        throw new Error(`Unexpected URL: ${urlStr}`);
      });

      provider = new VoiceBoxProvider();
      await provider.initialize();
    });

    it("数値文字列をそのまま数値として使用する", async () => {
      await provider.generate("テスト", "42");

      const audioQueryCall = fetchSpy.mock.calls.find((call) =>
        call[0].toString().includes("/audio_query")
      );
      expect(audioQueryCall?.[0].toString()).toContain("speaker=42");
    });

    it("スタイル名のみで解決できる", async () => {
      await provider.generate("テスト", "あまあま");

      const audioQueryCall = fetchSpy.mock.calls.find((call) =>
        call[0].toString().includes("/audio_query")
      );
      expect(audioQueryCall?.[0].toString()).toContain("speaker=2");
    });

    it("存在しない voice 名の場合デフォルトにフォールバックする", async () => {
      const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      await provider.generate("テスト", "unknown-voice");

      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Voice "unknown-voice" not found')
      );

      const audioQueryCall = fetchSpy.mock.calls.find((call) =>
        call[0].toString().includes("/audio_query")
      );
      expect(audioQueryCall?.[0].toString()).toContain("speaker=1");

      warnSpy.mockRestore();
    });
  });

  describe("listVoices", () => {
    it("初期化後に全ての voice を返す", async () => {
      fetchSpy.mockImplementation(async (url) => {
        const urlStr = url.toString();
        if (urlStr.includes("/version")) {
          return new Response("0.14.0", { status: 200 });
        }
        if (urlStr.includes("/speakers")) {
          return new Response(JSON.stringify(mockSpeakers), { status: 200 });
        }
        throw new Error(`Unexpected URL: ${urlStr}`);
      });

      const provider = new VoiceBoxProvider();
      await provider.initialize();

      const voices = await provider.listVoices();
      expect(voices).toEqual([
        "ずんだもん:ノーマル",
        "ずんだもん:あまあま",
        "四国めたん:ノーマル",
      ]);
    });

    it("未初期化の場合エラーをスローする", async () => {
      const provider = new VoiceBoxProvider();
      await expect(provider.listVoices()).rejects.toThrow(
        "Provider not initialized"
      );
    });
  });

  describe("getDefaultVoice", () => {
    it("デフォルト設定の speaker ID を文字列で返す", () => {
      const provider = new VoiceBoxProvider();
      expect(provider.getDefaultVoice()).toBe("1");
    });

    it("カスタム設定の speaker ID を文字列で返す", () => {
      const provider = new VoiceBoxProvider({ defaultSpeakerId: 5 });
      expect(provider.getDefaultVoice()).toBe("5");
    });
  });
});
