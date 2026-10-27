/** Decode the selected responsive image before removing the route's visual cover. */
export async function decodeSceneImage(image: HTMLImageElement) {
  image.loading = "eager";
  if (image.decode) await image.decode();
  else if (!image.complete) await new Promise<void>((resolve, reject) => {
    image.addEventListener("load", () => resolve(), { once:true });
    image.addEventListener("error", () => reject(new Error("SCENE_IMAGE_FAILED")), { once:true });
  });
  if (!image.naturalWidth) throw new Error("SCENE_IMAGE_FAILED");
}
