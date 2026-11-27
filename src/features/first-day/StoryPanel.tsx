"use client";

import Image from "next/image";
import { Hand } from "lucide-react";
import { type ReactNode, useEffect, useLayoutEffect, useRef } from "react";
import { type FirstDayArt, storyImage } from "./content";

type Story = { id: string; image: FirstDayArt; portraitImage: FirstDayArt };
type Point = readonly [x: number, y: number];
type Oval = readonly [centerX: number, centerY: number, width: number, height: number];
type Print = { mouth?: Point; headTop: number; oval: Oval; completed?: Oval };
export type BalloonPrint = { desktop: Print; portrait: Print };

// Mouth, head top and oval center are fractions of the original illustration. The oval
// sizes are measured at the reference panel widths of 1600 px and 366 px.
const balloons: Record<string, BalloonPrint> = {
  "ask-to-sit": {
    desktop: { mouth: [.7275, .1578], headTop: .045, oval: [.8841, .1333, 289, 108], completed: [.8725, .1511, 332, 140] },
    portrait: { mouth: [.748, .213], headTop: .10, oval: [.43, .14, 147, 43], completed: [.415, .156, 190, 68] },
  },
  "ana-makes-room": {
    desktop: { mouth: [.4469, .2722], headTop: .029, oval: [.5544, .1078, 242, 120] },
    portrait: { mouth: [.367, .288], headTop: .03, oval: [.596, .145, 94, 59] },
  },
  "meet-ana": {
    desktop: { mouth: [.7063, .26], headTop: .062, oval: [.8744, .1878, 318, 118], completed: [.87, .2028, 358, 145] },
    portrait: { mouth: [.682, .385], headTop: .17, oval: [.485, .14, 146, 43], completed: [.497, .145, 219, 68] },
  },
  "ana-introduces-herself": {
    desktop: { mouth: [.6212, .45], headTop: .11, oval: [.7503, .2883, 245, 121] },
    portrait: { mouth: [.524, .413], headTop: .095, oval: [.78, .32, 109, 55] },
  },
  "close-the-door": {
    desktop: { mouth: [.7163, .3711], headTop: .16, oval: [.8947, .2239, 267, 119], completed: [.875, .2383, 332, 145] },
    portrait: { mouth: [.691, .405], headTop: .20, oval: [.424, .18, 149, 43], completed: [.427, .188, 214, 68] },
  },
};

function comicBalloonOutline(cx: number, cy: number, rx: number, ry: number, mouth: Point | undefined, portrait: boolean) {
  const left = cx - rx, right = cx + rx, top = cy - ry, bottom = cy + ry;
  const radius = Math.min(17, ry * .46);
  const tailWidth = 7;
  let bottomTail = "", leftTail = "";
  if (mouth && mouth[1] > bottom + 4) {
    const [x, y] = mouth;
    const base = Math.max(left + radius + tailWidth, Math.min(right - radius - tailWidth, x));
    const dx = x - base, dy = y - bottom;
    const length = Math.min(1, (portrait ? 59 : 76) / Math.hypot(dx, dy));
    const tipX = base + dx * length, tipY = bottom + dy * length;
    bottomTail = `H ${base + tailWidth} Q ${base + 5} ${bottom + 10} ${tipX} ${tipY} Q ${base + 1} ${bottom + 11} ${base - tailWidth} ${bottom}`;
  } else if (mouth && mouth[0] < left - 5) {
    const [x, y] = mouth;
    const base = Math.max(top + radius + tailWidth, Math.min(bottom - radius - tailWidth, y));
    const tipX = Math.max(x, left - 52);
    leftTail = `V ${base + tailWidth} Q ${left - 7} ${base + 4} ${tipX} ${y} Q ${left - 9} ${base - 2} ${left} ${base - tailWidth}`;
  }
  return `M ${left + radius} ${top} H ${right - radius} Q ${right} ${top} ${right} ${top + radius}
    V ${bottom - radius} Q ${right} ${bottom} ${right - radius} ${bottom} ${bottomTail}
    H ${left + radius} Q ${left} ${bottom} ${left} ${bottom - radius} ${leftTail}
    V ${top + radius} Q ${left} ${top} ${left + radius} ${top} Z`;
}

