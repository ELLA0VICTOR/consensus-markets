import { useState, useEffect, useCallback } from 'react';

export function useMarkets(contractHook) {
  const [markets, setMarkets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMarkets = useCallback(async () => {
    if (!contractHook.isConnected) {
      return;
    }

    try {
      setIsLoading(true);
      const count = await contractHook.getMarketCount();
      const allMarkets = [];

      for (let i = 0; i < count; i++) {
        try {
          const market = await contractHook.getMarket(i);
          if (market && market.team1) {
            allMarkets.push(market);
          }
        } catch (err) {
          console.error(`Error fetching market ${i}:`, err);
        }
      }

      setMarkets(allMarkets);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching markets:', err);
    } finally {
      setIsLoading(false);
    }
  }, [contractHook]);

  // Initial fetch
  useEffect(() => {
    fetchMarkets();
  }, [fetchMarkets]);

  // Poll for updates every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchMarkets();
    }, 10000);

    return () => clearInterval(interval);
  }, [fetchMarkets]);

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