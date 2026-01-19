// src/hooks/useMarkets.js
import { useState, useEffect, useCallback } from 'react';

export function useMarkets(contractHook) {
  const [markets, setMarkets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMarkets = useCallback(async () => {
    // Wait until contract client is initialized
    if (!contractHook.client || !contractHook.isConnected) {
      return;
    }

    try {
      setIsLoading(true);
      
      const count = await contractHook.getMarketCount();
      console.log(`📊 Fetching ${count} market(s) from contract...`);
      
      const allMarkets = [];

      for (let i = 0; i < count; i++) {
        try {
          const market = await contractHook.getMarket(i);
          
          console.log(`Market ${i} fetched:`, market);
          
          // Validate that market has valid data
          // Check if market has team names (not empty market)
          const isValidMarket = market 
            && typeof market === 'object'
            && market.team1 
            && market.team1 !== '' 
            && market.team2 
            && market.team2 !== '';
          
          if (isValidMarket) {
            console.log(`✅ Market ${i} is valid, adding to list`);
            allMarkets.push(market);
          } else {
            console.log(`⚠️ Market ${i} is empty/invalid, skipping`, {
              hasMarket: !!market,
              isObject: typeof market === 'object',
              team1: market?.team1,
              team2: market?.team2,
            });
          }
        } catch (err) {
          console.error(`❌ Error fetching market ${i}:`, err);
        }
      }

      console.log(`✅ Successfully fetched ${allMarkets.length} valid markets`);
      setMarkets(allMarkets);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('❌ Error fetching markets:', err);
    } finally {
      setIsLoading(false);
    }
  }, [contractHook]);

  // Initial fetch - wait for contract client to be ready
  useEffect(() => {
    if (contractHook.client && contractHook.isConnected) {
      console.log('🔄 Contract ready, fetching markets...');
      fetchMarkets();
    }
  }, [fetchMarkets, contractHook.client, contractHook.isConnected]);

  // Filter markets by status
  const getMarketsByStatus = useCallback((status) => {
    return markets.filter(m => m.status === status);
  }, [markets]);

  // Get open markets
  const getOpenMarkets = useCallback(() => {
    return getMarketsByStatus('open');
  }, [getMarketsByStatus]);

  // Get resolved markets
  const getResolvedMarkets = useCallback(() => {
    return getMarketsByStatus('resolved');
  }, [getMarketsByStatus]);

  // Get disputed markets
  const getDisputedMarkets = useCallback(() => {
    return getMarketsByStatus('disputed');
  }, [getMarketsByStatus]);

  // Get market by ID
  const getMarketById = useCallback((id) => {
    return markets.find(m => m.id === id);
  }, [markets]);

  // Refresh markets manually
  const refreshMarkets = useCallback(() => {
    console.log('🔄 Manual refresh triggered');
    return fetchMarkets();
  }, [fetchMarkets]);

  return {
    markets,
    isLoading,
    error,
    getMarketsByStatus,
    getOpenMarkets,
    getResolvedMarkets,
    getDisputedMarkets,
    getMarketById,
    refreshMarkets,
  };
}