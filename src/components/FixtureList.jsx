import { formatDateShort, formatTimeRemaining } from '../utils/formatting';

export function FixtureList({ fixtures, onSelectFixture, isLoading }) {
  if (isLoading) {
    return (
      <div className="glass-card rounded-xl border border-white/10 p-8 sm:p-12">
        <div className="flex flex-col items-center justify-center space-y-4">
          <svg className="h-12 w-12 animate-spin text-gray-600" fill="none" viewBox="0 0 24 24">
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
      <div className="glass-card rounded-xl border border-white/10 p-8 sm:p-12">
        <div className="space-y-4 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white/5">
            <svg className="h-8 w-8 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
          </div>
          <div>
            <h3 className="mb-1 text-lg font-semibold text-white">No Fixtures Available</h3>
            <p className="text-sm text-gray-400">Check back later for upcoming matches</p>
          </div>
        </div>
      </div>
    );
  }

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
          className={`glass-card fade-in fade-in-delay-${Math.min(leagueIdx, 3)} overflow-hidden rounded-xl border border-white/10`}
        >
          <div className="border-b border-white/10 bg-white/5 px-4 py-4 sm:px-6">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5">
                <svg className="h-4 w-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                </svg>
              </div>
              <div>
                <h3 className="text-base font-bold tracking-tight text-white">{league}</h3>
                <p className="text-xs font-mono text-gray-500">
                  {leagueFixtures.length} {leagueFixtures.length === 1 ? 'match' : 'matches'}
                </p>
              </div>
            </div>
          </div>

          <div className="divide-y divide-white/10">
            {leagueFixtures.map((fixture) => (
              <div
                key={fixture.id}
                onClick={() => onSelectFixture && onSelectFixture(fixture)}
                className="group cursor-pointer p-4 transition-all duration-200 hover:bg-white/5 sm:p-5"
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="mb-3">
                      <h4 className="text-base font-semibold leading-snug text-white transition-all duration-300 group-hover:text-gradient sm:text-lg">
                        <span className="break-words">{fixture.team1}</span>
                        <span className="mx-2 text-gray-600">vs</span>
                        <span className="break-words">{fixture.team2}</span>
                      </h4>
                    </div>

                    <div className="flex flex-col gap-2 text-sm text-gray-400 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
                      <div className="flex items-center gap-1.5">
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className="font-mono">{formatDateShort(fixture.date)}</span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="font-mono">{formatTimeRemaining(fixture.date)}</span>
                      </div>
                    </div>
                  </div>

                  <button className="flex w-full flex-shrink-0 items-center justify-center gap-2 rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-black transition-all duration-200 hover:bg-gray-100 group-hover:shadow-glow sm:w-auto">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
