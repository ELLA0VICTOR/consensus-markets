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
          className="group flex w-full max-w-full items-center justify-between gap-3 rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 transition-all duration-200 hover:border-white/20 hover:bg-white/10 sm:w-auto"
        >
          <div className="relative flex items-center justify-center">
            <div className="h-2 w-2 rounded-full bg-success animate-pulse-subtle" />
            <div className="absolute h-2 w-2 rounded-full bg-success opacity-75 animate-ping" />
          </div>

          <span className="max-w-[140px] truncate text-sm font-mono text-gray-300 transition-colors group-hover:text-white sm:max-w-none">
            {shortenAddress(account.address)}
          </span>

          <svg
            className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${showMenu ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {showMenu && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />

            <div className="absolute left-0 right-0 z-50 mt-2 overflow-hidden rounded-xl border border-white/10 bg-gray-950 shadow-2xl animate-scale-in sm:left-auto sm:right-0 sm:w-72">
              <div className="border-b border-white/10 p-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-xs font-medium uppercase tracking-wider text-gray-500">Address</span>
                    <span className="text-xs font-mono text-gray-300">{shortenAddress(account.address)}</span>
                  </div>
                </div>
              </div>

              <div className="p-2">
                <button
                  onClick={() => handleConnect('metamask')}
                  className="group flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left transition-all duration-200 hover:bg-white/5"
                >
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-white/5 transition-colors group-hover:bg-white/10">
                    <svg className="h-6 w-6" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                      <path fill="#E2761B" d="M29.5 2L18 10.5l2.2-5.2z" />
                      <path fill="#E4761B" d="M2.5 2l11.4 8.6L11.7 5.3z" />
                      <path fill="#D7C1B3" d="M25.3 22.8l-3.1 4.8 6.7 1.8 1.9-6.5z" />
                      <path fill="#233447" d="M1.2 23l1.9 6.5 6.7-1.8-3.1-4.8z" />
                    </svg>
                  </div>

                  <div className="flex-1">
                    <div className="text-sm font-medium text-white transition-colors group-hover:text-white">
                      Connect MetaMask
                    </div>
                    <div className="text-xs text-gray-400">Use your personal wallet</div>
                  </div>

                  <svg className="h-4 w-4 text-gray-500 transition-colors group-hover:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>

              {error && (
                <div className="border-t border-white/10 bg-error/10 p-3">
                  <p className="text-xs text-error">{error}</p>
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
          className="group flex w-full max-w-full items-center justify-between gap-3 rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 transition-all duration-200 hover:border-white/20 hover:bg-white/10 sm:w-auto"
        >
          <div className="flex h-6 w-6 items-center justify-center">
            <svg className="h-5 w-5" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
              <path fill="#E2761B" d="M29.5 2L18 10.5l2.2-5.2z" />
              <path fill="#E4761B" d="M2.5 2l11.4 8.6L11.7 5.3z" />
              <path fill="#D7C1B3" d="M25.3 22.8l-3.1 4.8 6.7 1.8 1.9-6.5z" />
              <path fill="#233447" d="M1.2 23l1.9 6.5 6.7-1.8-3.1-4.8z" />
            </svg>
          </div>

          <span className="max-w-[140px] truncate text-sm font-mono text-gray-300 transition-colors group-hover:text-white sm:max-w-none">
            {shortenAddress(account.address)}
          </span>

          <div className="relative flex items-center justify-center">
            <div className="h-2 w-2 rounded-full bg-success" />
          </div>

          <svg
            className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${showMenu ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {showMenu && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />

            <div className="absolute left-0 right-0 z-50 mt-2 overflow-hidden rounded-xl border border-white/10 bg-gray-950 shadow-2xl animate-scale-in sm:left-auto sm:right-0 sm:w-64">
              <div className="border-b border-white/10 p-4">
                <div className="mb-3 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5">
                    <svg className="h-5 w-5" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                      <path fill="#E2761B" d="M29.5 2L18 10.5l2.2-5.2z" />
                      <path fill="#E4761B" d="M2.5 2l11.4 8.6L11.7 5.3z" />
                      <path fill="#D7C1B3" d="M25.3 22.8l-3.1 4.8 6.7 1.8 1.9-6.5z" />
                      <path fill="#233447" d="M1.2 23l1.9 6.5 6.7-1.8-3.1-4.8z" />
                    </svg>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="mb-0.5 text-xs text-gray-500">Connected with MetaMask</p>
                    <p className="truncate text-sm font-mono text-white">{shortenAddress(account.address)}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 rounded-lg border border-success/30 bg-success/10 px-3 py-2">
                  <div className="h-2 w-2 rounded-full bg-success" />
                  <span className="text-xs font-medium text-success">Connected</span>
                </div>
              </div>

              <div className="p-2">
                <button
                  onClick={() => {
                    disconnect();
                    setShowMenu(false);
                  }}
                  className="group flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm text-error transition-all duration-200 hover:bg-error/10"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
