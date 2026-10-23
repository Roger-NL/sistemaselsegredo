import type { Metadata, Viewport } from "next";
import "./globals.css";

export const viewport: Viewport = {
  themeColor: "#f6f0e6",
  width: "device-width",
  initialScale: 1,
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
        className="antialiased overflow-x-hidden"
      >
        {children}
      </body>
    </html>
  );
}
