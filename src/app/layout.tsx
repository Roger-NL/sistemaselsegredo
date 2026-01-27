import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ProgressProvider } from "@/context/ProgressContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL("https://esenglishacademy.com"), // Placeholder URL - Change this to your real domain
  title: {
    default: "ES English Academy | Domine o Inglês na Jornada Cósmica",
    template: "%s | ES English Academy",
  },
  description: "Aprenda inglês com uma metodologia revolucionária gamificada. Explore o sistema solar, desbloqueie pilares de conhecimento e conquiste sua fluência.",
  keywords: ["inglês", "curso de inglês", "gamificação", "sistema solar", "fluência", "ES Academy", "Roger-NL"],
  authors: [{ name: "ES Academy Team" }],
  creator: "ES Academy",
  publisher: "ES Academy",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: "https://esenglishacademy.com",
    title: "ES English Academy",
    description: "Sua missão para a fluência começa aqui.",
    siteName: "ES English Academy",
  },
  twitter: {
    card: "summary_large_image",
    title: "ES English Academy",
    description: "Sua missão para a fluência começa aqui.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "name": "ES English Academy",
        "url": "https://esenglishacademy.com",
        "logo": "https://esenglishacademy.com/logo.png",
        "sameAs": []
      },
      {
        "@type": "WebSite",
        "name": "ES English Academy",
        "url": "https://esenglishacademy.com",
        "potentialAction": {
          "@type": "SearchAction",
          "target": {
            "@type": "EntryPoint",
            "urlTemplate": "https://esenglishacademy.com/search?q={search_term_string}"
          },
          "query-input": "required name=search_term_string"
        }
      }
    ]
  };

  return (
    <html lang="pt-BR" className="scroll-smooth">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-black text-white overflow-x-hidden`}
      >
        <ProgressProvider>
          {children}
        </ProgressProvider>
      </body>
    </html>
  );
}