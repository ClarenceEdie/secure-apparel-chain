"use client";

import { useEffect } from "react";

export function ErrorSuppressor() {
  useEffect(() => {
    // Store original methods
    const originalError = console.error.bind(console);
    const originalWarn = console.warn.bind(console);

    // Override console.error
    console.error = (...args: unknown[]) => {
      const message = String(args[0] || '');
      const fullMessage = args.map(arg => String(arg)).join(' ');

      // Suppress Base Account SDK COOP warnings (non-critical, FHEVM requires COOP header)
      if (message.includes('Base Account SDK requires the Cross-Origin-Opener-Policy') ||
          fullMessage.includes('Base Account SDK requires the Cross-Origin-Opener-Policy')) {
        return;
      }

      // Suppress "Failed to fetch" errors from Analytics SDK or relayer
      if (message === 'Failed to fetch' || fullMessage.includes('Failed to fetch')) {
        // Check stack trace to see if it's from Analytics SDK or relayer
        const errorObj = args.find(arg => arg instanceof Error);
        const stack = errorObj?.stack || '';
        if (stack.includes('Analytics SDK') ||
            stack.includes('relayer') ||
            stack.includes('@base-org') ||
            stack.includes('cca-lite.coinbase.com') ||
            stack.includes('relayer-sdk-js') ||
            stack.includes('relayer.testnet.zama.cloud')) {
          return;
        }
      }

      // Suppress network resource errors (including CORS/COEP errors)
      if (message.includes('Failed to load resource') &&
          (message.includes('cca-lite.coinbase.com') ||
           message.includes('relayer.testnet.zama.cloud') ||
           message.includes('ERR_BLOCKED_BY_RESPONSE') ||
           message.includes('NotSameOriginAfterDefaultedToSameOriginByCoep'))) {
        return;
      }

      // Suppress Coinbase Analytics errors
      if (message.includes('Analytics SDK') ||
          fullMessage.includes('Analytics SDK') ||
          message.includes('cca-lite.coinbase.com')) {
        return;
      }

      // Suppress FHEVM-related network errors
      if (message.includes('fhevm') ||
          fullMessage.includes('fhevm') ||
          message.includes('Fully Homomorphic Encryption') ||
          fullMessage.includes('Fully Homomorphic Encryption')) {
        return;
      }

      // Suppress wallet connection errors that are not critical
      if (message.includes('MetaMask') ||
          fullMessage.includes('MetaMask') ||
          message.includes('wallet') ||
          fullMessage.includes('wallet')) {
        // Only suppress if it's a connection timeout or network issue
        if (message.includes('timeout') ||
            message.includes('network') ||
            message.includes('connection')) {
          return;
        }
      }

      // Only log non-suppressed errors
      originalError(...args);
    };

    // Override console.warn
    console.warn = (...args: unknown[]) => {
      const message = String(args[0] || '');
      const fullMessage = args.map(arg => String(arg)).join(' ');
      
      // Suppress Base Account SDK warnings
      if (message.includes('Base Account SDK') || fullMessage.includes('Base Account SDK')) {
        return;
      }
      
      // Suppress Lit dev mode warnings
      if (message.includes('Lit is in dev mode') || fullMessage.includes('Lit is in dev mode')) {
        return;
      }
      
      originalWarn(...args);
    };

    // Catch unhandled errors
    const errorHandler = (event: ErrorEvent) => {
      const message = event.message || '';
      if (message.includes('Base Account SDK requires the Cross-Origin-Opener-Policy') ||
          message.includes('Analytics SDK') ||
          message.includes('ERR_BLOCKED_BY_RESPONSE') ||
          message.includes('NotSameOriginAfterDefaultedToSameOriginByCoep') ||
          message.includes('cca-lite.coinbase.com')) {
        event.preventDefault();
        return false;
      }
    };

    // Catch unhandled promise rejections
    const rejectionHandler = (event: PromiseRejectionEvent) => {
      const reason = String(event.reason || '');
      if (reason.includes('Base Account SDK') ||
          reason.includes('Analytics SDK') ||
          reason.includes('Failed to fetch') ||
          reason.includes('ERR_CONNECTION_CLOSED') ||
          reason.includes('ERR_BLOCKED_BY_RESPONSE') ||
          reason.includes('NotSameOriginAfterDefaultedToSameOriginByCoep') ||
          reason.includes('cca-lite.coinbase.com') ||
          reason.includes('relayer.testnet.zama.cloud')) {
        event.preventDefault();
        return false;
      }
    };

    // Catch resource loading errors
    const resourceErrorHandler = (event: Event) => {
      const target = event.target as HTMLElement;
      if (target && (target.tagName === 'SCRIPT' || target.tagName === 'LINK' || target.tagName === 'IMG')) {
        let url = '';
        if (target.tagName === 'SCRIPT') {
          url = (target as HTMLScriptElement).src || '';
        } else if (target.tagName === 'IMG') {
          url = (target as HTMLImageElement).src || '';
        } else if (target.tagName === 'LINK') {
          url = (target as HTMLLinkElement).href || '';
        }

        if (url.includes('cca-lite.coinbase.com') ||
            url.includes('relayer.testnet.zama.cloud')) {
          event.preventDefault();
          event.stopPropagation();
          return false;
        }
      }
    };

    window.addEventListener('error', errorHandler, true);
    window.addEventListener('unhandledrejection', rejectionHandler);
    window.addEventListener('error', resourceErrorHandler, true);

    return () => {
      // Restore original methods on cleanup
      console.error = originalError;
      console.warn = originalWarn;
      window.removeEventListener('error', errorHandler, true);
      window.removeEventListener('unhandledrejection', rejectionHandler);
      window.removeEventListener('error', resourceErrorHandler, true);
    };
  }, []);

  // No UI - silently suppress errors
  return null;
}

