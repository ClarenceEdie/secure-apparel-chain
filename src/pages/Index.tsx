import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { HeroSection } from "@/components/HeroSection";
import { GarmentBatchGrid } from "@/components/GarmentBatchGrid";
import { UploadBatchDialog } from "@/components/UploadBatchDialog";
import { toast } from "sonner";

const Index = () => {
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [customBatches, setCustomBatches] = useState<any[]>([]);

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

  const handleUploadClick = () => {
    if (!isWalletConnected) {
      toast.error("Please connect your wallet to upload batch data");
      return;
    }
    setUploadDialogOpen(true);
  };

  const handleVerifyClick = () => {
    const batchesSection = document.getElementById("batches-section");
    if (batchesSection) {
      batchesSection.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleBatchUpload = (batch: any) => {
    setCustomBatches([batch, ...customBatches]);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-20">
        <HeroSection 
          onUploadClick={handleUploadClick} 
          onVerifyClick={handleVerifyClick}
        />
        <div id="batches-section">
          <GarmentBatchGrid 
            isWalletConnected={isWalletConnected} 
            customBatches={customBatches}
          />
        </div>
      </main>
      
      <UploadBatchDialog
        open={uploadDialogOpen}
        onOpenChange={setUploadDialogOpen}
        isWalletConnected={isWalletConnected}
        onUpload={handleBatchUpload}
      />
    </div>
  );
};

export default Index;
