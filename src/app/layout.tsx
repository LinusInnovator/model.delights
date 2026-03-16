import type { Metadata } from "next";
import { Inter, Outfit, Playfair_Display, JetBrains_Mono } from "next/font/google";
import Script from "next/script";
import { ClerkProvider } from '@clerk/nextjs';
import { Analytics } from "@vercel/analytics/react";
import TopBarAuth from "../components/TopBarAuth";
import Footer from "../components/Footer";
import "./globals.css";
import "./components.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  style: ["normal", "italic"]
});

const jetbrains = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "model.delights | The AI Developer's Smart Routing Matrix",
  description: "The ultimate real-time LLM directory for AI engineers, developers, and founders. Instantly compare OpenRouter API costs versus live Chatbot Arena ELO intelligence to find the absolute best model for your application.",
  keywords: ["AI developers", "LLM pricing", "OpenRouter alternative", "AI engineer tools", "API routing", "prompt engineering", "LMSYS ELO", "cost optimization"],
  openGraph: {
    title: "model.delights | The AI Developer's Smart Routing Matrix",
    description: "The real-time LLM directory for AI engineers. Instantly compare API costs versus live intelligence to find the perfect model.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "model.delights | The AI Developer's Smart Routing Matrix",
    description: "Stop overpaying for AI APIs. Find the smartest, most cost-effective LLMs in seconds.",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <head>
          <Script src="https://unpkg.com/@phosphor-icons/web" strategy="beforeInteractive" />
        </head>
        <body suppressHydrationWarning className={`${inter.variable} ${outfit.variable} ${playfair.variable} ${jetbrains.variable} antialiased min-h-screen flex flex-col`}>
          <svg className="pointer-events-none fixed inset-0 z-50 h-[100dvh] w-full opacity-[0.05]">
            <filter id="noiseFilter">
              <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" stitchTiles="stitch"/>
            </filter>
            <rect width="100%" height="100%" filter="url(#noiseFilter)" />
          </svg>
          <div className="glass-bg"></div>
          <TopBarAuth />
          <main className="flex-grow">
            {children}
          </main>
          <Footer />
          <Script
            src="https://spell.delights.pro/widget.js?v=1.1"
            data-genie-id="15037964-879e-408c-9154-fa13810a1862"
            strategy="lazyOnload"
          />
          <Analytics />
        </body>
      </html>
    </ClerkProvider>
  );
}
