import { BrowserText } from "@/components/i18n/BrowserText";
import { sceneAnchors } from "../content/scene-anchors";
import type { sceneConversation } from "../model/scene-conversation";
import type { ImageId } from "../model/types";

export function SceneBalloon({ conversation, image }: { conversation: ReturnType<typeof sceneConversation>; image: ImageId }) {
  if (!conversation) return null;
  const anchor = sceneAnchors[image][conversation.role];
  // End just below the actual mouth; the close-up's voice comes from its cropped edge.
  const tip = { x: anchor.mouth[0], y: anchor.mouth[1] + (anchor.offscreen ? 0 : 2) };
  const baseX = Math.max(anchor.left + 9, Math.min(anchor.left + anchor.width - 9, tip.x));
  const baseY = anchor.top + 1;
  return <>
    <div className="scene-balloon" data-speaker={conversation.role} data-image={image} data-intention={conversation.intention}
      style={{ left:`${anchor.left}%`, top:`${anchor.top}%`, width:`${anchor.width}%`, maxHeight:`${98-anchor.top}%` }}>
      <strong>{conversation.role === "character" ? "Lucas" : conversation.intention ? "Você quer dizer" : "Você"}{anchor.offscreen ? " · fora do quadro" : ""}</strong>
      <p lang={conversation.intention ? "pt-BR" : "en"}><BrowserText>{conversation.text}</BrowserText></p>
    </div>
    <svg className="scene-balloon-tail" data-speaker={conversation.role} aria-hidden="true" focusable="false" viewBox="0 0 100 100" preserveAspectRatio="none">
      <path d={`M ${baseX-2} ${baseY} Q ${baseX-1} ${(baseY+tip.y)/2} ${tip.x} ${tip.y} Q ${baseX+2} ${(baseY+tip.y)/2} ${baseX+3} ${baseY}`} vectorEffect="non-scaling-stroke" />
    </svg>
  </>;
}
