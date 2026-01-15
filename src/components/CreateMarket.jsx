import { useState } from 'react';

export function CreateMarket({ contractHook, onMarketCreated, selectedFixture }) {
  const [formData, setFormData] = useState({
    team1: selectedFixture?.team1 || '',
    team2: selectedFixture?.team2 || '',
    league: selectedFixture?.league || '',
    matchDate: selectedFixture?.date || '',
    resolutionUrl: selectedFixture?.resolution_url || '',
    generateOdds: true,
    fixtureId: selectedFixture?.id || '',
  });
  
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.team1 || !formData.team2) {
      setError('Both teams are required');
      return;
    }
    
    if (!formData.league) {
      setError('League is required');
      return;
    }
    
    if (!formData.matchDate) {
      setError('Match date is required');
      return;
    }
    
    if (!formData.resolutionUrl) {
      setError('Resolution URL is required');
      return;
    }

    setIsCreating(true);
    setError('');

    try {
      await contractHook.createMarket(
        formData.team1,
        formData.team2,
        formData.league,
        formData.matchDate,
        formData.resolutionUrl,
        formData.generateOdds,
        formData.fixtureId
      );
      
      // Reset form
      setFormData({
        team1: '',
        team2: '',
        league: '',
        matchDate: '',
        resolutionUrl: '',
        generateOdds: true,
        fixtureId: '',
      });
      
      if (onMarketCreated) {
        onMarketCreated();
      }
    } catch (err) {
      setError(err.message || 'Failed to create market');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
      <h2 className="text-2xl font-bold text-white mb-6">Create New Market</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Team 1 */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Team 1
          </label>
          <input
            type="text"
            name="team1"
            value={formData.team1}
            onChange={handleChange}
            placeholder="Enter team 1 name"
            className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
            disabled={isCreating}
          />
        </div>

        {/* Team 2 */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Team 2
          </label>
          <input
            type="text"
            name="team2"
            value={formData.team2}
            onChange={handleChange}
            placeholder="Enter team 2 name"
            className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
            disabled={isCreating}
          />
        </div>

        {/* League */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            League
          </label>
          <input
            type="text"
            name="league"
            value={formData.league}
            onChange={handleChange}
            placeholder="e.g., English Premier League"
            className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
            disabled={isCreating}
          />
        </div>

        {/* Match Date */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Match Date
          </label>
          <input
            type="datetime-local"
            name="matchDate"
            value={formData.matchDate ? new Date(formData.matchDate).toISOString().slice(0, 16) : ''}
            onChange={(e) => {
              const isoDate = new Date(e.target.value).toISOString();
              setFormData(prev => ({ ...prev, matchDate: isoDate }));
            }}
            className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
            disabled={isCreating}
          />
        </div>

        {/* Resolution URL */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Resolution URL
          </label>
          <input
            type="url"
            name="resolutionUrl"
            value={formData.resolutionUrl}
            onChange={handleChange}
            placeholder="https://www.bbc.com/sport/football/scores-fixtures/2025-01-18"
            className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
            disabled={isCreating}
          />
          <p className="mt-1 text-xs text-gray-500">
            URL where the match result can be verified (e.g., BBC Sport)
          </p>
        </div>

        {/* Generate Odds Checkbox */}
        <div className="flex items-center">
          <input
            type="checkbox"
            name="generateOdds"
            checked={formData.generateOdds}
            onChange={handleChange}
            className="w-4 h-4 text-blue-600 bg-gray-900 border-gray-700 rounded focus:ring-blue-500"
            disabled={isCreating}
          />
          <label className="ml-2 text-sm text-gray-300">
            Generate odds using AI (recommended)
          </label>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-3 bg-red-500/20 border border-red-500 rounded-lg text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isCreating}
          className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
        >
          {isCreating ? 'Creating Market...' : 'Create Market'}
        </button>
      </form>
    </div>
  );
}