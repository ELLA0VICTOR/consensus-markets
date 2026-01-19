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
      // ✅ FIX #1: Only fetch if client is ready AND we're not already loading
      if (!contractHook.client || !contractHook.isConnected || !contractHook.account || isLoadingBalance) {
        return;
      }

      try {
        setIsLoadingBalance(true);
        const bal = await contractHook.getUserBalance(contractHook.account.address);
        
        // ✅ FIX #2: Only update state if component is still mounted
        if (isMounted) {
          setBalance(bal);
        }
      } catch (err) {
        // ✅ FIX #3: Silent fail - don't spam console unless it's a real error
        if (isMounted && err.message && !err.message.includes('Server error')) {
          console.error('Error fetching balance:', err);
        }
      } finally {
        if (isMounted) {
          setIsLoadingBalance(false);
        }
      }
    };

    // ✅ FIX #4: Only start polling if client is connected
    if (contractHook.client && contractHook.isConnected && contractHook.account) {
      fetchBalance(); // Initial fetch
      
      // ✅ FIX #5: Longer interval (30 seconds instead of 5) to reduce spam
      interval = setInterval(fetchBalance, 30000);
    }

    // Cleanup
    return () => {
      isMounted = false;
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [contractHook.client, contractHook.isConnected, contractHook.account, isLoadingBalance]);

  if (!contractHook.isConnected) {
    return (
      <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
          <span className="text-gray-300">Connecting to GenLayer...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4">
      <div className="bg-gray-800 rounded-lg px-4 py-2 border border-gray-700">
        <div className="flex items-center gap-3">
          <div>
            <div className="text-xs text-gray-400">Play Balance</div>
            <div className="text-lg font-bold text-green-400">
              ${formatBalance(balance)}
            </div>
          </div>
        </div>
      </div>
      
      <WalletButton />
    </div>
  );
}