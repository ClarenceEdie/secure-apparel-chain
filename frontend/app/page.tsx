import { WalletConnect } from "@/components/WalletConnect";
import { ProductionForm } from "@/components/ProductionForm";
import { ProductionDeltaDemo } from "@/components/ProductionDeltaDemo";

// Disable static generation since this page uses Web3 wallet connections
export const dynamic = 'force-dynamic';

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 py-4 md:py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            Secure Apparel Chain
          </h1>
          <p className="text-sm md:text-base text-gray-600 max-w-2xl mx-auto">
            Privacy-preserving production tracking with FHEVM
          </p>
        </div>

        {/* Wallet Connection */}
        <div className="flex justify-center mb-6 md:mb-8">
          <WalletConnect />
        </div>

        {/* Production Form */}
        <div className="mb-6 md:mb-8">
          <ProductionForm
            onSubmit={(yesterday, today) => {
              console.log("Production data submitted:", { yesterday, today });
              // This will be integrated with the contract later
            }}
          />
        </div>

        {/* Main Demo Component */}
        <div className="flex flex-col gap-6 md:gap-8 items-center w-full">
          <ProductionDeltaDemo />
        </div>
      </div>
    </main>
  );
}

