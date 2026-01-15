import { createContext, useContext, useState, useEffect } from 'react';
import { createAccount } from 'genlayer-js';

const WalletContext = createContext(null);

// GenLayer network configurations
const GENLAYER_NETWORKS = {
  STUDIO: {
    chainId: '0xf22f', // 61999 in decimal
    chainName: 'GenLayer Studio',
    rpcUrls: ['https://studio.genlayer.com/api'],
    nativeCurrency: {
      name: 'GEN',
      symbol: 'GEN',
      decimals: 18
    },
  },
  TESTNET: {
    chainId: '0x107d', // 4221 in decimal
    chainName: 'GenLayer Asimov Testnet',
    rpcUrls: ['https://genlayer-testnet.rpc.caldera.xyz/http'],
    nativeCurrency: {
      name: 'GEN',
      symbol: 'GEN',
      decimals: 18
    },
    blockExplorerUrls: ['https://genlayer-testnet.explorer.caldera.xyz']
  }
};

// Use Studio by default (change to TESTNET if needed)
const ACTIVE_NETWORK = GENLAYER_NETWORKS.STUDIO;

export function WalletProvider({ children }) {
  const [account, setAccount] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [walletType, setWalletType] = useState(null);
  const [error, setError] = useState(null);

  // Auto-connect with generated account on mount
  useEffect(() => {
    connectAutoAccount();
  }, []);

  // Handle MetaMask account changes
  useEffect(() => {
    if (window.ethereum && walletType === 'metamask') {
      const handleAccountsChanged = (accounts) => {
        if (accounts.length === 0) {
          disconnect();
        } else {
          const metaMaskAccount = {
            address: accounts[0],
            type: 'metamask'
          };
          setAccount(metaMaskAccount);
        }
      };

      const handleChainChanged = () => {
        window.location.reload();
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);

      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, [walletType]);

  const connectAutoAccount = () => {
    try {
      // Create full account object with private key
      const autoAccount = createAccount();
      console.log('Auto account created:', autoAccount.address);
      
      setAccount(autoAccount); // Store the FULL account object
      setIsConnected(true);
      setWalletType('auto');
      setError(null);
    } catch (err) {
      console.error('Failed to create auto account:', err);
      setError('Failed to create account');
    }
  };

  const switchToGenLayerNetwork = async () => {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: ACTIVE_NETWORK.chainId }],
      });
      return true;
    } catch (switchError) {
      // Network not added to MetaMask
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [ACTIVE_NETWORK],
          });
          return true;
        } catch (addError) {
          console.error('Failed to add GenLayer network:', addError);
          return false;
        }
      }
      console.error('Failed to switch network:', switchError);
      return false;
    }
  };

  const connectMetaMask = async () => {
    try {
      if (!window.ethereum) {
        setError('MetaMask not installed. Please install MetaMask extension.');
        return false;
      }

      // First, switch to GenLayer network
      const networkSwitched = await switchToGenLayerNetwork();
      if (!networkSwitched) {
        setError(`Please switch to ${ACTIVE_NETWORK.chainName} network in MetaMask`);
        return false;
      }

      // Request account access
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      });

      if (accounts.length > 0) {
        // For MetaMask, we only have the address
        // The signing will be handled by MetaMask's provider
        const metaMaskAccount = {
          address: accounts[0],
          type: 'metamask'
        };
        
        setAccount(metaMaskAccount);
        setIsConnected(true);
        setWalletType('metamask');
        setError(null);
        return true;
      }
    } catch (err) {
      console.error('MetaMask connection error:', err);
      if (err.code === 4001) {
        setError('Connection rejected by user');
      } else {
        setError(err.message || 'Failed to connect MetaMask');
      }
      return false;
    }
  };

  const connectWalletConnect = async () => {
    setError('WalletConnect integration coming soon');
    return false;
  };

  const disconnect = () => {
    setAccount(null);
    setIsConnected(false);
    setWalletType(null);
    setError(null);
    
    // Reconnect auto account after disconnect
    setTimeout(() => {
      connectAutoAccount();
    }, 100);
  };

  const value = {
    account,
    isConnected,
    walletType,
    error,
    connectMetaMask,
    connectWalletConnect,
    disconnect,
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within WalletProvider');
  }
  return context;
}