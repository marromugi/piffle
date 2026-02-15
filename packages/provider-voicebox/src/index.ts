import { registerProvider } from "@piffle/core";
import { VoiceBoxProvider } from "./voicebox.js";

const provider = new VoiceBoxProvider();
registerProvider(provider);

export { VoiceBoxProvider };
export type {
  VoiceBoxConfig,
  VoiceBoxSpeaker,
  VoiceBoxStyle,
} from "./types.js";
export default provider;
