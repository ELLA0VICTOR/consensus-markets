import { useState, useEffect } from 'react';
import { formatBalance } from '../utils/formatting';
import { WalletButton } from './WalletButton';

export function WalletConnect({ contractHook }) {
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    const fetchBalance = async () => {
      if (contractHook.isConnected && contractHook.account) {
        try {
          const bal = await contractHook.getUserBalance(contractHook.account.address);
          setBalance(bal);
        } catch (err) {
          console.error('Error fetching balance:', err);
        }
      }
    };

    fetchBalance();

    // Refresh balance every 5 seconds
    const interval = setInterval(fetchBalance, 5000);
    return () => clearInterval(interval);
  }, [contractHook]);

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