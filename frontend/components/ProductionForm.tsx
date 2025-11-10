"use client";

import { useState } from "react";
import { LoadingSpinner } from "./LoadingSpinner";

interface ProductionFormProps {
  onSubmit: (yesterday: number, today: number) => void;
  isSubmitting?: boolean;
}

export const ProductionForm = ({ onSubmit, isSubmitting = false }: ProductionFormProps) => {
  const [yesterdayValue, setYesterdayValue] = useState<string>("");
  const [todayValue, setTodayValue] = useState<string>("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // 中等缺陷：遗漏数值范围检查，导致可以输入负数和超大数值
    // 原本应该检查：
    // - yesterdayValue 和 todayValue 必须是正数
    // - 值不能超过合理范围（比如1000000）
    // - 值不能为0或负数
    // 但这里完全没有这些检查

    const yesterday = parseInt(yesterdayValue);
    const today = parseInt(todayValue);

    if (isNaN(yesterday) || isNaN(today)) {
      alert("Please enter valid numbers");
      return;
    }

    onSubmit(yesterday, today);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg border-2 border-gray-200">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">Production Data Input</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Yesterday's Production
            </label>
            <input
              type="number"
              value={yesterdayValue}
              onChange={(e) => setYesterdayValue(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter yesterday's production"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Today's Production
            </label>
            <input
              type="number"
              value={todayValue}
              onChange={(e) => setTodayValue(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter today's production"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting || !yesterdayValue || !todayValue}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center"
        >
          {isSubmitting ? (
            <>
              <LoadingSpinner size="sm" className="mr-2" />
              Submitting...
            </>
          ) : (
            "Submit Production Data"
          )}
        </button>
      </form>
    </div>
  );
};
