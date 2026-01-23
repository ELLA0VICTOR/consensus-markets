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
  const [success, setSuccess] = useState('');

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
    setSuccess('');

    try {
      const receipt = await contractHook.createMarket(
        formData.team1,
        formData.team2,
        formData.league,
        formData.matchDate,
        formData.resolutionUrl,
        formData.generateOdds,
        formData.fixtureId
      );
      
      setSuccess('Market created successfully! Refreshing...');
      
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
      
      // Trigger refresh after delay
      if (onMarketCreated) {
        await onMarketCreated();
      }
      
    } catch (err) {
      setError(err.message || 'Failed to create market');
    } finally {
      setIsCreating(false);
    }
  };

  const isFormValid = formData.team1 && formData.team2 && formData.league && formData.matchDate && formData.resolutionUrl;

  return (
    <div className="glass-card rounded-xl p-8 border border-white/10">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Create New Market</h2>
        </div>
        <p className="text-sm text-gray-400 ml-13">
          {selectedFixture ? 'Pre-filled from selected fixture' : 'Enter match details manually'}
        </p>
      </div>

      {/* Selected Fixture Badge */}
      {selectedFixture && (
        <div className="mb-6 p-4 rounded-xl bg-info/10 border border-info/30 animate-scale-in">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-info flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <div className="flex-1">
              <p className="text-sm font-medium text-info mb-1">Fixture Selected</p>
              <p className="text-xs text-info/70">
                {selectedFixture.team1} vs {selectedFixture.team2} • {selectedFixture.league}
              </p>
            </div>
          </div>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Teams Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Team 1 */}
          <div>
            <label className="block text-xs uppercase tracking-wider text-gray-500 font-medium mb-3">
              Home Team
            </label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              </div>
              <input
                type="text"
                name="team1"
                value={formData.team1}
                onChange={handleChange}
                placeholder="e.g., Manchester United"
                className="w-full pl-12 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-lg 
                         text-white placeholder-gray-600
                         focus:outline-none focus:border-white/30 focus:bg-white/10
                         transition-all duration-200"
                disabled={isCreating}
              />
            </div>
          </div>

          {/* Team 2 */}
          <div>
            <label className="block text-xs uppercase tracking-wider text-gray-500 font-medium mb-3">
              Away Team
            </label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <input
                type="text"
                name="team2"
                value={formData.team2}
                onChange={handleChange}
                placeholder="e.g., Liverpool"
                className="w-full pl-12 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-lg 
                         text-white placeholder-gray-600
                         focus:outline-none focus:border-white/30 focus:bg-white/10
                         transition-all duration-200"
                disabled={isCreating}
              />
            </div>
          </div>
        </div>

        {/* League */}
        <div>
          <label className="block text-xs uppercase tracking-wider text-gray-500 font-medium mb-3">
            League / Competition
          </label>
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
              </svg>
            </div>
            <input
              type="text"
              name="league"
              value={formData.league}
              onChange={handleChange}
              placeholder="e.g., English Premier League"
              className="w-full pl-12 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-lg 
                       text-white placeholder-gray-600
                       focus:outline-none focus:border-white/30 focus:bg-white/10
                       transition-all duration-200"
              disabled={isCreating}
            />
          </div>
        </div>

        {/* Match Date */}
        <div>
          <label className="block text-xs uppercase tracking-wider text-gray-500 font-medium mb-3">
            Match Date & Time
          </label>
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <input
              type="datetime-local"
              name="matchDate"
              value={formData.matchDate ? new Date(formData.matchDate).toISOString().slice(0, 16) : ''}
              onChange={(e) => {
                const isoDate = new Date(e.target.value).toISOString();
                setFormData(prev => ({ ...prev, matchDate: isoDate }));
              }}
              className="w-full pl-12 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-lg 
                       text-white
                       focus:outline-none focus:border-white/30 focus:bg-white/10
                       transition-all duration-200"
              disabled={isCreating}
            />
          </div>
        </div>

        {/* Resolution URL */}
        <div>
          <label className="block text-xs uppercase tracking-wider text-gray-500 font-medium mb-3">
            Resolution Source URL
          </label>
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
            </div>
            <input
              type="url"
              name="resolutionUrl"
              value={formData.resolutionUrl}
              onChange={handleChange}
              placeholder="https://www.bbc.com/sport/football/..."
              className="w-full pl-12 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-lg 
                       text-white placeholder-gray-600
                       focus:outline-none focus:border-white/30 focus:bg-white/10
                       transition-all duration-200"
              disabled={isCreating}
            />
          </div>
          <p className="mt-2 text-xs text-gray-500 leading-relaxed">
            URL where AI can verify the match result (e.g., BBC Sport, ESPN)
          </p>
        </div>

        {/* AI Odds Toggle */}
        <div className="p-4 rounded-xl bg-white/5 border border-white/10">
          <label className="flex items-start gap-3 cursor-pointer group">
            <div className="relative flex items-center justify-center mt-0.5">
              <input
                type="checkbox"
                name="generateOdds"
                checked={formData.generateOdds}
                onChange={handleChange}
                className="sr-only peer"
                disabled={isCreating}
              />
              <div className="w-11 h-6 bg-white/10 rounded-full peer-checked:bg-success transition-all duration-200"></div>
              <div className="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full transition-transform duration-200 peer-checked:translate-x-5"></div>
            </div>
            <div className="flex-1">
              <div className="text-sm font-medium text-white group-hover:text-white transition-colors">
                Generate odds using AI
              </div>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                AI will analyze team performance and generate fair betting odds (recommended)
              </p>
            </div>
          </label>
        </div>

        {/* Success Message */}
        {success && (
          <div className="p-4 rounded-xl bg-success/10 border border-success/30 animate-scale-in">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-success flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <p className="text-sm text-success font-medium">{success}</p>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="p-4 rounded-xl bg-error/10 border border-error/30 animate-scale-in">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-error flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <p className="text-sm text-error">{error}</p>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isCreating || !isFormValid}
          className="group w-full py-4 bg-white text-black rounded-xl font-semibold text-base
                   hover:bg-gray-100 disabled:bg-white/10 disabled:text-gray-600 
                   disabled:cursor-not-allowed transition-all duration-200 relative overflow-hidden"
        >
          <span className="relative z-10 flex items-center justify-center gap-2">
            {isCreating ? (
              <>
                <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Creating Market...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Create Market
              </>
            )}
          </span>
          
          {/* Hover Shimmer */}
          {!isCreating && isFormValid && (
            <div className="absolute inset-0 shimmer opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          )}
        </button>
      </form>
    </div>
  );
}