export function StoryPanel({ page, portrait, expanded = false, placement, variant, children }: {
  page: Story; portrait: boolean; expanded?: boolean; placement?: BalloonPrint; variant?: "dialogue" | "exercise"; children: ReactNode;
}) {
  const image = storyImage(page, portrait);
  const frame = useRef<HTMLDivElement>(null);
  const balloon = useRef<HTMLDivElement>(null);
  const outline = useRef<SVGPathElement>(null);
  const prints = placement ?? balloons[page.id];
  const print = prints[portrait ? "portrait" : "desktop"];

  useLayoutEffect(() => {
    const panel = frame.current, copy = balloon.current, path = outline.current;
    if (!panel || !copy || !path) return;
    const [centerX, centerY, width, height] = expanded && print.completed ? print.completed : print.oval;
    function fit() {
      if (!panel || !copy || !path) return;
      const w = panel.clientWidth, h = panel.clientHeight;
      if (!w || !h) return;
      const cover = Math.max(w / image.width, h / image.height);
      const imageW = image.width * cover, imageH = image.height * cover;
      const scale = portrait ? Math.min(1.42, Math.max(.86, w / 366)) : Math.min(1.25, Math.max(placement ? .38 : .55, w / 1600));
      const preferredWidth = variant !== "dialogue" ? width * scale
        : portrait ? Math.max(Math.min(136, w * .435), width * Math.min(1.42, w / 366))
        : Math.max(142, width * scale);
      const rx = Math.min(w - 12, preferredWidth) / 2;
      copy.style.width = rx * 2 + "px";
      copy.style.setProperty("--fd1-speech-size", ((portrait ? expanded ? 19.5 : 22 : expanded ? 37 : 46) * scale) + "px");
      copy.style.setProperty("--fd1-translation-size", ((portrait ? 14 : 21) * scale) + "px");
      if (variant) copy.style.height = "auto";
      if (variant === "exercise") copy.style.setProperty("--fd1-balloon-min-height", Math.min(h - 8, height * scale) + "px");
      const ry = Math.min(h - 8, variant ? copy.offsetHeight : height * scale) / 2;
      const offsetX = (w - imageW) / 2;
      const crop = Math.max(0, imageH - h);
      // Keep the speaker's head and the lettering inside short panels. Use
      // this same crop for the image, balloon and tip when the viewport changes.
      const maxTopCrop = Math.min(print.headTop * imageH, centerY * imageH - ry - 4);
      const topCrop = Math.min(crop / 2, Math.max(0, maxTopCrop));
      const offsetY = -topCrop;
      panel.style.setProperty("--fd1-image-position-y", (crop > 0 ? 100 * topCrop / crop : 50) + "%");
      const cx = Math.max(rx + 4, Math.min(w - rx - 4, offsetX + centerX * imageW));
      const cy = Math.max(ry + 4, Math.min(h - ry - 4, offsetY + centerY * imageH));
      const mouth = print.mouth && [offsetX + print.mouth[0] * imageW, offsetY + print.mouth[1] * imageH] as const;
      if (variant) {
        path.setAttribute("d", comicBalloonOutline(cx, cy, rx, ry, mouth, portrait));
      } else if (mouth) {
        const [tx, ty] = mouth;
        const angle = Math.atan2((ty - cy) / ry, (tx - cx) / rx);
        const point = (rad: number) => (cx + rx * Math.cos(rad)) + " " + (cy + ry * Math.sin(rad));
        const tailHalfAngle = placement ? .12 : .185;
        const start = point(angle + tailHalfAngle);
        let tail = `L ${tx} ${ty}`;
        if (placement) {
          // Approach the lips from beside the face, leaving the eyes visible.
          const side = Math.sign(cx - tx);
          const tipX = tx + side * Math.min(12, imageW * .021);
          const bendX = tipX + side * Math.min(Math.abs(cx - tx) * .58, imageW * .10);
          tail = `Q ${bendX} ${ty} ${tipX} ${ty} Q ${bendX} ${ty} ${start}`;
        }
        path.setAttribute("d", `M ${start} A ${rx} ${ry} 0 1 1 ${point(angle - tailHalfAngle)} ${tail} Z`);
      } else {
        path.setAttribute("d", `M ${cx - rx} ${cy} A ${rx} ${ry} 0 1 1 ${cx + rx} ${cy} A ${rx} ${ry} 0 1 1 ${cx - rx} ${cy} Z`);
      }
      copy.style.left = (cx - rx) + "px";
      copy.style.top = (cy - ry) + "px";
      if (!variant) copy.style.height = ry * 2 + "px";
    }
    fit();
    const observer = new ResizeObserver(fit);
    observer.observe(panel);
    if (variant) observer.observe(copy);
    return () => observer.disconnect();
  }, [image, print, portrait, expanded, placement, variant]);

  return <div className="fd-scene fd1-scene" ref={frame}>
    <Image className="fd-room fd1-illustration" src={image.src} width={image.width} height={image.height} alt={image.alt} loading="eager" unoptimized />
    <svg className="fd1-balloon-outline" aria-hidden="true"><path ref={outline} /></svg>
    <div ref={balloon} className="fd1-balloon" data-balloon={variant}>{children}</div>
  </div>;
}

export function FirstDragTutorial({ prologue = false }: { prologue?: boolean }) {
  const hand = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const cursor = hand.current;
    const story = cursor?.closest<HTMLElement>(prologue ? ".fd-tutorial" : ".fd1-story");
    if (!cursor || !story || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const key = "basedspeak:first-day:drag-demo";
    try { if (!prologue && sessionStorage.getItem(key)) return; } catch { /* The demonstration also works without storage. */ }
    let animation: Animation | undefined;
    const timer = window.setTimeout(() => {
      const source = story.querySelector(prologue ? "[data-lesson-drag-source]" : '[data-lesson-drag-source="word-0"]')?.getBoundingClientRect();
      const target = story.querySelector(prologue ? "[data-lesson-drop-anchor]" : "[data-lesson-drop]")?.getBoundingClientRect();
      if (!source || !target || !cursor.animate) return;
      const bounds = story.getBoundingClientRect();
      const at = (rect: DOMRect) => `translate(${rect.x + rect.width / 2 - bounds.x}px, ${rect.y + rect.height / 2 - bounds.y}px)`;
      animation = cursor.animate([
        { transform: at(source), opacity: 0 },
        { transform: at(source), opacity: 1, offset: .17 },
        { transform: at(target), opacity: 1, offset: .78 },
        { transform: at(target), opacity: 0 },
      ], { duration: 1900, easing: "ease-in-out" });
      try { if (!prologue) sessionStorage.setItem(key, "1"); } catch { /* Optional per-session memory. */ }
    }, 950);
    const cancel = () => { window.clearTimeout(timer); animation?.cancel(); };
    story.addEventListener("pointerdown", cancel, { capture: true });
    story.addEventListener("keydown", cancel, { capture: true });
    window.addEventListener("resize", cancel);
    return () => {
      cancel();
      story.removeEventListener("pointerdown", cancel, true);
      story.removeEventListener("keydown", cancel, true);
      window.removeEventListener("resize", cancel);
    };
  }, [prologue]);
  return <span ref={hand} className="fd1-tutorial-hand" aria-hidden="true"><Hand size={30} /></span>;
}
