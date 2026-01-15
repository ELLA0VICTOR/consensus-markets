import { useState } from 'react';
import { useWallet } from '../contexts/WalletContext';
import { shortenAddress } from '../utils/formatting';

export function WalletButton() {
  const { account, walletType, error, connectMetaMask, disconnect } = useWallet();
  const [showMenu, setShowMenu] = useState(false);

  const handleConnect = async (type) => {
    if (type === 'metamask') {
      await connectMetaMask();
    }
    setShowMenu(false);
  };

  if (walletType === 'auto') {
    return (
      <div className="relative">
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg transition-colors"
        >
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span className="text-sm font-mono text-gray-300">
            {shortenAddress(account.address)}
          </span>
          <span className="text-xs text-gray-500">(Auto)</span>
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {showMenu && (
          <>
            <div 
              className="fixed inset-0 z-10" 
              onClick={() => setShowMenu(false)}
            />
            <div className="absolute right-0 mt-2 w-64 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-20">
              <div className="p-3 border-b border-gray-700">
                <p className="text-xs text-gray-400 mb-2">
                  Using temporary auto-generated account
                </p>
                <p className="text-xs text-yellow-400">
                  ⚠️ Account resets on page refresh
                </p>
              </div>
              
              <div className="p-2">
                <button
                  onClick={() => handleConnect('metamask')}
                  className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-700 rounded-lg transition-colors text-left"
                >
                  <img 
                    src="data:image/svg+xml,%3Csvg width='32' height='32' viewBox='0 0 32 32' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath fill='%23E2761B' d='M29.5 2L18 10.5l2.2-5.2z'/%3E%3Cpath fill='%23E4761B' d='M2.5 2l11.4 8.6L11.7 5.3z'/%3E%3Cpath fill='%23D7C1B3' d='M25.3 22.8l-3.1 4.8 6.7 1.8 1.9-6.5z'/%3E%3Cpath fill='%23233447' d='M1.2 23l1.9 6.5 6.7-1.8-3.1-4.8z'/%3E%3C/svg%3E"
                    alt="MetaMask"
                    className="w-6 h-6"
                  />
                  <div>
                    <div className="text-sm font-medium text-white">Connect MetaMask</div>
                    <div className="text-xs text-gray-400">Use your own wallet</div>
                  </div>
                </button>
              </div>

              {error && (
                <div className="p-2 border-t border-gray-700">
                  <p className="text-xs text-red-400">{error}</p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    );
  }

  if (walletType === 'metamask') {
    return (
      <div className="relative">
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg transition-colors"
        >
          <img 
            src="data:image/svg+xml,%3Csvg width='32' height='32' viewBox='0 0 32 32' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath fill='%23E2761B' d='M29.5 2L18 10.5l2.2-5.2z'/%3E%3Cpath fill='%23E4761B' d='M2.5 2l11.4 8.6L11.7 5.3z'/%3E%3Cpath fill='%23D7C1B3' d='M25.3 22.8l-3.1 4.8 6.7 1.8 1.9-6.5z'/%3E%3Cpath fill='%23233447' d='M1.2 23l1.9 6.5 6.7-1.8-3.1-4.8z'/%3E%3C/svg%3E"
            alt="MetaMask"
            className="w-5 h-5"
          />
          <span className="text-sm font-mono text-gray-300">
            {shortenAddress(account.address)}
          </span>
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {showMenu && (
          <>
            <div 
              className="fixed inset-0 z-10" 
              onClick={() => setShowMenu(false)}
            />
            <div className="absolute right-0 mt-2 w-56 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-20">
              <div className="p-3 border-b border-gray-700">
                <p className="text-xs text-gray-400 mb-1">Connected with MetaMask</p>
                <p className="text-xs font-mono text-gray-300">{shortenAddress(account.address)}</p>
              </div>
              
              <div className="p-2">
                <button
                  onClick={() => {
                    disconnect();
                    setShowMenu(false);
                  }}
                  className="w-full px-3 py-2 text-sm text-left text-red-400 hover:bg-gray-700 rounded-lg transition-colors"
                >
                  Disconnect
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    );
  }

  return null;
}