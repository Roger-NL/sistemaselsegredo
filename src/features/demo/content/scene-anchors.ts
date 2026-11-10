import type { ImageId } from "../model/types";

type Anchor = { mouth: [number, number]; left: number; top: number; width: number; offscreen?: boolean };
const anchor = (mouth: [number, number], left: number, top: number, width = 53): Anchor => ({ mouth, left, top, width });
/** Percentages measured against the complete approved 3:2 illustration, never the outer panel.
 * Beige = Lucas; blue = learner. V02 deliberately crops both heads out of frame.
 */
export const sceneAnchors: Record<ImageId, { character: Anchor; you: Anchor }> = {
  V01: { character: anchor([34,30],4,43), you: anchor([69,33],45,43,52) },
  V02: { character: { ...anchor([0,3],4,5), offscreen:true }, you: { ...anchor([100,18],45,5,52), offscreen:true } },
  V03: { character: anchor([34,32],4,43), you: anchor([69,34],45,44,52) },
  V04: { character: anchor([30,30],4,41), you: anchor([66,33],45,40,52) },
  V05: { character: anchor([31,36],4,46), you: anchor([68,36],45,46,52) },
  V06: { character: anchor([39,29],4,43), you: anchor([76,36],45,48,52) },
  V07: { character: anchor([33,31],4,43), you: anchor([69,33],45,44,52) },
  V08: { character: anchor([33,33],4,44), you: anchor([69,34],45,44,52) },
  V09: { character: anchor([22,23],28,35,53), you: anchor([75,26],45,39,52) },
  V10: { character: anchor([33,33],4,45), you: anchor([67,34],45,45,52) },
  V11: { character: anchor([32,35],4,46), you: anchor([70,36],45,46,52) },
  V12: { character: anchor([29,26],4,41), you: anchor([75,29],45,42,52) },
};
