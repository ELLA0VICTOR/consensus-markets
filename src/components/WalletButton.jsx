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

  // Auto Wallet (Temporary Account)
  if (walletType === 'auto') {
    return (
      <div className="relative">
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="group flex items-center gap-3 px-4 py-2.5 rounded-lg
                   bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20
                   transition-all duration-200"
        >
          {/* Status Indicator */}
          <div className="relative flex items-center justify-center">
            <div className="w-2 h-2 bg-success rounded-full animate-pulse-subtle" />
            <div className="absolute w-2 h-2 bg-success rounded-full animate-ping opacity-75" />
          </div>
          
          {/* Address */}
          <span className="text-sm font-mono text-gray-300 group-hover:text-white transition-colors">
            {shortenAddress(account.address)}
          </span>
          
          {/* Badge */}
          <span className="px-2 py-0.5 rounded bg-warning/10 border border-warning/30 text-[10px] text-warning font-medium uppercase tracking-wide">
            Temp
          </span>
          
          {/* Chevron */}
          <svg className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${showMenu ? 'rotate-180' : ''}`} 
               fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* Dropdown Menu */}
        {showMenu && (
          <>
            {/* Backdrop */}
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => setShowMenu(false)}
            />
            
            {/* Menu */}
            <div className="absolute right-0 mt-2 w-72 bg-gray-950 border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden animate-scale-in">
              
              
              {/* Account Info */}
              <div className="p-4 border-b border-white/10">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs uppercase tracking-wider text-gray-500 font-medium">Address</span>
                    <span className="text-xs font-mono text-gray-300">{shortenAddress(account.address)}</span>
                  </div>
                </div>
              </div>
              
              {/* Connect MetaMask Option */}
              <div className="p-2">
                <button
                  onClick={() => handleConnect('metamask')}
                  className="w-full flex items-center gap-3 px-3 py-3 hover:bg-white/5 rounded-lg transition-all duration-200 text-left group"
                >
                  {/* MetaMask Icon */}
                  <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0 group-hover:bg-white/10 transition-colors">
                    <svg className="w-6 h-6" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                      <path fill="#E2761B" d="M29.5 2L18 10.5l2.2-5.2z"/>
                      <path fill="#E4761B" d="M2.5 2l11.4 8.6L11.7 5.3z"/>
                      <path fill="#D7C1B3" d="M25.3 22.8l-3.1 4.8 6.7 1.8 1.9-6.5z"/>
                      <path fill="#233447" d="M1.2 23l1.9 6.5 6.7-1.8-3.1-4.8z"/>
                    </svg>
                  </div>
                  
                  <div className="flex-1">
                    <div className="text-sm font-medium text-white group-hover:text-white transition-colors">
                      Connect MetaMask
                    </div>
                    <div className="text-xs text-gray-400">
                      Use your personal wallet
                    </div>
                  </div>
                  
                  <svg className="w-4 h-4 text-gray-500 group-hover:text-gray-300 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>

              {/* Error Display */}
              {error && (
                <div className="p-3 border-t border-white/10 bg-error/10">
                  <p className="text-xs text-error">{error}</p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    );
  }

  // MetaMask Wallet
  if (walletType === 'metamask') {
    return (
      <div className="relative">
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="group flex items-center gap-3 px-4 py-2.5 rounded-lg
                   bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20
                   transition-all duration-200"
        >
          {/* MetaMask Icon */}
          <div className="w-6 h-6 flex items-center justify-center">
            <svg className="w-5 h-5" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
              <path fill="#E2761B" d="M29.5 2L18 10.5l2.2-5.2z"/>
              <path fill="#E4761B" d="M2.5 2l11.4 8.6L11.7 5.3z"/>
              <path fill="#D7C1B3" d="M25.3 22.8l-3.1 4.8 6.7 1.8 1.9-6.5z"/>
              <path fill="#233447" d="M1.2 23l1.9 6.5 6.7-1.8-3.1-4.8z"/>
            </svg>
          </div>
          
          {/* Address */}
          <span className="text-sm font-mono text-gray-300 group-hover:text-white transition-colors">
            {shortenAddress(account.address)}
          </span>
          
          {/* Status Indicator */}
          <div className="relative flex items-center justify-center">
            <div className="w-2 h-2 bg-success rounded-full" />
          </div>
          
          {/* Chevron */}
          <svg className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${showMenu ? 'rotate-180' : ''}`} 
               fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* Dropdown Menu */}
        {showMenu && (
          <>
            {/* Backdrop */}
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => setShowMenu(false)}
            />
            
            {/* Menu */}
            <div className="absolute right-0 mt-2 w-64 bg-gray-950 border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden animate-scale-in">
              {/* Account Info */}
              <div className="p-4 border-b border-white/10">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
                    <svg className="w-5 h-5" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                      <path fill="#E2761B" d="M29.5 2L18 10.5l2.2-5.2z"/>
                      <path fill="#E4761B" d="M2.5 2l11.4 8.6L11.7 5.3z"/>
                      <path fill="#D7C1B3" d="M25.3 22.8l-3.1 4.8 6.7 1.8 1.9-6.5z"/>
                      <path fill="#233447" d="M1.2 23l1.9 6.5 6.7-1.8-3.1-4.8z"/>
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-500 mb-0.5">Connected with MetaMask</p>
                    <p className="text-sm font-mono text-white truncate">{shortenAddress(account.address)}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-success/10 border border-success/30">
                  <div className="w-2 h-2 bg-success rounded-full" />
                  <span className="text-xs text-success font-medium">Connected</span>
                </div>
              </div>
              
              {/* Actions */}
              <div className="p-2">
                <button
                  onClick={() => {
                    disconnect();
                    setShowMenu(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-left text-error hover:bg-error/10 rounded-lg transition-all duration-200 group"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span className="font-medium">Disconnect</span>
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