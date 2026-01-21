// src/hooks/useMarkets.js
import { useState, useEffect, useCallback, useRef } from 'react';

export function useMarkets(contractHook) {
  const [markets, setMarkets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const isFetchingRef = useRef(false);
  const fetchTimeoutRef = useRef(null);

  const fetchMarkets = useCallback(async (forceRefresh = false) => {
    // Prevent concurrent fetches unless forced
    if (isFetchingRef.current && !forceRefresh) {
      console.log('⏭️ Skipping fetch - already in progress');
      return;
    }

    // Wait until contract client is initialized
    if (!contractHook.client || !contractHook.isConnected) {
      console.log('⏭️ Skipping fetch - contract not ready');
      return;
    }

    try {
      isFetchingRef.current = true;
      setIsLoading(true);
      
      const count = await contractHook.getMarketCount();
      console.log(`📊 Fetching ${count} market(s) from contract...`);
      
      const allMarkets = [];

      for (let i = 0; i < count; i++) {
        try {
          const market = await contractHook.getMarket(i);
          
          // Validate that market has valid data
          const isValidMarket = market 
            && typeof market === 'object'
            && market.team1 
            && market.team1 !== '' 
            && market.team2 
            && market.team2 !== '';
          
          if (isValidMarket) {
            console.log(`✅ Market ${i} added:`, market.team1, 'vs', market.team2);
            allMarkets.push(market);
          } else {
            console.log(`⚠️ Market ${i} skipped (empty/invalid)`);
          }
        } catch (err) {
          console.error(`❌ Error fetching market ${i}:`, err);
        }
      }

      console.log(`✅ Total valid markets fetched: ${allMarkets.length}`);
      setMarkets(allMarkets);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('❌ Error fetching markets:', err);
    } finally {
      setIsLoading(false);
      isFetchingRef.current = false;
    }
  }, [contractHook]);

  // Initial fetch when contract becomes ready
  useEffect(() => {
    if (contractHook.client && contractHook.isConnected) {
      console.log('🔄 Contract ready, fetching markets...');
      fetchMarkets();
    }
  }, [contractHook.client, contractHook.isConnected]); // FIXED: Removed function dependencies

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

  // Refresh markets manually with delay for contract state propagation
  const refreshMarkets = useCallback(async (delayMs = 2000) => {
    console.log(`🔄 Manual refresh triggered (waiting ${delayMs}ms for contract state)...`);
    
    // Clear any pending refresh
    if (fetchTimeoutRef.current) {
      clearTimeout(fetchTimeoutRef.current);
    }
    
    // Wait for contract state to propagate
    return new Promise((resolve) => {
      fetchTimeoutRef.current = setTimeout(async () => {
        await fetchMarkets(true); // Force refresh
        resolve();
      }, delayMs);
    });
  }, [fetchMarkets]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
      }
    };
  }, []);

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