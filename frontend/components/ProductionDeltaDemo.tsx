"use client";

import { useState, useRef, useEffect } from "react";
import { ethers } from "ethers";
import { useFhevm } from "../fhevm/useFhevm";
import { useInMemoryStorage } from "../hooks/useInMemoryStorage";
import { useRainbowWallet } from "../hooks/useRainbowWallet";
import { useProductionDelta } from "@/hooks/useProductionDelta";

export const ProductionDeltaDemo = () => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const { storage: fhevmDecryptionSignatureStorage } = useInMemoryStorage();
  const {
    provider,
    chainId,
    isConnected,
    ethersSigner,
    ethersReadonlyProvider,
  } = useRainbowWallet();

  const chainIdRef = useRef<number | undefined>(chainId);
  const ethersSignerRef = useRef(ethersSigner);
  
  const sameChain = useRef((cid: number | undefined) => {
    return cid === chainIdRef.current;
  });
  
  const sameSigner = useRef(
    (signer: ethers.JsonRpcSigner | undefined) => {
      return signer === ethersSignerRef.current;
    }
  );
  
  // Update refs when values change
  if (chainIdRef.current !== chainId) {
    chainIdRef.current = chainId;
  }
  if (ethersSignerRef.current !== ethersSigner) {
    ethersSignerRef.current = ethersSigner;
  }

  const {
    instance: fhevmInstance,
    status: fhevmStatus,
    error: fhevmError,
  } = useFhevm({
    provider,
    chainId,
    initialMockChains: { 31337: "http://localhost:8545" },
    enabled: true,
  });

  const productionDelta = useProductionDelta({
    instance: fhevmInstance,
    fhevmDecryptionSignatureStorage,
    chainId,
    ethersSigner,
    ethersReadonlyProvider,
    sameChain,
    sameSigner,
  });

  const [yesterdayValue, setYesterdayValue] = useState<string>("");
  const [todayValue, setTodayValue] = useState<string>("");
  const [showAdvancedStats, setShowAdvancedStats] = useState<boolean>(false);
  const [useBatchMode, setUseBatchMode] = useState<boolean>(false);
  const [resetConfirm, setResetConfirm] = useState<boolean>(false);

  if (!mounted) {
    return null;
  }

  const buttonClass =
    "production-btn inline-flex items-center justify-center px-6 py-3 font-semibold " +
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-production-blue-500 focus-visible:ring-offset-2 " +
    "disabled:opacity-50 disabled:pointer-events-none";

  const buttonSecondaryClass =
    "production-btn-secondary inline-flex items-center justify-center px-6 py-3 font-semibold " +
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-production-teal-500 focus-visible:ring-offset-2 " +
    "disabled:opacity-50 disabled:pointer-events-none";

  const buttonDangerClass =
    "inline-flex items-center justify-center rounded-xl bg-red-500 px-6 py-3 font-semibold text-white shadow-sm " +
    "transition-all duration-200 hover:bg-red-600 hover:transform hover:-translate-y-0.5 " +
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 " +
    "disabled:opacity-50 disabled:pointer-events-none";

  const inputClass =
    "production-input w-full";

  const titleClass = "font-semibold text-foreground text-xl mb-4";

  if (!isConnected) {
    return (
      <div className="production-card p-8 text-center max-w-md mx-auto">
        <p className="text-foreground text-xl mb-4">Please connect your wallet to continue</p>
      </div>
    );
  }

  if (productionDelta.isDeployed === false) {
    return (
      <div className="production-card p-6 text-center max-w-2xl mx-auto">
        <p className="text-destructive font-semibold">
          ProductionDelta contract not deployed on chainId={chainId}. Please deploy first.
        </p>
      </div>
    );
  }

  // Check FHEVM status - only show critical errors, ignore network fetch errors
  if (fhevmStatus === "error" && fhevmError && !fhevmError.message?.includes('Failed to fetch')) {
    return (
      <div className="production-card p-6 text-center max-w-2xl mx-auto">
        <p className="text-destructive font-semibold mb-2">
          FHEVM Initialization Failed
        </p>
        <p className="text-sm text-muted-foreground mb-4">
          {fhevmError.message || "Unable to initialize FHEVM. Please check your network connection."}
        </p>
        <p className="text-xs text-muted-foreground">
          For Sepolia testnet, FHEVM requires connection to relayer.testnet.zama.cloud.
          If the relayer is unavailable, try using local Hardhat node (chainId: 31337) instead.
        </p>
      </div>
    );
  }

  if (fhevmStatus !== "ready" || !fhevmInstance) {
    return (
      <div className="production-card p-8 text-center max-w-md mx-auto">
        <p className="text-foreground font-semibold mb-2">
          Initializing FHEVM... ({fhevmStatus})
        </p>
        <p className="text-sm text-muted-foreground mt-2 mb-4">
          This may take a moment. Please wait...
        </p>
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-production-blue-500 border-t-transparent"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Header Card */}
      <div className="production-card p-6 md:p-8">
        <h2 className="font-bold text-2xl md:text-3xl mb-2 bg-gradient-to-r from-production-blue-600 to-production-teal-600 bg-clip-text text-transparent">
          Production Delta Tracker
        </h2>
        <p className="text-sm text-muted-foreground font-mono">
          ProductionDelta.sol
        </p>
      </div>

      {/* Sepolia Notice */}
      {chainId === 11155111 && fhevmStatus === "ready" && (
        <div className="production-card p-4 bg-production-blue-50 border-production-blue-200">
          <p className="text-sm text-production-blue-800">
            <strong>ℹ️ Note:</strong> On Sepolia testnet, FHEVM requires the relayer service. 
            If submission fails, the relayer may be temporarily unavailable. 
            For testing, consider using local Hardhat node (chainId: 31337) which uses mock mode and doesn&apos;t require relayer.
          </p>
        </div>
      )}

      {/* Submit Production Values Card */}
      <div className="production-card p-6 md:p-8">
        <p className={titleClass}>Submit Production Values</p>
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-3">
            <label className="text-sm font-medium text-foreground">Batch Mode:</label>
            <button
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                useBatchMode
                  ? "bg-production-blue-500 text-white shadow-md"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
              onClick={() => setUseBatchMode(!useBatchMode)}
            >
              {useBatchMode ? "ON" : "OFF"}
            </button>
          </div>
        </div>
        
        {useBatchMode ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Yesterday&apos;s Production
                </label>
                <input
                  type="number"
                  className={inputClass}
                  value={yesterdayValue}
                  onChange={(e) => setYesterdayValue(e.target.value)}
                  placeholder="Enter yesterday&apos;s value (1-1,000,000)"
                  min="1"
                  max="1000000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Today&apos;s Production
                </label>
                <input
                  type="number"
                  className={inputClass}
                  value={todayValue}
                  onChange={(e) => setTodayValue(e.target.value)}
                  placeholder="Enter today&apos;s value"
                  min="0"
                />
              </div>
            </div>
            <button
              className={`${buttonClass} w-full`}
              disabled={!productionDelta.canSubmit || !yesterdayValue || !todayValue ||
                       parseInt(yesterdayValue) <= 0 || parseInt(todayValue) <= 0 ||
                       parseInt(yesterdayValue) > 1000000 || parseInt(todayValue) > 1000000}
              onClick={() => {
                productionDelta.submitProduction(parseInt(yesterdayValue), false);
                setTimeout(() => productionDelta.submitProduction(parseInt(todayValue), true), 2000);
              }}
            >
              {productionDelta.isSubmitting
                ? "Submitting Both..."
                : "Submit Both Values"}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Yesterday&apos;s Production
                </label>
                <input
                  type="number"
                  className={inputClass}
                  value={yesterdayValue}
                  onChange={(e) => setYesterdayValue(e.target.value)}
                  placeholder="Enter yesterday&apos;s value"
                  min="0"
                />
                <button
                  className={`${buttonClass} mt-3 w-full`}
                  disabled={!productionDelta.canSubmit || !yesterdayValue || parseInt(yesterdayValue) <= 0}
                  onClick={() => productionDelta.submitProduction(parseInt(yesterdayValue), false)}
                >
                  {productionDelta.isSubmitting
                    ? "Submitting..."
                    : "Submit Yesterday"}
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Today&apos;s Production
                </label>
                <input
                  type="number"
                  className={inputClass}
                  value={todayValue}
                  onChange={(e) => setTodayValue(e.target.value)}
                  placeholder="Enter today&apos;s value"
                  min="0"
                />
                <button
                  className={`${buttonClass} mt-3 w-full`}
                  disabled={productionDelta.isSubmitting || !todayValue || parseInt(todayValue) <= 0 || parseInt(todayValue) > 1000000}
                  onClick={() => productionDelta.submitProduction(parseInt(todayValue), true)}
                >
                  {productionDelta.isSubmitting
                    ? "Submitting..."
                    : "Submit Today"}
                </button>
              </div>
          </div>
        )}
      </div>

      {/* Calculate & View Delta Card */}
      <div className="production-card p-6 md:p-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <p className={titleClass}>Calculate & View Delta</p>
          <div className="flex space-x-2">
            {!resetConfirm ? (
              <button
                className={buttonDangerClass}
                onClick={() => setResetConfirm(true)}
              >
                Reset Values
              </button>
            ) : (
              <div className="flex space-x-2">
                <button
                  className="inline-flex items-center justify-center rounded-xl bg-muted px-6 py-3 font-semibold text-muted-foreground shadow-sm transition-all duration-200 hover:bg-muted/80"
                  onClick={() => setResetConfirm(false)}
                >
                  Cancel
                </button>
                <button
                  className={buttonDangerClass}
                  onClick={() => {
                    productionDelta.resetValues();
                    setResetConfirm(false);
                  }}
                >
                  Confirm Reset
                </button>
              </div>
            )}
          </div>
        </div>
        <div className="flex justify-between items-center mb-6">
          <div className="text-sm text-muted-foreground">
            Status: <span className={`font-medium ${productionDelta.canCalculate ? 'text-production-teal-600' : 'text-muted-foreground'}`}>
              {productionDelta.canCalculate ? "✓ Ready" : "⏳ Waiting for data"}
            </span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <button
            className={buttonClass}
            disabled={!productionDelta.canCalculate}
            onClick={productionDelta.calculateDelta}
          >
            {productionDelta.canCalculate
              ? "Calculate Delta"
              : productionDelta.isCalculating
                ? "Calculating..."
                : "Cannot calculate"}
          </button>

          <button
            className={buttonClass}
            disabled={!productionDelta.canDecrypt}
            onClick={productionDelta.decryptDeltaHandle}
          >
            {productionDelta.canDecrypt
              ? "Decrypt Delta"
              : productionDelta.isDecrypted
                ? `Decrypted: ${productionDelta.clear?.toString()}`
                : productionDelta.isDecrypting
                  ? "Decrypting..."
                  : "Nothing to decrypt"}
          </button>
        </div>

        {productionDelta.isDecrypted && productionDelta.clear !== undefined && (
          <div className="mt-6 p-6 production-card bg-gradient-to-br from-production-blue-50 to-production-teal-50 border-production-blue-200">
            <div className="flex justify-between items-center mb-4">
              <p className="text-lg font-semibold text-foreground">
                Analysis Result:
              </p>
              <button
                className="text-sm px-4 py-2 production-btn-secondary rounded-lg transition-all"
                onClick={() => setShowAdvancedStats(!showAdvancedStats)}
              >
                {showAdvancedStats ? "Hide Details" : "Show Details"}
              </button>
            </div>
            <p className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-production-blue-600 to-production-teal-600 bg-clip-text text-transparent mt-2">
              {Number(productionDelta.clear) > 0
                ? `Today's production is ${productionDelta.clear.toString()} units higher than yesterday`
                : Number(productionDelta.clear) < 0
                  ? `Today's production is ${(-Number(productionDelta.clear)).toString()} units lower than yesterday`
                  : "Today's production matches yesterday's level"}
            </p>
            {showAdvancedStats && (
              <div className="mt-4 p-4 production-card bg-white/80">
                <p className="text-sm text-foreground mb-2">
                  <strong>Trend:</strong>{" "}
                  <span className={`font-semibold ${
                    Number(productionDelta.clear) > 0 ? 'text-production-teal-600' :
                    Number(productionDelta.clear) < 0 ? 'text-red-500' : 'text-muted-foreground'
                  }`}>
                    {Number(productionDelta.clear) > 0 ? "📈 Increasing" :
                     Number(productionDelta.clear) < 0 ? "📉 Decreasing" : "➡️ Stable"}
                  </span>
                </p>
                <p className="text-sm text-foreground">
                  <strong>Change Magnitude:</strong> <span className="font-semibold text-production-blue-600">{Math.abs(Number(productionDelta.clear))} units</span>
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

