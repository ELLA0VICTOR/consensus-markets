import { useState, useEffect } from 'react';

export function useFixtures() {
  const [fixtures, setFixtures] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFixtures = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/fixtures.json');
        
        if (!response.ok) {
          throw new Error('Failed to fetch fixtures');
        }
        
        const data = await response.json();
        
        // Sort by date (upcoming first)
        const sortedFixtures = data.sort((a, b) => {
          return new Date(a.date) - new Date(b.date);
        });
        
        setFixtures(sortedFixtures);
        setError(null);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching fixtures:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFixtures();
  }, []);

  // Filter fixtures by sport
  const getFixturesBySport = (sport) => {
    return fixtures.filter(f => f.sport === sport);
  };

  // Filter fixtures by league
  const getFixturesByLeague = (league) => {
    return fixtures.filter(f => f.league === league);
  };

  // Get upcoming fixtures (after current date)
  const getUpcomingFixtures = () => {
    const now = new Date();
    return fixtures.filter(f => new Date(f.date) > now);
  };

  // Get past fixtures
  const getPastFixtures = () => {
    const now = new Date();
    return fixtures.filter(f => new Date(f.date) <= now);
  };

  return {
    fixtures,
    isLoading,
    error,
    getFixturesBySport,
    getFixturesByLeague,
    getUpcomingFixtures,
    getPastFixtures,
  };
}