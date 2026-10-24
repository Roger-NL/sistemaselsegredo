import { DemoHost } from "@/features/demo/DemoHost";
import { pageAudioCatalog } from "@/server/speech/published";
export default function HomePage() { return <DemoHost publishedAudio={pageAudioCatalog()} />; }
