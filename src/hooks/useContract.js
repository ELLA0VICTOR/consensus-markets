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
          cli = createClient({
            chain: studionet,
            account: account.address,
          });
        } else {
          // For auto-generated accounts, use the full account object with private key
          cli = createClient({
            chain: studionet,
            account: account,
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
      
      // Convert GenLayer data structures to plain objects
      const converted = convertGenLayerData(result);
      
      return converted;
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
      setIsLoading(false);
      return receipt;
    } catch (err) {
      setIsLoading(false);
      setError(err.message);
      console.error(`❌ Error with ${functionName}:`, err);
      throw err;
    }
  }, [client]);

  // Specific contract methods with proper conversions
  const getMarket = useCallback(async (marketId) => {
    const result = await readContract('get_market', [marketId]);
    return convertMarket(result);
  }, [readContract]);

  const getUserBalance = useCallback(async (address) => {
    // Format address properly for contract
    const formattedAddress = formatAddressForContract(address);
    const result = await readContract('get_user_balance', [formattedAddress]);
    // Result is already converted by readContract, just ensure it's a number
    return Number(result);
  }, [readContract]);

  const getMarketBets = useCallback(async (marketId) => {
    const result = await readContract('get_market_bets', [marketId]);
    // Result is an array of bets
    if (Array.isArray(result)) {
      return result.map(bet => convertBet(bet));
    }
    return [];
  }, [readContract]);

  const getUserBets = useCallback(async (address) => {
    const formattedAddress = formatAddressForContract(address);
    const result = await readContract('get_user_bets', [formattedAddress]);
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