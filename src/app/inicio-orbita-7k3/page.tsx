import type { Metadata } from "next";
import WelcomeExperience from "./welcome-experience";

export const metadata: Metadata = {
  title: "Seu próximo capítulo começa aqui",
  description: "Conheça a BasedSpeak e dê o primeiro passo no seu inglês.",
  robots: { index: false, follow: false },
};

export default function WelcomePage() {
  return <WelcomeExperience />;
}
