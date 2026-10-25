import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import "@/features/demo/demo.css";

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
    <html lang="pt-BR" className="scroll-smooth" data-scroll-behavior="smooth">
      <body
        className={`${geist.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
