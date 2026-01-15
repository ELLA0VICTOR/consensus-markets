import { formatDateShort, formatTimeRemaining } from '../utils/formatting';

export function FixtureList({ fixtures, onSelectFixture, isLoading }) {
  if (isLoading) {
    return (
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <div className="text-center text-gray-400">Loading fixtures...</div>
      </div>
    );
  }

  if (!fixtures || fixtures.length === 0) {
    return (
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <div className="text-center text-gray-400">No fixtures available</div>
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
      {Object.entries(groupedFixtures).map(([league, leagueFixtures]) => (
        <div key={league} className="bg-gray-800 rounded-lg border border-gray-700">
          <div className="px-6 py-4 border-b border-gray-700">
            <h3 className="text-lg font-bold text-white">{league}</h3>
          </div>
          
          <div className="divide-y divide-gray-700">
            {leagueFixtures.map((fixture) => (
              <div
                key={fixture.id}
                onClick={() => onSelectFixture && onSelectFixture(fixture)}
                className="p-4 hover:bg-gray-700/50 cursor-pointer transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="font-semibold text-white mb-1">
                      {fixture.team1} vs {fixture.team2}
                    </div>
                    <div className="text-sm text-gray-400">
                      {formatDateShort(fixture.date)} • {formatTimeRemaining(fixture.date)}
                    </div>
                  </div>
                  
                  <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors">
                    Create Market
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