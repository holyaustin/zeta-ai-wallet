"use client";

import "./globals.css";
import { Providers } from "./providers";
import Header from "./components/Header";
import Footer from "./components/Footer";
import "@rainbow-me/rainbowkit/styles.css";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <title>Zeta AI Wallet</title>
        <meta name="description" content="AI-powered cross-chain wallet" />
      </head>
      <body className="bg-gray-50 flex flex-col">
        <Providers>
          <Header />
          <main className="flex-1 container mx-auto">
            {children}
          </main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}