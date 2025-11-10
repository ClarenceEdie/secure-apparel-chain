// Filter out known non-critical errors from console
if (typeof window !== 'undefined') {
  const originalError = console.error;
  const originalWarn = console.warn;

  console.error = (...args: unknown[]) => {
    const message = String(args[0] ?? '');
    
    // Filter out Base Account SDK COOP warnings
    if (message.includes('Base Account SDK requires the Cross-Origin-Opener-Policy')) {
      return;
    }
    
    // Filter out Coinbase Analytics errors
    if (message.includes('Analytics SDK') || message.includes('cca-lite.coinbase.com')) {
      return;
    }
    
    // Filter out COEP blocked resource errors for Coinbase
    if (message.includes('NotSameOriginAfterDefaultedToSameOriginByCoep') && 
        message.includes('coinbase.com')) {
      return;
    }
    
    originalError.apply(console, args as Parameters<typeof console.error>);
  };

  console.warn = (...args: unknown[]) => {
    const message = String(args[0] ?? '');
    
    // Filter out Base Account SDK warnings
    if (message.includes('Base Account SDK')) {
      return;
    }
    
    originalWarn.apply(console, args as Parameters<typeof console.warn>);
  };
}

