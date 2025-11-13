"use client";

import { useState } from "react";
import { LoadingSpinner } from "./LoadingSpinner";

interface DeltaDisplayProps {
  deltaValue?: number;
  isLoading?: boolean;
  onDecrypt?: () => Promise<void>;
  isDecrypting?: boolean;
  error?: string;
}

export const DeltaDisplay = ({
  deltaValue,
  isLoading = false,
  onDecrypt,
  isDecrypting = false,
  error
}: DeltaDisplayProps) => {
  const [localError, setLocalError] = useState<string>("");

  const handleDecrypt = async () => {
    if (!onDecrypt) return;

    try {
      setLocalError("");
      await onDecrypt();
    } catch (err) {
      // Add proper error boundary handling
      const errorMessage = err instanceof Error
        ? err.message
        : "An unexpected error occurred during decryption";

      setLocalError(`Decryption failed: ${errorMessage}`);
      console.error("Decryption error:", err);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-lg border-2 border-gray-200">
        <div className="flex items-center justify-center py-8">
          <LoadingSpinner size="lg" className="mr-3" />
          <span className="text-gray-600">Processing...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg border-2 border-gray-200">
      <h3 className="text-lg font-semibold mb-4 text-gray-800">
        Production Delta Result
      </h3>

      <div className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {localError && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-600 text-sm">{localError}</p>
          </div>
        )}

        {deltaValue !== undefined ? (
          <div className="p-4 bg-green-50 border border-green-200 rounded-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Delta Value:</p>
                <p className="text-2xl font-bold text-green-600">
                  {deltaValue > 0 && "+"}
                  {deltaValue}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Status:</p>
                <p className={`text-sm font-medium ${
                  deltaValue > 0 ? "text-green-600" :
                  deltaValue < 0 ? "text-red-600" : "text-gray-600"
                }`}>
                  {deltaValue > 0 ? "Increased" :
                   deltaValue < 0 ? "Decreased" : "Stable"}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">No delta calculated yet</p>
            <button
              onClick={handleDecrypt}
              disabled={isDecrypting}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center mx-auto"
            >
              {isDecrypting ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Decrypting...
                </>
              ) : (
                "Decrypt Delta"
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
