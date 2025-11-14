import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { HeroSection } from "@/components/HeroSection";
import { GarmentBatchGrid } from "@/components/GarmentBatchGrid";

const Index = () => {
  const [isWalletConnected, setIsWalletConnected] = useState(false);

  // Check wallet connection status
  useEffect(() => {
    const checkConnection = async () => {
      if (typeof window.ethereum !== "undefined") {
        try {
          const accounts = await window.ethereum.request({ 
            method: "eth_accounts" 
          }) as string[];
          setIsWalletConnected(accounts && accounts.length > 0);
        } catch (error) {
          console.error("Error checking wallet connection:", error);
        }
      }
    };

    checkConnection();

    // Listen for account changes
    if (typeof window.ethereum !== "undefined") {
      window.ethereum.on("accountsChanged", (accounts: string[]) => {
        setIsWalletConnected(accounts && accounts.length > 0);
      });
    }

    return () => {
      if (typeof window.ethereum !== "undefined") {
        window.ethereum.removeListener("accountsChanged", () => {});
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-20">
        <HeroSection />
        <GarmentBatchGrid isWalletConnected={isWalletConnected} />
      </main>
    </div>
  );
};

export default Index;
