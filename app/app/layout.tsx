import "./globals.css";
import "@rainbow-me/rainbowkit/styles.css";
import "react-toastify/dist/ReactToastify.css";
import type { Metadata } from "next";
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
export const metadata: Metadata = {
  title: "Monad",
  description:
    "A decentralized advertising platform for publishers and advertisers",
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
