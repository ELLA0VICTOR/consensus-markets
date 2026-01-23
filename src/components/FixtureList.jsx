import { formatDateShort, formatTimeRemaining } from '../utils/formatting';

export function FixtureList({ fixtures, onSelectFixture, isLoading }) {
  if (isLoading) {
    return (
      <div className="glass-card rounded-xl p-12 border border-white/10">
        <div className="flex flex-col items-center justify-center space-y-4">
          <svg className="w-12 h-12 text-gray-600 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <p className="text-gray-400">Loading fixtures...</p>
        </div>
      </div>
    );
  }

  if (!fixtures || fixtures.length === 0) {
    return (
      <div className="glass-card rounded-xl p-12 border border-white/10">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto rounded-full bg-white/5 flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white mb-1">No Fixtures Available</h3>
            <p className="text-sm text-gray-400">
              Check back later for upcoming matches
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Group fixtures by league
  const groupedFixtures = fixtures.reduce((acc, fixture) => {
    if (!acc[fixture.league]) {
      acc[fixture.league] = [];
    }
    acc[fixture.league].push(fixture);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {Object.entries(groupedFixtures).map(([league, leagueFixtures], leagueIdx) => (
        <div 
          key={league} 
          className={`glass-card rounded-xl border border-white/10 overflow-hidden fade-in fade-in-delay-${Math.min(leagueIdx, 3)}`}
        >
          {/* League Header */}
          <div className="px-6 py-4 bg-white/5 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                </svg>
              </div>
              <div>
                <h3 className="text-base font-bold text-white tracking-tight">{league}</h3>
                <p className="text-xs text-gray-500 font-mono">{leagueFixtures.length} {leagueFixtures.length === 1 ? 'match' : 'matches'}</p>
              </div>
            </div>
          </div>
          
          {/* Fixtures List */}
          <div className="divide-y divide-white/10">
            {leagueFixtures.map((fixture, idx) => (
              <div
                key={fixture.id}
                onClick={() => onSelectFixture && onSelectFixture(fixture)}
                className="group p-5 hover:bg-white/5 cursor-pointer transition-all duration-200"
              >
                <div className="flex items-center justify-between gap-4">
                  {/* Match Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-3">
                      {/* Teams */}
                      <h4 className="text-base font-semibold text-white group-hover:text-gradient transition-all duration-300 truncate">
                        {fixture.team1} <span className="text-gray-600 mx-2">vs</span> {fixture.team2}
                      </h4>
                    </div>
                    
                    {/* Date & Time */}
                    <div className="flex items-center gap-4 text-sm text-gray-400">
                      <div className="flex items-center gap-1.5">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className="font-mono">{formatDateShort(fixture.date)}</span>
                      </div>
                      
                      <div className="flex items-center gap-1.5">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="font-mono">{formatTimeRemaining(fixture.date)}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Action Button */}
                  <button 
                    className="flex-shrink-0 px-5 py-2.5 rounded-lg bg-white text-black font-semibold text-sm
                             hover:bg-gray-100 transition-all duration-200
                             flex items-center gap-2 group-hover:shadow-glow"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    <span>Create Market</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}