import { describe, expect, it, vi } from "vitest";
import { decodeSceneImage } from "@/components/navigation/scene-ready";

describe("journey image readiness", () => {
  it("keeps the cover until the selected image has decoded", async () => {
    let release!: () => void;
    let ready = false;
    const image = { loading:"lazy", naturalWidth:640, decode:vi.fn(() => new Promise<void>(resolve => { release = resolve; })) } as unknown as HTMLImageElement;
    const pending = decodeSceneImage(image).then(() => { ready = true; });
    await Promise.resolve();
    expect(image.loading).toBe("eager");
    expect(ready).toBe(false);
    release(); await pending;
    expect(ready).toBe(true);
  });
  it("does not reveal a broken or empty image as a ready scene", async () => {
    const empty = { naturalWidth:0, decode:async () => {} } as unknown as HTMLImageElement;
    await expect(decodeSceneImage(empty)).rejects.toThrow("SCENE_IMAGE_FAILED");
    const failed = { naturalWidth:0, decode:async () => { throw new Error("download failed"); } } as unknown as HTMLImageElement;
    await expect(decodeSceneImage(failed)).rejects.toThrow("download failed");
  });
  it("waits for load on browsers without the decode API", async () => {
    const image = Object.assign(new EventTarget(), { complete:false, naturalWidth:0, loading:"lazy" }) as unknown as HTMLImageElement;
    const pending = decodeSceneImage(image);
    Object.defineProperty(image, "naturalWidth", { value:640 });
    image.dispatchEvent(new Event("load"));
    await expect(pending).resolves.toBeUndefined();
  });
});
