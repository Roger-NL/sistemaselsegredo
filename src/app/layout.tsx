import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL("https://basedspeak.com"),
  title: {
    default: "BasedSpeak | Inglês com prática guiada",
    template: "%s | BasedSpeak",
  },
  description: "Pratique inglês com missões estruturadas, produção ativa e revisão humana em etapas-chave.",
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
        className={`${geistSans.variable} ${geistMono.variable} ${inter.variable} antialiased overflow-x-hidden`}
      >
        {children}
      </body>
    </html>
  );
}
