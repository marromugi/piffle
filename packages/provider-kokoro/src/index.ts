import { registerProvider } from "@piffle/core";
import { KokoroProvider } from "./kokoro.js";

// Auto-register on import (side effect)
const provider = new KokoroProvider();
registerProvider(provider);

export { KokoroProvider };
export default provider;
