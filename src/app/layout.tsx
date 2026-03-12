import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import Script from "next/script";
import { ClerkProvider } from '@clerk/nextjs';
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
        <body className={`${inter.variable} ${outfit.variable} antialiased min-h-screen flex flex-col`}>
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
        </body>
      </html>
    </ClerkProvider>
  );
}
