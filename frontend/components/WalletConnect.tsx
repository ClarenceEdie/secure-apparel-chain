"use client";

import { useState, useEffect } from "react";
import { useConnect, useDisconnect, useAccount, useChainId } from "wagmi";
import { injected } from "wagmi/connectors";

export const WalletConnect = () => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionError, setConnectionError] = useState<string>("");
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);

  const { connect, connectors, error: connectError } = useConnect();
  const { disconnect } = useDisconnect();
  const { address, isConnected, connector } = useAccount();
  const chainId = useChainId();

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

  if (isConnected && address) {
    return (
      <div className="flex items-center space-x-4">
        <div className="text-sm text-gray-600">
          Connected: {address.slice(0, 6)}...{address.slice(-4)}
          {connector && (
            <span className="ml-2 text-xs text-gray-500">
              ({connector.name})
            </span>
          )}
        </div>
        <button
          onClick={handleDisconnect}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center space-y-2">
      {connectionError && (
        <div className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded border border-red-200 max-w-xs">
          {connectionError}
        </div>
      )}

      <button
        onClick={handleConnect}
        disabled={isConnecting || isRetrying}
        className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-colors font-medium flex items-center"
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
          "Connect Wallet"
        )}
      </button>

      {connectionError && retryCount >= 3 && (
        <button
          onClick={handleRetry}
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors text-sm"
        >
          Try Again
        </button>
      )}

      {!isEthereumSupported && (
        <p className="text-xs text-gray-500 text-center max-w-xs">
          No Web3 wallet detected. Please install MetaMask or another Web3 wallet to continue.
        </p>
      )}
    </div>
  );
};
