"use client";

import { useAccount, useChainId, useWalletClient } from "wagmi";
import { ethers } from "ethers";
import { useMemo } from "react";

/**
 * Hook to bridge wagmi/Rainbow wallet with ethers.js for FHEVM integration
 */
export function useRainbowWallet() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { data: walletClient } = useWalletClient();

  // Convert wagmi wallet client to ethers Eip1193Provider
  const provider = useMemo(() => {
    if (!walletClient) return undefined;
    
    // Create an Eip1193Provider adapter from wagmi's wallet client
    return {
      request: async (args: { method: string; params?: unknown[] }) => {
        if (args.method === "eth_requestAccounts") {
          return [address];
        }
        if (args.method === "eth_accounts") {
          return address ? [address] : [];
        }
        if (args.method === "eth_chainId") {
          return `0x${chainId.toString(16)}`;
        }
        // For other methods, use walletClient
        return walletClient.request(args as any);
      },
    } as ethers.Eip1193Provider;
  }, [walletClient, address, chainId]);

  const ethersSigner = useMemo(() => {
    if (!provider || !address || !isConnected) return undefined;
    
    const browserProvider = new ethers.BrowserProvider(provider);
    return new ethers.JsonRpcSigner(browserProvider, address);
  }, [provider, address, isConnected]);

  const ethersReadonlyProvider = useMemo(() => {
    if (!provider) return undefined;
    return new ethers.BrowserProvider(provider);
  }, [provider]);

  return {
    provider,
    chainId,
    accounts: address ? [address] : undefined,
    isConnected,
    ethersSigner,
    ethersReadonlyProvider,
  };
}

