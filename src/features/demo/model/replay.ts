import { catalog } from "../content/catalog";
import { audio, images } from "../content/media";
import type { DemoState } from "./types";

/** Review only the recorded route; never invent replies or restart the attempt. */
export function replaySlides(state: DemoState) {
  return state.transcript.flatMap(line => {
    const node = catalog[line.nodeId];
    const asset = audio[line.audioId];
    if (!node || !asset || !images[node.image]) return [];
    return [{ ...line, image: images[node.image], text: line.written ?? asset.text,
      meaning: line.written === undefined ? asset.meaning : null }];
  });
}
