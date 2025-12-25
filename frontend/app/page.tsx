import { WalletConnect } from "@/components/WalletConnect";
import { ProductionDeltaDemo } from "@/components/ProductionDeltaDemo";

// Disable static generation since this page uses Web3 wallet connections
export const dynamic = 'force-dynamic';

export default function Home() {
  return (
    <main className="min-h-screen relative">
      {/* Background */}
      <div className="production-bg" />
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {/* Header Section */}
        <div className="text-center mb-8 md:mb-12">
          <div className="production-card p-8 md:p-12 mb-6">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-production-blue-600 to-production-teal-600 bg-clip-text text-transparent mb-4">
              Secure Apparel Chain
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-6">
              Privacy-preserving production tracking with Fully Homomorphic Encryption
            </p>
            <div className="flex flex-wrap justify-center gap-2 mt-4">
              <span className="production-badge">🔒 Encrypted Storage</span>
              <span className="production-badge">📊 Privacy-Preserving Analytics</span>
              <span className="production-badge">⚡ Real-time Calculations</span>
            </div>
          </div>

          {/* Wallet Connection */}
          <div className="flex justify-center mb-8">
            <WalletConnect />
          </div>
        </div>

        {/* Main Demo Component */}
        <div className="flex flex-col gap-6 md:gap-8 items-center w-full">
          <ProductionDeltaDemo />
        </div>
      </div>
    </main>
  );
}

