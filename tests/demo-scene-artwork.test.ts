import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { sceneImageSize } from "@/features/demo/components/SceneArtwork";
import { SceneBalloon } from "@/features/demo/components/SceneBalloon";
import { sceneAnchors } from "@/features/demo/content/scene-anchors";
import { images } from "@/features/demo/content/media";
import type { ImageId } from "@/features/demo/model/types";

describe("speech anchored to the painted illustration", () => {
  it("uses the full phone width without reserving a caption strip", () => {
    const image = sceneImageSize(358, 300);
    expect(image).toEqual({width:354,height:236});
    expect(image.width / image.height).toBe(1.5);
  });
  it("keeps a short landscape image in its original ratio, independently of its wide outer panel", () => {
    const image = sceneImageSize(600, 200);
    expect(image).toEqual({width:294,height:196});
    expect(image.width / image.height).toBe(1.5);
  });
  it("has inspected speaker coordinates for all twelve images and explicitly handles the cropped heads", () => {
    expect(Object.keys(sceneAnchors)).toEqual(Object.keys(images));
    expect(new Set(Object.values(sceneAnchors).map(a=>a.character.mouth.join(','))).size).toBeGreaterThan(8);
    for (const [id, roles] of Object.entries(sceneAnchors)) for (const role of ["character", "you"] as const) {
      const anchor = roles[role];
      expect(anchor.left).toBeGreaterThanOrEqual(0);
      expect(anchor.left + anchor.width).toBeLessThanOrEqual(100);
      expect(anchor.top).toBeGreaterThanOrEqual(0);
      expect(anchor.top).toBeLessThan(65);
      expect(Boolean(anchor.offscreen)).toBe(id === "V02");
      if (id !== "V02") {
        expect(anchor.mouth[0]).toBeGreaterThan(0);
        expect(anchor.mouth[0]).toBeLessThan(100);
        expect(anchor.top - anchor.mouth[1]).toBeLessThan(17);
      }
      const html = renderToStaticMarkup(createElement(SceneBalloon, {image:id as ImageId,conversation:{role,text:"Hello!",intention:false}}));
      expect(html).toContain('preserveAspectRatio="none"');
      expect(html).toContain(`data-image="${id}"`);
      expect(html).toContain('vector-effect="non-scaling-stroke"');
    }
  });
});
