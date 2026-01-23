// src/hooks/useContract.js
import { useState, useEffect, useCallback } from 'react';
import { createClient } from 'genlayer-js';
import { studionet } from 'genlayer-js/chains';
import { CONTRACT_ADDRESS } from '../config/genlayer';
import { useWallet } from '../contexts/WalletContext';
import { 
  convertGenLayerData, 
  convertMarket, 
  convertBet, 
  convertDispute,
  formatAddressForContract 
} from '../utils/genlayerUtils';

export function useContract() {
  const { account, isConnected: walletConnected, walletType } = useWallet();
  const [client, setClient] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // ✅ REMOVED: Local balance tracking - we'll fetch from contract
  const [userBalance, setUserBalance] = useState(null);
  const [balanceLoading, setBalanceLoading] = useState(false);

  // Initialize client when account changes
  useEffect(() => {
    const initClient = async () => {
      if (!account) {
        setClient(null);
        setIsConnected(false);
        setUserBalance(null);
        return;
      }

      try {
        let cli;
        
        if (walletType === 'metamask') {
          cli = createClient({
            chain: studionet,
            account: account.address,
          });
        } else {
          cli = createClient({
            chain: studionet,
            account: account,
          });
        }
        
        setClient(cli);
        setIsConnected(true);
        setError(null);
        
        console.log('✅ Client initialized');
      } catch (err) {
        setError(err.message);
        console.error('Failed to initialize client:', err);
      }
    };

    initClient();
  }, [account, walletType]);

  // ✅ NEW: Fetch balance from contract on mount and after transactions
  const fetchBalance = useCallback(async (address) => {
    if (!client || !address) {
      return null;
    }

    setBalanceLoading(true);
    try {
      const result = await client.readContract({
        address: CONTRACT_ADDRESS,
        functionName: 'get_user_balance',
        args: [address],
      });
      
      const balance = Number(convertGenLayerData(result));
      console.log(`💰 Fetched balance from contract: $${balance}`);
      setUserBalance(balance);
      return balance;
    } catch (err) {
      console.error('Error fetching balance:', err);
      // ✅ Better error handling - don't fail silently
      if (err.message && err.message.includes('502')) {
        console.warn('⚠️ 502 error - retrying in 2 seconds...');
        await new Promise(resolve => setTimeout(resolve, 2000));
        return fetchBalance(address); // Retry once
      }
      setError(err.message);
      return null;
    } finally {
      setBalanceLoading(false);
    }
  }, [client]);

  // ✅ Fetch balance when client or account changes
  useEffect(() => {
    if (client && account) {
      const address = walletType === 'metamask' ? account.address : account.address;
      fetchBalance(address);
    }
  }, [client, account, walletType, fetchBalance]);

  // Read contract method with automatic data conversion
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
      
      const converted = convertGenLayerData(result);
      return converted;
    } catch (err) {
      console.error(`Error reading ${functionName}:`, err);
      throw err;
    }
  }, [client]);

  // Write contract method with balance refresh
  const writeContract = useCallback(async (functionName, args = [], value = 0) => {
    if (!client) {
      throw new Error('Client not initialized');
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log(`📝 Calling ${functionName} with args:`, args);
      
      const hash = await client.writeContract({
        address: CONTRACT_ADDRESS,
        functionName,
        args,
        value,
      });

      console.log('✅ Transaction submitted!');
      console.log('🔗 Transaction Hash:', hash);
      console.log('⏳ Waiting for finalization (this may take 60-90 seconds)...');
      console.log('💡 Do not close this tab or refresh the page.');

      const receipt = await client.waitForTransactionReceipt({
        hash,
        status: 'FINALIZED',
        interval: 5000,
        retries: 30,
      });

      console.log('🎉 Transaction finalized!', receipt);
      
      // ✅ CRITICAL: Refresh balance from contract after any transaction
      const address = walletType === 'metamask' ? account.address : account.address;
      await fetchBalance(address);
      
      setIsLoading(false);
      return receipt;
    } catch (err) {
      setIsLoading(false);
      setError(err.message);
      console.error(`❌ Error with ${functionName}:`, err);
      throw err;
    }
  }, [client, account, walletType, fetchBalance]);

  // Specific contract methods
  const getMarket = useCallback(async (marketId) => {
    const result = await readContract('get_market', [marketId]);
    return convertMarket(result);
  }, [readContract]);

  const getUserBalance = useCallback(async (address) => {
    // ✅ FIXED: Call contract instead of returning local state
    return await fetchBalance(address);
  }, [fetchBalance]);

  const getMarketBets = useCallback(async (marketId) => {
    const result = await readContract('get_market_bets', [marketId]);
    if (Array.isArray(result)) {
      return result.map(bet => convertBet(bet));
    }
    return [];
  }, [readContract]);

  const getUserBets = useCallback(async (address) => {
    const result = await readContract('get_user_bets', [address]);
    if (Array.isArray(result)) {
      return result.map(bet => convertBet(bet));
    }
    return [];
  }, [readContract]);

  const getMarketCount = useCallback(async () => {
    const result = await readContract('get_market_count', []);
    return Number(result);
  }, [readContract]);

  const getDispute = useCallback(async (marketId) => {
    const result = await readContract('get_dispute', [marketId]);
    return convertDispute(result);
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

  const claimWinnings = useCallback(async (marketId) => {
    const receipt = await writeContract('claim_winnings', [marketId]);
    // ✅ Balance will auto-refresh after writeContract completes
    return receipt;
  }, [writeContract]);

  return {
    client,
    account,
    walletType,
    isConnected,
    isLoading,
    balanceLoading, // ✅ NEW: Separate loading state for balance
    error,
    userBalance, // ✅ Now comes from contract, not hardcoded
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