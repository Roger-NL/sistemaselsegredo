import { createHash } from "node:crypto";
import { readFileSync, existsSync } from "node:fs";
import { describe, expect, it } from "vitest";
import sharp from "sharp";
import { audio, images } from "@/features/demo/content/media";
import { nodes } from "@/features/demo/content/catalog";

describe("approved lightweight café media", () => {
  it("ships every approved scene in mobile and desktop WebP within the total budgets", async () => {
    let mobile = 0, desktop = 0;
    expect(Object.keys(images)).toHaveLength(12);
    expect(new Set(nodes.map(n => n.image)).size).toBe(12);
    for (const image of Object.values(images)) {
      expect(image.ready).toBe(true);
      for (const [url, width] of [[image.mobile, 640], [image.path, 960]] as const) {
        const bytes = readFileSync(`public${url}`);
        const metadata = await sharp(bytes).metadata();
        expect(metadata.format).toBe("webp"); expect(metadata.width).toBe(width);
        expect(metadata.height).toBe(Math.round(width * 2 / 3));
        await expect(sharp(bytes).raw().toBuffer()).resolves.toBeInstanceOf(Buffer);
        if (width === 640) mobile += bytes.length; else desktop += bytes.length;
      }
    }
    expect(mobile).toBeLessThan(512 * 1024); expect(desktop).toBeLessThan(1024 * 1024);
  });
  it("removes retired visual cues and preview assets from the product", () => {
    const copy = JSON.stringify([nodes, images, Object.values(audio).map(a => a.meaning)]);
    expect(copy).not.toMatch(/#18|#24|SARAH|cansada|Obrigada/);
    expect(images.V02.description).toContain("LUCAS"); expect(images.V04.description).toContain("BASEDSPEAK");
    expect(existsSync("public/demo/cafe/v1/previews/counter.jpg")).toBe(false);
  });
  it("preserves every English speech text and ID, so no audio key needs to change", () => {
    const digest = createHash("sha256").update(JSON.stringify(Object.values(audio).map(a => [a.id, a.text]))).digest("hex");
    expect(digest).toBe("960c54fc694b9bc0b4aa83fe4ce903a9ef371a58a1f73d807c5eca534722dae3");
  });
});
