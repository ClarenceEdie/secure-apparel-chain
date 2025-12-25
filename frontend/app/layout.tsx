import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { ErrorSuppressor } from "../components/ErrorSuppressor";
import { FaviconIcon } from "../components/FaviconIcon";

export const metadata: Metadata = {
  title: "Secure Apparel Chain - Privacy-Preserving Production Analytics",
  description: "Encrypted production difference tracking system using Fully Homomorphic Encryption",
  keywords: ["FHE", "blockchain", "encryption", "production tracking", "Web3", "Zama", "FHEVM"],
  authors: [{ name: "Production Delta Team" }],
  viewport: "width=device-width, initial-scale=1, maximum-scale=1",
  themeColor: "#0066ff",
  icons: {
    icon: [
      { url: "/logo.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    shortcut: "/logo.svg",
    apple: "/logo.svg",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="text-foreground antialiased">
        <ErrorSuppressor />
        <Providers>
          <div className="production-bg" />
          <div className="relative z-10">
            <nav className="sticky top-0 z-50 backdrop-blur-md bg-background/80 border-b border-border">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex w-full h-fit py-4 justify-between items-center">
                  <div className="flex items-center gap-4">
                    <FaviconIcon />
                    <div>
                      <h1 className="text-lg md:text-xl font-bold bg-gradient-to-r from-production-blue-600 to-production-teal-600 bg-clip-text text-transparent">
                        Secure Apparel Chain
                      </h1>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <ConnectButton />
                  </div>
                </div>
              </div>
            </nav>
            <div className="flex-1">
              {children}
            </div>
          </div>
        </Providers>
      </body>
    </html>
  );
}

