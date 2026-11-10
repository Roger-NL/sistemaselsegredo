"use client";
import Image from "next/image";
import { useLayoutEffect, useRef, useState } from "react";
import { images } from "../content/media";
import type { ImageId } from "../model/types";
import type { sceneConversation } from "../model/scene-conversation";
import { SceneBalloon } from "./SceneBalloon";

/** The overlay shares the exact painted image rectangle, including in landscape.
 * It must never be positioned relative to a letterbox or a separate caption strip.
 */
export function sceneImageSize(width: number, height: number) {
  const contentWidth = Math.max(0, Math.min(width - 4, (height - 4) * 1.5));
  return { width: contentWidth, height: contentWidth / 1.5 };
}

export function SceneArtwork({ image, conversation }: { image: ImageId; conversation: ReturnType<typeof sceneConversation> }) {
  const frame = useRef<HTMLElement>(null);
  const [size, setSize] = useState<{ width:number; height:number } | null>(null);
  useLayoutEffect(() => {
    const element = frame.current;
    if (!element) return;
    const measure = () => {
      const next = sceneImageSize(element.clientWidth, element.clientHeight);
      if (next.width <= 0) return;
      setSize(previous => previous && Math.abs(previous.width-next.width)<.5 ? previous : next);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  const asset = images[image];
  return <aside className="scene-column"><figure ref={frame} className={`scene-art comic-scene${conversation ? " has-balloon" : ""}`}>
    <div className="scene-illustration" style={size ?? undefined}>
      <picture><source media="(max-width:760px)" srcSet={asset.mobile} /><Image unoptimized width={960} height={640} src={asset.path} alt={asset.description} /></picture>
      <SceneBalloon conversation={conversation} image={image} />
    </div>
  </figure></aside>;
}
