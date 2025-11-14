import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { HeroSection } from "@/components/HeroSection";
import { GarmentBatchGrid } from "@/components/GarmentBatchGrid";
import { UploadBatchDialog } from "@/components/UploadBatchDialog";
import { toast } from "sonner";

const Index = () => {
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState("");
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
          if (accounts && accounts.length > 0) {
            setIsWalletConnected(true);
            setWalletAddress(accounts[0]);
          }
        } catch (error) {
          console.error("Error checking wallet connection:", error);
        }
      }
    };

    checkConnection();

    // Listen for account changes
    if (typeof window.ethereum !== "undefined") {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts && accounts.length > 0) {
          setIsWalletConnected(true);
          setWalletAddress(accounts[0]);
        } else {
          setIsWalletConnected(false);
          setWalletAddress("");
        }
      };
      
      window.ethereum.on("accountsChanged", handleAccountsChanged);
      
      return () => {
        window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
      };
    }
  }, []);

  const connectWallet = async () => {
    try {
      if (typeof window.ethereum !== "undefined") {
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        }) as string[];
        
        if (accounts && accounts.length > 0) {
          setWalletAddress(accounts[0]);
          setIsWalletConnected(true);
          toast.success("Wallet connected successfully!");
        }
      } else {
        toast.error("Please install MetaMask to connect your wallet");
      }
    } catch (error) {
      console.error("Error connecting wallet:", error);
      toast.error("Failed to connect wallet");
    }
  };

  const disconnectWallet = () => {
    setIsWalletConnected(false);
    setWalletAddress("");
    toast.info("Wallet disconnected");
  };

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
      <Header 
        isConnected={isWalletConnected}
        walletAddress={walletAddress}
        onConnect={connectWallet}
        onDisconnect={disconnectWallet}
      />
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
