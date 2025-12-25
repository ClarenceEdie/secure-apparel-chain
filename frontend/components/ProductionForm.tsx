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

    const yesterday = parseInt(yesterdayValue);
    const today = parseInt(todayValue);

    // 添加数值范围验证
    if (isNaN(yesterday) || isNaN(today)) {
      alert("Please enter valid numbers");
      return;
    }

    if (yesterday <= 0 || today <= 0) {
      alert("Production values must be positive numbers greater than 0");
      return;
    }

    if (yesterday > 1000000 || today > 1000000) {
      alert("Production values cannot exceed 1,000,000");
      return;
    }

    if (yesterday >= today) {
      alert("Today's production should be higher than yesterday's for meaningful delta calculation");
      return;
    }

    onSubmit(yesterday, today);
  };

  return (
    <div className="production-card p-6 md:p-8">
      <h2 className="text-xl font-semibold mb-6 text-foreground">Production Data Input</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Yesterday's Production
            </label>
            <input
              type="number"
              value={yesterdayValue}
              onChange={(e) => setYesterdayValue(e.target.value)}
              className="production-input w-full"
              placeholder="Enter yesterday's production"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Today's Production
            </label>
            <input
              type="number"
              value={todayValue}
              onChange={(e) => setTodayValue(e.target.value)}
              className="production-input w-full"
              placeholder="Enter today's production"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting || !yesterdayValue || !todayValue}
          className="production-btn w-full flex items-center justify-center"
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
