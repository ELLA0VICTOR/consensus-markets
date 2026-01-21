// src/components/TestMarketCreator.jsx
// Quick component for creating test markets with past matches for immediate testing

import { useState } from 'react';

export function TestMarketCreator({ contractHook, onMarketCreated }) {
  const [isCreating, setIsCreating] = useState(false);
  const [selectedTest, setSelectedTest] = useState('');
  const [txStatus, setTxStatus] = useState(''); // 'submitting', 'waiting', 'success', 'error'

  // Predefined test scenarios with PAST matches
  const testScenarios = [
    {
      id: 'arsenal-chelsea',
      name: '⚽ Arsenal vs Chelsea (Past Match)',
      team1: 'Arsenal',
      team2: 'Chelsea',
      league: 'Premier League',
      matchDate: '2024-01-15T20:00:00Z', // Past date
      resolutionUrl: 'https://www.bbc.com/sport/football/scores-fixtures',
      description: 'Test with actual Premier League teams - BBC Sport has results',
    },
    {
      id: 'madrid-barca',
      name: '⚽ Real Madrid vs Barcelona (Past Match)',
      team1: 'Real Madrid',
      team2: 'Barcelona',
      league: 'La Liga',
      matchDate: '2024-01-10T21:00:00Z',
      resolutionUrl: 'https://www.espn.com/soccer/scoreboard',
      description: 'Classic El Clásico - ESPN has results',
    },
    {
      id: 'test-simple',
      name: '🧪 Test Team A vs Test Team B',
      team1: 'Test Team A',
      team2: 'Test Team B',
      league: 'Test League',
      matchDate: '2024-01-01T12:00:00Z',
      resolutionUrl: 'https://www.example.com/test',
      description: 'Simple test market - will likely not resolve automatically',
    },
    {
      id: 'custom',
      name: '✏️ Custom Market',
      description: 'Create your own test market',
    },
  ];

  const [customMarket, setCustomMarket] = useState({
    team1: '',
    team2: '',
    league: '',
    matchDate: '2024-01-15T20:00:00',
    resolutionUrl: 'https://www.bbc.com/sport/football/scores-fixtures',
  });

  const handleCreateTestMarket = async (scenario) => {
    if (!contractHook.isConnected) {
      alert('Please connect your wallet first!');
      return;
    }

    try {
      setIsCreating(true);
      setTxStatus('submitting');

      let marketData;
      if (scenario.id === 'custom') {
        marketData = customMarket;
      } else {
        marketData = {
          team1: scenario.team1,
          team2: scenario.team2,
          league: scenario.league,
          matchDate: scenario.matchDate,
          resolutionUrl: scenario.resolutionUrl,
        };
      }

      console.log('📝 Creating test market:', marketData);
      setTxStatus('waiting');

      const receipt = await contractHook.createMarket(
        marketData.team1,
        marketData.team2,
        marketData.league,
        marketData.matchDate,
        marketData.resolutionUrl,
        true, // generateOdds = true
        `test-${Date.now()}` // fixtureId
      );

      console.log('🎉 Market created successfully!', receipt);
      setTxStatus('success');
      
      setTimeout(() => {
        alert('✅ Test market created successfully! Go to Markets tab and click "Refresh Markets".');
        if (onMarketCreated) {
          onMarketCreated();
        }
        setTxStatus('');
      }, 1000);
      
    } catch (err) {
      console.error('❌ Error creating test market:', err);
      setTxStatus('error');
      setTimeout(() => {
        alert(`❌ Failed to create market: ${err.message}`);
        setTxStatus('');
      }, 1000);
    } finally {
      setIsCreating(false);
      setSelectedTest('');
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-white mb-2">🧪 Quick Test Markets</h2>
        <p className="text-gray-400 text-sm">
          Create test markets with past matches for immediate testing of betting and resolution
        </p>
      </div>

      {/* Transaction Status */}
      {txStatus && (
        <div className={`mb-4 p-4 rounded-lg border ${
          txStatus === 'submitting' ? 'bg-blue-900/20 border-blue-600/30' :
          txStatus === 'waiting' ? 'bg-yellow-900/20 border-yellow-600/30' :
          txStatus === 'success' ? 'bg-green-900/20 border-green-600/30' :
          'bg-red-900/20 border-red-600/30'
        }`}>
          {txStatus === 'submitting' && (
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-400"></div>
              <span className="text-blue-400 font-semibold">Submitting transaction...</span>
            </div>
          )}
          {txStatus === 'waiting' && (
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-yellow-400"></div>
              <div>
                <div className="text-yellow-400 font-semibold">Waiting for finalization...</div>
                <div className="text-yellow-300 text-sm">This takes 60-90 seconds. Please wait...</div>
              </div>
            </div>
          )}
          {txStatus === 'success' && (
            <div className="flex items-center gap-3">
              <span className="text-2xl">✅</span>
              <span className="text-green-400 font-semibold">Market created successfully!</span>
            </div>
          )}
          {txStatus === 'error' && (
            <div className="flex items-center gap-3">
              <span className="text-2xl">❌</span>
              <span className="text-red-400 font-semibold">Transaction failed. Check console for details.</span>
            </div>
          )}
        </div>
      )}

      <div className="space-y-4">
        {testScenarios.map((scenario) => (
          <div
            key={scenario.id}
            className={`border rounded-lg p-4 cursor-pointer transition-all ${
              selectedTest === scenario.id
                ? 'border-blue-500 bg-gray-700'
                : 'border-gray-600 hover:border-gray-500'
            }`}
            onClick={() => setSelectedTest(scenario.id)}
          >
            <div className="flex items-start justify-between mb-2">
              <h3 className="text-lg font-semibold text-white">{scenario.name}</h3>
              {selectedTest === scenario.id && scenario.id !== 'custom' && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCreateTestMarket(scenario);
                  }}
                  disabled={isCreating}
                  className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                    isCreating
                      ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  {isCreating ? 'Creating...' : 'Create Now'}
                </button>
              )}
            </div>
            <p className="text-gray-400 text-sm">{scenario.description}</p>

            {selectedTest === scenario.id && scenario.id === 'custom' && (
              <div className="mt-4 space-y-3" onClick={(e) => e.stopPropagation()}>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Team 1
                  </label>
                  <input
                    type="text"
                    value={customMarket.team1}
                    onChange={(e) => setCustomMarket({ ...customMarket, team1: e.target.value })}
                    placeholder="Arsenal"
                    className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Team 2
                  </label>
                  <input
                    type="text"
                    value={customMarket.team2}
                    onChange={(e) => setCustomMarket({ ...customMarket, team2: e.target.value })}
                    placeholder="Chelsea"
                    className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    League
                  </label>
                  <input
                    type="text"
                    value={customMarket.league}
                    onChange={(e) => setCustomMarket({ ...customMarket, league: e.target.value })}
                    placeholder="Premier League"
                    className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Match Date (past date recommended)
                  </label>
                  <input
                    type="datetime-local"
                    value={customMarket.matchDate}
                    onChange={(e) => setCustomMarket({ ...customMarket, matchDate: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Resolution URL
                  </label>
                  <input
                    type="url"
                    value={customMarket.resolutionUrl}
                    onChange={(e) => setCustomMarket({ ...customMarket, resolutionUrl: e.target.value })}
                    placeholder="https://www.bbc.com/sport/football/scores-fixtures"
                    className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <button
                  onClick={() => handleCreateTestMarket(testScenarios.find(s => s.id === 'custom'))}
                  disabled={isCreating || !customMarket.team1 || !customMarket.team2}
                  className={`w-full px-4 py-3 rounded-lg font-semibold transition-colors ${
                    isCreating || !customMarket.team1 || !customMarket.team2
                      ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  {isCreating ? 'Creating Custom Market...' : 'Create Custom Market'}
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-yellow-900/20 border border-yellow-600/30 rounded-lg">
        <h4 className="text-yellow-500 font-semibold mb-2">💡 Testing Tips:</h4>
        <ul className="text-gray-300 text-sm space-y-1">
          <li>• Use past matches (before today) so resolution can work immediately</li>
          <li>• BBC Sport and ESPN URLs work well for real team results</li>
          <li>• After creating, you can immediately place bets and test resolution</li>
          <li>• Resolution takes 60-90 seconds (LLM needs to analyze the webpage)</li>
          <li>• Test markets use play-money (you start with 1,000,000)</li>
        </ul>
      </div>

      <div className="mt-4 p-4 bg-blue-900/20 border border-blue-600/30 rounded-lg">
        <h4 className="text-blue-400 font-semibold mb-2">📋 Full Testing Workflow:</h4>
        <ol className="text-gray-300 text-sm space-y-1">
          <li>1. Create a test market (use past match for immediate testing)</li>
          <li>2. Go to Markets tab and click on the new market</li>
          <li>3. Place bets on different outcomes (Team 1, Draw, Team 2)</li>
          <li>4. Click "Resolve Market" to trigger LLM resolution</li>
          <li>5. Wait 60-90 seconds for resolution to complete</li>
          <li>6. Check if correct winner was determined</li>
          <li>7. Claim winnings if you bet on the winner</li>
          <li>8. (Optional) Test dispute if resolution is wrong</li>
        </ol>
      </div>
    </div>
  );
}