"use client";

import { useState, useEffect, useRef } from "react";

interface PerformanceMetrics {
  pageLoadTime: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  firstInputDelay: number;
  cumulativeLayoutShift: number;
  contractInteractions: number;
  averageResponseTime: number;
  errorCount: number;
}

interface PerformanceEntry {
  name: string;
  startTime: number;
  duration?: number;
  entryType: string;
}

export const usePerformanceMonitor = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    pageLoadTime: 0,
    firstContentfulPaint: 0,
    largestContentfulPaint: 0,
    firstInputDelay: 0,
    cumulativeLayoutShift: 0,
    contractInteractions: 0,
    averageResponseTime: 0,
    errorCount: 0,
  });

  const contractCallsRef = useRef<Array<{ startTime: number; endTime?: number }>>([]);
  const errorCountRef = useRef(0);

  useEffect(() => {
    // Page load time
    const navigation = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming;
    if (navigation) {
      setMetrics(prev => ({
        ...prev,
        pageLoadTime: navigation.loadEventEnd - navigation.fetchStart
      }));
    }

    // Web Vitals monitoring
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const perfEntry = entry as PerformanceEntry;

        switch (perfEntry.entryType) {
          case "paint":
            if (perfEntry.name === "first-contentful-paint") {
              setMetrics(prev => ({
                ...prev,
                firstContentfulPaint: perfEntry.startTime
              }));
            }
            break;

          case "largest-contentful-paint":
            setMetrics(prev => ({
              ...prev,
              largestContentfulPaint: perfEntry.startTime
            }));
            break;

          case "first-input":
            setMetrics(prev => ({
              ...prev,
              firstInputDelay: perfEntry.duration || 0
            }));
            break;

          case "layout-shift":
            setMetrics(prev => ({
              ...prev,
              cumulativeLayoutShift: prev.cumulativeLayoutShift + (entry as any).value
            }));
            break;
        }
      }
    });

    try {
      observer.observe({ entryTypes: ["paint", "largest-contentful-paint", "first-input", "layout-shift"] });
    } catch (error) {
      console.warn("Performance monitoring not fully supported:", error);
    }

    return () => observer.disconnect();
  }, []);

  const trackContractCall = (startTime: number) => {
    contractCallsRef.current.push({ startTime });
  };

  const completeContractCall = (startTime: number, endTime: number) => {
    const call = contractCallsRef.current.find(c => c.startTime === startTime);
    if (call) {
      call.endTime = endTime;
      updateContractMetrics();
    }
  };

  const trackError = () => {
    errorCountRef.current++;
    setMetrics(prev => ({
      ...prev,
      errorCount: errorCountRef.current
    }));
  };

  const updateContractMetrics = () => {
    const completedCalls = contractCallsRef.current.filter(c => c.endTime);
    const totalResponseTime = completedCalls.reduce(
      (sum, call) => sum + (call.endTime! - call.startTime),
      0
    );

    setMetrics(prev => ({
      ...prev,
      contractInteractions: completedCalls.length,
      averageResponseTime: completedCalls.length > 0 ? totalResponseTime / completedCalls.length : 0
    }));
  };

  const getPerformanceReport = () => {
    const score = calculatePerformanceScore(metrics);
    return {
      ...metrics,
      score,
      grade: getPerformanceGrade(score)
    };
  };

  const calculatePerformanceScore = (metrics: PerformanceMetrics): number => {
    let score = 100;

    // Page load time penalty
    if (metrics.pageLoadTime > 3000) score -= 20;
    else if (metrics.pageLoadTime > 2000) score -= 10;

    // FCP penalty
    if (metrics.firstContentfulPaint > 2000) score -= 15;
    else if (metrics.firstContentfulPaint > 1000) score -= 5;

    // LCP penalty
    if (metrics.largestContentfulPaint > 4000) score -= 20;
    else if (metrics.largestContentfulPaint > 2500) score -= 10;

    // FID penalty
    if (metrics.firstInputDelay > 100) score -= 15;
    else if (metrics.firstInputDelay > 50) score -= 5;

    // CLS penalty
    if (metrics.cumulativeLayoutShift > 0.25) score -= 15;
    else if (metrics.cumulativeLayoutShift > 0.1) score -= 5;

    // Error penalty
    score -= metrics.errorCount * 5;

    return Math.max(0, Math.min(100, score));
  };

  const getPerformanceGrade = (score: number): string => {
    if (score >= 90) return "A";
    if (score >= 80) return "B";
    if (score >= 70) return "C";
    if (score >= 60) return "D";
    return "F";
  };

  return {
    metrics,
    trackContractCall,
    completeContractCall,
    trackError,
    getPerformanceReport
  };
};
