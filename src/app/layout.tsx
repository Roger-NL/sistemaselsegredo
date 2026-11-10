import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import "@/features/demo/demo.css";
import "@/components/navigation/navigation.css";
import "./comic-theme.css";
import "./comic-public.css";
import "@/features/dashboard/comic-dashboard.css";
import "@/features/demo/comic-demo.css";
import "@/features/theory/comic-study.css";
import "@/components/core/viewport.css";
import "@/components/core/auto-fit.css";
import { SiteViewport } from "@/components/core/SiteViewport";
import { JourneyTransitionProvider } from "@/components/navigation/JourneyTransition";
import { StudentWorkspaceSession } from "@/features/dashboard/StudentWorkspaceSession";
import { InteractionSounds } from "@/components/interaction/InteractionSounds";

// Reuse the local Geist bundled with the pinned Next dependency; no font download at build time.
const geist = localFont({ src: "../../node_modules/next/dist/next-devtools/server/font/geist-latin.woff2", variable: "--font-geist-sans", weight: "100 900", style: "normal", display: "swap" });

export const viewport: Viewport = {
  themeColor: "#f4f0e8",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  interactiveWidget: "resizes-content",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://basedspeak.com"),
  title: {
    default: "BasedSpeak | Inglês com prática guiada",
    template: "%s | BasedSpeak",
  },
  description: "Participe de uma conversa guiada em uma cafeteria. Escolha o que quer dizer e construa respostas com ajuda, sem microfone.",
  icons: {
    icon: [{ url: "/basedspeak-tab.png", type: "image/png" }],
    shortcut: ["/basedspeak-tab.png"],
    apple: ["/basedspeak-tab.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" translate="yes" suppressHydrationWarning className="scroll-smooth" data-scroll-behavior="smooth">
      <body
        className={`${geist.variable} antialiased`}
      >
        <SiteViewport /><JourneyTransitionProvider><InteractionSounds /><StudentWorkspaceSession />{children}</JourneyTransitionProvider>
      </body>
    </html>
  );
}
