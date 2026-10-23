// Explicit local production only. Never imported by Next or run by build/dev.
// node --conditions=react-server --experimental-strip-types scripts/media-production/produce.mjs C01 'Approved text'
import { writeFile, mkdir } from "node:fs/promises";
import { generatePreparedSpeech } from "../../src/server/integrations/elevenlabs.ts";

const [id, text] = process.argv.slice(2);
if (!/^[CU]\d{2}$/.test(id || "") || !text?.trim()) {
  throw new Error("Usage: produce.mjs C01 'Approved text' (requires explicit production authorization)");
}
const destination = new URL(`../../public/demo/cafe/v1/audio/${id}.mp3`, import.meta.url);
const bytes = await generatePreparedSpeech(text);
await mkdir(new URL(".", destination), { recursive: true });
await writeFile(destination, bytes, { flag: "wx" });
console.log(`Produced ${id}; review the recording before marking media ready.`);
