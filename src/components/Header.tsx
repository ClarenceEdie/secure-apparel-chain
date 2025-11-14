import { Wallet, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";
import logo from "@/assets/logo.png";

export const Header = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState("");

  const connectWallet = async () => {
    try {
      if (typeof window.ethereum !== "undefined") {
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        }) as string[];
        
        if (accounts && accounts.length > 0) {
          const address = accounts[0];
          setWalletAddress(address);
          setIsConnected(true);
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
    setIsConnected(false);
    setWalletAddress("");
    toast.info("Wallet disconnected");
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/80 backdrop-blur-lg">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={logo} alt="Secure Apparel Flow" className="h-10 w-10" />
            <div>
              <h1 className="text-xl font-bold text-foreground">Secure Apparel Flow</h1>
              <p className="text-xs text-muted-foreground">Trace Fashion, Protect Data</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {isConnected ? (
              <>
                <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary">
                  <Lock className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">{formatAddress(walletAddress)}</span>
                </div>
                <Button variant="ghost" size="sm" onClick={disconnectWallet}>
                  Disconnect
                </Button>
              </>
            ) : (
              <Button variant="wallet" onClick={connectWallet}>
                <Wallet className="h-4 w-4" />
                Connect Wallet
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
