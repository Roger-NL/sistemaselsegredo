import { DemoHost } from "@/features/demo/DemoHost";
import { pageAudioCatalog } from "@/server/speech/published";
import { isVisualAccessMode, VISUAL_ACCOUNT } from "@/config/access";
export default function DemoPage() { return <DemoHost experience publishedAudio={pageAudioCatalog()} accountName={isVisualAccessMode() ? VISUAL_ACCOUNT.name : undefined} />; }
