import { useState, useEffect, useCallback } from 'react';
import { createClient } from 'genlayer-js';
import { studionet } from 'genlayer-js/chains'; // ✅ FIXED: Using studionet for GenLayer Studio
import { CONTRACT_ADDRESS } from '../config/genlayer';
import { useWallet } from '../contexts/WalletContext';

export function useContract() {
  const { account, isConnected: walletConnected, walletType } = useWallet();
  const [client, setClient] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Initialize client when account changes
  useEffect(() => {
    const initClient = async () => {
      if (!account) {
        setClient(null);
        setIsConnected(false);
        return;
      }

      try {
        let cli;
        
        if (walletType === 'metamask') {
          // For MetaMask, we need to use the browser's provider
          // GenLayerJS will handle MetaMask signing automatically
          cli = createClient({
            chain: studionet, // ✅ FIXED: Using studionet for GenLayer Studio
            account: account.address, // Just pass the address for MetaMask
          });
        } else {
          // For auto-generated accounts, use the full account object with private key
          cli = createClient({
            chain: studionet, // ✅ FIXED: Using studionet for GenLayer Studio
            account: account, // Full account object with private key
          });
        }
        
        setClient(cli);
        setIsConnected(true);
        setError(null);
      } catch (err) {
        setError(err.message);
        console.error('Failed to initialize client:', err);
      }
    };

    initClient();
  }, [account, walletType]);

  // Read contract method
  const readContract = useCallback(async (functionName, args = []) => {
    if (!client) {
      throw new Error('Client not initialized');
    }

    try {
      const result = await client.readContract({
        address: CONTRACT_ADDRESS,
        functionName,
        args,
      });
      return result;
    } catch (err) {
      console.error(`Error reading ${functionName}:`, err);
      throw err;
    }
  }, [client]);

  // Write contract method
  const writeContract = useCallback(async (functionName, args = [], value = 0) => {
    if (!client) {
      throw new Error('Client not initialized');
    }

    setIsLoading(true);
    setError(null);

    try {
      const hash = await client.writeContract({
        address: CONTRACT_ADDRESS,
        functionName,
        args,
        value,
      });

      console.log('🔗 Transaction Hash:', hash);
      console.log('⏳ Waiting for finalization (this may take 60-90 seconds)...');

      const receipt = await client.waitForTransactionReceipt({
        hash,
        status: 'FINALIZED',
        interval: 5000, // Check every 5 seconds
        retries: 30,    // Try for up to 2.5 minutes (30 * 5s = 150s)
      });

      setIsLoading(false);
      return receipt;
    } catch (err) {
      setIsLoading(false);
      setError(err.message);
      console.error(`Error writing ${functionName}:`, err);
      throw err;
    }
  }, [client]);

  // Specific contract methods
  const getMarket = useCallback((marketId) => {
    return readContract('get_market', [marketId]);
  }, [readContract]);

  const getUserBalance = useCallback((address) => {
    return readContract('get_user_balance', [address]);
  }, [readContract]);

  const getMarketBets = useCallback((marketId) => {
    return readContract('get_market_bets', [marketId]);
  }, [readContract]);

  const getUserBets = useCallback((address) => {
    return readContract('get_user_bets', [address]);
  }, [readContract]);

  const getMarketCount = useCallback(() => {
    return readContract('get_market_count', []);
  }, [readContract]);

  const getDispute = useCallback((marketId) => {
    return readContract('get_dispute', [marketId]);
  }, [readContract]);

  const createMarket = useCallback((team1, team2, league, matchDate, resolutionUrl, generateOdds, fixtureId) => {
    return writeContract('create_market', [team1, team2, league, matchDate, resolutionUrl, generateOdds, fixtureId]);
  }, [writeContract]);

  const placeBet = useCallback((marketId, outcome, amount) => {
    return writeContract('place_bet', [marketId, outcome, amount]);
  }, [writeContract]);

  const resolveMarket = useCallback((marketId) => {
    return writeContract('resolve_market', [marketId]);
  }, [writeContract]);

  const disputeMarket = useCallback((marketId, claimedWinner, stake) => {
    return writeContract('dispute_market', [marketId, claimedWinner, stake]);
  }, [writeContract]);

  const claimWinnings = useCallback((marketId) => {
    return writeContract('claim_winnings', [marketId]);
  }, [writeContract]);

  return {
    client,
    account,
    walletType,
    isConnected,
    isLoading,
    error,
    // Read methods
    getMarket,
    getUserBalance,
    getMarketBets,
    getUserBets,
    getMarketCount,
    getDispute,
    // Write methods
    createMarket,
    placeBet,
    resolveMarket,
    disputeMarket,
    claimWinnings,
  };
}