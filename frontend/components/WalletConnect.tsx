"use client";

import { useState, useEffect } from "react";
import { useConnect, useDisconnect, useAccount, useChainId } from "wagmi";
import { injected } from "wagmi/connectors";

export const WalletConnect = () => {
  const [mounted, setMounted] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionError, setConnectionError] = useState<string>("");
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);

  const { connect, connectors, error: connectError } = useConnect();
  const { disconnect } = useDisconnect();
  const { address, isConnected, connector } = useAccount();
  const chainId = useChainId();

  // Ensure component is mounted on client side to avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Check if browser supports Ethereum
  const isEthereumSupported = typeof window !== "undefined" && window.ethereum;

  // Handle connection errors
  useEffect(() => {
    if (connectError) {
      let errorMessage = "Connection failed";

      if (connectError.message.includes("User rejected")) {
        errorMessage = "Connection rejected by user";
      } else if (connectError.message.includes("Unsupported chain")) {
        errorMessage = "Unsupported network. Please switch to a supported chain.";
      } else if (connectError.message.includes("Connector not found")) {
        errorMessage = "Wallet not found. Please install a Web3 wallet.";
      } else {
        errorMessage = connectError.message;
      }

      setConnectionError(errorMessage);
      setIsConnecting(false);
      setIsRetrying(false);
    }
  }, [connectError]);

  const checkWalletPermissions = async () => {
    if (!window.ethereum) return false;

    try {
      const accounts = await window.ethereum.request({ method: "eth_accounts" });
      return accounts && accounts.length > 0;
    } catch (error) {
      console.warn("Permission check failed:", error);
      return false;
    }
  };

  const handleConnect = async () => {
    if (!isEthereumSupported) {
      setConnectionError("Ethereum not supported. Please install MetaMask or another Web3 wallet.");
      return;
    }

    setIsConnecting(true);
    setConnectionError("");

    try {
      // Check for multiple wallet extensions
      const injectedConnector = connectors.find(c => c.id === "injected");
      if (!injectedConnector) {
        throw new Error("No injected wallet connector found");
      }

      // Check wallet permissions first
      const hasPermission = await checkWalletPermissions();
      if (!hasPermission) {
        console.log("Requesting wallet permissions...");
      }

      // Attempt connection with timeout
      const connectionPromise = connect({ connector: injectedConnector });

      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error("Connection timeout")), 30000);
      });

      await Promise.race([connectionPromise, timeoutPromise]);

      // Validate connection
      if (isConnected && address) {
        console.log("Wallet connected successfully:", address);
        setRetryCount(0);
      }

    } catch (error) {
      console.error("Connection failed:", error);

      // Implement retry logic
      if (retryCount < 3) {
        setIsRetrying(true);
        setTimeout(() => {
          setRetryCount(prev => prev + 1);
          setIsRetrying(false);
          handleConnect();
        }, 2000 * (retryCount + 1)); // Exponential backoff
      } else {
        setConnectionError("Failed to connect after multiple attempts. Please try again.");
        setRetryCount(0);
      }
    } finally {
      if (!isRetrying) {
        setIsConnecting(false);
      }
    }
  };

  const handleDisconnect = () => {
    disconnect();
    setConnectionError("");
    setRetryCount(0);
  };

  const handleRetry = () => {
    setRetryCount(0);
    setConnectionError("");
    handleConnect();
  };

  // Prevent hydration mismatch by ensuring consistent initial render
  if (!mounted) {
    return (
      <div className="production-card p-6 flex flex-col items-center space-y-4 max-w-md">
        <button
          disabled
          className="production-btn w-full flex items-center justify-center opacity-50"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          Connect Wallet
        </button>
      </div>
    );
  }

  if (isConnected && address) {
    return (
      <div className="production-card p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-3 h-3 rounded-full bg-production-teal-500 animate-pulse"></div>
          <div className="text-sm">
            <span className="text-muted-foreground">Connected: </span>
            <span className="font-mono font-semibold text-foreground">
              {address.slice(0, 6)}...{address.slice(-4)}
            </span>
            {connector && (
              <span className="ml-2 text-xs text-muted-foreground">
                ({connector.name})
              </span>
            )}
          </div>
        </div>
        <button
          onClick={handleDisconnect}
          className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all font-medium shadow-sm hover:shadow-md"
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <div className="production-card p-6 flex flex-col items-center space-y-4 max-w-md">
      {connectionError && (
        <div className="w-full text-sm text-destructive bg-red-50 px-4 py-3 rounded-lg border border-red-200">
          {connectionError}
        </div>
      )}

      <button
        onClick={handleConnect}
        disabled={isConnecting || isRetrying}
        className="production-btn w-full flex items-center justify-center"
      >
        {isRetrying ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
            Retrying... ({retryCount}/3)
          </>
        ) : isConnecting ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
            Connecting...
          </>
        ) : (
          <>
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Connect Wallet
          </>
        )}
      </button>

      {connectionError && retryCount >= 3 && (
        <button
          onClick={handleRetry}
          className="px-4 py-2 bg-muted text-muted-foreground rounded-lg hover:bg-muted/80 transition-all text-sm font-medium"
        >
          Try Again
        </button>
      )}

      {!isEthereumSupported && (
        <p className="text-xs text-muted-foreground text-center">
          No Web3 wallet detected. Please install MetaMask or another Web3 wallet to continue.
        </p>
      )}
    </div>
  );
};
