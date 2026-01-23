import { useState, useEffect } from 'react';
import { formatBalance } from '../utils/formatting';
import { WalletButton } from './WalletButton';

export function WalletConnect({ contractHook }) {
  const [balance, setBalance] = useState(0);
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);

  useEffect(() => {
    let isMounted = true;
    let interval;

    const fetchBalance = async () => {
      // Use the userBalance from contractHook if available (auto-updated)
      if (contractHook.userBalance !== null && contractHook.userBalance !== undefined) {
        if (isMounted) {
          setBalance(contractHook.userBalance);
        }
        return;
      }

      // Fallback: fetch manually if not available
      if (!contractHook.client || !contractHook.isConnected || !contractHook.account || isLoadingBalance) {
        return;
      }

      try {
        setIsLoadingBalance(true);
        const bal = await contractHook.getUserBalance(contractHook.account.address);
        
        if (isMounted) {
          setBalance(bal);
        }
      } catch (err) {
        if (isMounted && err.message && !err.message.includes('Server error')) {
          console.error('Error fetching balance:', err);
        }
      } finally {
        if (isMounted) {
          setIsLoadingBalance(false);
        }
      }
    };

    // Check for auto-updated balance from hook
    if (contractHook.userBalance !== null && contractHook.userBalance !== undefined) {
      setBalance(contractHook.userBalance);
    }

    if (contractHook.client && contractHook.isConnected && contractHook.account) {
      fetchBalance();
      interval = setInterval(fetchBalance, 30000);
    }

    return () => {
      isMounted = false;
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [contractHook.client, contractHook.isConnected, contractHook.account, contractHook.userBalance, isLoadingBalance]);

  // Connecting State
  if (!contractHook.isConnected) {
    return (
      <div className="glass-card rounded-lg px-5 py-3.5 border border-white/10">
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center">
            <div className="w-2 h-2 bg-warning rounded-full animate-pulse-subtle" />
            <div className="absolute w-2 h-2 bg-warning rounded-full animate-ping opacity-75" />
          </div>
          <div>
            <p className="text-sm font-medium text-white">Connecting to GenLayer</p>
            <p className="text-xs text-gray-500 font-mono">Please wait...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      {/* Balance Display */}
      <div className="glass-card rounded-lg px-5 py-3 border border-white/10 min-w-[140px]">
        <div className="flex items-center gap-3">
          {/* Currency Icon */}
          <div className="w-8 h-8 rounded-lg bg-success/10 flex items-center justify-center flex-shrink-0">
            <svg className="w-4 h-4 text-success" fill="currentColor" viewBox="0 0 20 20">
              <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
            </svg>
          </div>
          
          {/* Balance Info */}
          <div className="flex-1 min-w-0">
            <div className="text-[10px] uppercase tracking-wider text-gray-500 font-medium mb-0.5">
              Play Balance
            </div>
            <div className="text-lg font-bold font-mono text-success leading-tight">
              ${formatBalance(balance)}
            </div>
          </div>
        </div>
      </div>
      
      {/* Wallet Button */}
      <WalletButton />
    </div>
  );
}