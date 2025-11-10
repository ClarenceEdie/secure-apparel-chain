import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { ErrorSuppressor } from "../components/ErrorSuppressor";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Production Delta FHE",
  description: "Encrypted production difference tracking system using Fully Homomorphic Encryption",
  keywords: ["FHE", "blockchain", "encryption", "production tracking", "Web3", "Zama"],
  authors: [{ name: "Production Delta Team" }],
  viewport: "width=device-width, initial-scale=1, maximum-scale=1",
  themeColor: "#000000",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`production-delta-bg text-foreground antialiased`}>
        <ErrorSuppressor />
        <div className="fixed inset-0 w-full h-full production-delta-bg z-[-20]"></div>
        <Providers>
          <main className="flex flex-col max-w-screen-lg mx-auto pb-20 px-4 sm:px-6 lg:px-8">
            <nav className="flex w-full px-3 md:px-0 h-fit py-10 justify-between items-center">
              <div className="flex items-center gap-4">
                <Image
                  src="/logo.svg"
                  alt="Production Delta Logo"
                  width={120}
                  height={120}
                  priority
                />
                <div>
                  <h1 className="text-2xl font-bold text-black">Production Delta FHE</h1>
                </div>
              </div>
              <div className="flex items-center">
                <ConnectButton />
              </div>
            </nav>
            <div className="flex-1">
              {children}
            </div>
          </main>
        </Providers>
      </body>
    </html>
  );
}

