import { DemoHost } from "@/features/demo/DemoHost";
import { pageAudioCatalog } from "@/server/speech/published";
export default function DemoPage() { return <DemoHost experience publishedAudio={pageAudioCatalog()} />; }
