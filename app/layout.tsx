import "./globals.css";
import "@rainbow-me/rainbowkit/styles.css";
import "react-toastify/dist/ReactToastify.css";
import type { Metadata, Viewport } from "next";
import { JetBrains_Mono as FontMono, Space_Grotesk as FontSans } from "next/font/google";
import { Providers } from "@/components/Providers";
import { Header } from "@/components/Header";
import { ToastContainer } from "react-toastify";
import { cn } from "@/lib/utils";

const fontMono = FontMono({
  subsets: ["latin"],
  variable: "--font-mono",
});

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
});
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#00f5ff",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://mon-ad.io"),
  title: "Mon-AD | Decentralized Ad Protocol on Monad",
  description: "A high-throughput decentralized advertising platform for the Monad ecosystem. Buy, bid, and own ad slots with sub-second finality.",
  keywords: ["Monad", "Web3 Ads", "Decentralized Advertising", "Monad Testnet", "Blockchain Ads", "Monad NFT"],
  authors: [{ name: "Monad Community" }],
  openGraph: {
    title: "Mon-AD | The Monad Ad Protocol",
    description: "Own the attention on Monad. Native Web3 ad slots with atomic finality.",
    url: "https://mon-ad.io",
    siteName: "Mon-AD",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Mon-AD Protocol",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Mon-AD | High-Throughput Ads on Monad",
    description: "The first native ad-bidding protocol for Monad. Zero intermediaries, absolute ownership.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          fontMono.variable,
          fontSans.variable
        )}
      >
        <Providers>
          <Header />
          <main>
            {children}
          </main>
        </Providers>
        <ToastContainer />
      </body>
    </html>
  );
}
