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
    "inline-flex items-center justify-center rounded-xl bg-black px-4 py-4 font-semibold text-white shadow-sm " +
    "transition-colors duration-200 hover:bg-blue-700 active:bg-blue-800 " +
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 " +
    "disabled:opacity-50 disabled:pointer-events-none";

  const inputClass =
    "w-full px-4 py-2 border-2 border-black rounded-lg focus:outline-none focus:ring-2 focus:ring-black";

  const titleClass = "font-semibold text-black text-lg mt-4";

  if (!isConnected) {
    return (
      <div className="mx-auto text-center">
        <p className="text-black text-xl mb-4">Please connect your wallet to continue</p>
      </div>
    );
  }

  if (productionDelta.isDeployed === false) {
    return (
      <div className="mx-auto text-center bg-white p-6 rounded-lg border-2 border-black">
        <p className="text-red-600 font-semibold">
          ProductionDelta contract not deployed on chainId={chainId}. Please deploy first.
        </p>
      </div>
    );
  }

  // Check FHEVM status - only show critical errors, ignore network fetch errors
  if (fhevmStatus === "error" && fhevmError && !fhevmError.message?.includes('Failed to fetch')) {
    return (
      <div className="mx-auto text-center bg-white p-6 rounded-lg border-2 border-black">
        <p className="text-red-600 font-semibold mb-2">
          FHEVM Initialization Failed
        </p>
        <p className="text-sm text-black mb-4">
          {fhevmError.message || "Unable to initialize FHEVM. Please check your network connection."}
        </p>
        <p className="text-xs text-black">
          For Sepolia testnet, FHEVM requires connection to relayer.testnet.zama.cloud.
          If the relayer is unavailable, try using local Hardhat node (chainId: 31337) instead.
        </p>
      </div>
    );
  }

  if (fhevmStatus !== "ready" || !fhevmInstance) {
    return (
      <div className="mx-auto text-center bg-white p-6 rounded-lg border-2 border-black">
        <p className="text-black font-semibold">
          Initializing FHEVM... ({fhevmStatus})
        </p>
        <p className="text-sm text-black mt-2">
          This may take a moment. Please wait...
        </p>
        <div className="mt-4 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid w-full gap-4">
      <div className="col-span-full mx-20 bg-black text-white">
        <p className="font-semibold text-3xl m-5">
          Production Delta Tracker -{" "}
          <span className="font-mono font-normal text-gray-400">
            ProductionDelta.sol
          </span>
        </p>
      </div>

      {chainId === 11155111 && fhevmStatus === "ready" && (
        <div className="col-span-full mx-20 px-4 py-3 rounded-lg bg-white border-2 border-black">
          <p className="text-sm text-black">
            <strong>Note:</strong> On Sepolia testnet, FHEVM requires the relayer service. 
            If submission fails, the relayer may be temporarily unavailable. 
            For testing, consider using local Hardhat node (chainId: 31337) which uses mock mode and doesn&apos;t require relayer.
          </p>
        </div>
      )}

      <div className="col-span-full mx-20 mt-4 px-5 pb-4 rounded-lg bg-white border-2 border-black">
        <p className={titleClass}>Submit Production Values</p>
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center space-x-2">
            <label className="text-sm text-black">Batch Mode:</label>
            <button
              className={`px-3 py-1 rounded text-sm transition-colors border-2 border-black ${
                useBatchMode
                  ? "bg-black text-white"
                  : "bg-white text-black hover:bg-gray-100"
              }`}
              onClick={() => setUseBatchMode(!useBatchMode)}
            >
              {useBatchMode ? "ON" : "OFF"}
            </button>
          </div>
        </div>
        
        {useBatchMode ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-black mb-2">
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
                <label className="block text-sm font-medium text-black mb-2">
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
              <label className="block text-sm font-medium text-black mb-2">
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
                className={`${buttonClass} mt-2 w-full`}
                disabled={!productionDelta.canSubmit || !yesterdayValue || parseInt(yesterdayValue) <= 0}
                onClick={() => productionDelta.submitProduction(parseInt(yesterdayValue), false)}
              >
                {productionDelta.isSubmitting
                  ? "Submitting..."
                  : "Submit Yesterday"}
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-black mb-2">
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
                className={`${buttonClass} mt-2 w-full`}
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

      <div className="col-span-full mx-20 px-5 pb-4 rounded-lg bg-white border-2 border-black">
        <div className="flex justify-between items-center mb-4">
          <p className={titleClass}>Calculate & View Delta</p>
          <div className="flex space-x-2">
            {!resetConfirm ? (
              <button
                className={`${buttonClass} bg-red-600 hover:bg-red-700`}
                onClick={() => setResetConfirm(true)}
              >
                Reset Values
              </button>
            ) : (
              <div className="flex space-x-2">
                <button
                  className={`${buttonClass} bg-gray-600 hover:bg-gray-700`}
                  onClick={() => setResetConfirm(false)}
                >
                  Cancel
                </button>
                <button
                  className={`${buttonClass} bg-red-600 hover:bg-red-700`}
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
        <div className="flex justify-between items-center mb-4">
          <div className="text-sm text-black">
            Status: {productionDelta.canCalculate ? "Ready" : "Waiting for data"}
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mb-4">
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
          <div className="mt-4 p-4 bg-white rounded-lg border-2 border-black">
            <div className="flex justify-between items-center mb-2">
              <p className="text-lg font-semibold text-black">
                Analysis Result:
              </p>
              <button
                className="text-sm px-3 py-1 bg-black text-white hover:bg-blue-700 rounded transition-colors border-2 border-black"
                onClick={() => setShowAdvancedStats(!showAdvancedStats)}
              >
                {showAdvancedStats ? "Hide Details" : "Show Details"}
              </button>
            </div>
            <p className="text-2xl font-bold text-black mt-2">
              {Number(productionDelta.clear) > 0
                ? `Today&apos;s production is ${productionDelta.clear.toString()} units higher than yesterday`
                : Number(productionDelta.clear) < 0
                  ? `Today&apos;s production is ${(-Number(productionDelta.clear)).toString()} units lower than yesterday`
                  : "Today&apos;s production matches yesterday&apos;s level"}
            </p>
            {showAdvancedStats && (
              <div className="mt-4 p-3 bg-white rounded border-2 border-black">
                <p className="text-sm text-black">
                  <strong>Trend:</strong>{" "}
                  {Number(productionDelta.clear) > 0 ? "📈 Increasing" :
                   Number(productionDelta.clear) < 0 ? "📉 Decreasing" : "➡️ Stable"}
                </p>
                <p className="text-sm text-black mt-1">
                  <strong>Change Magnitude:</strong> {Math.abs(Number(productionDelta.clear))} units
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

