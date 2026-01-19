// src/App.jsx
import { useState } from 'react';
import { useContract } from './hooks/useContract';
import { useFixtures } from './hooks/useFixtures';
import { useMarkets } from './hooks/useMarkets';
import { WalletConnect } from './components/WalletConnect';
import { MarketCard } from './components/MarketCard';
import { BettingInterface } from './components/BettingInterface';
import { CreateMarket } from './components/CreateMarket';
import { FixtureList } from './components/FixtureList';
import { MarketResolution } from './components/MarketResolution';

function App() {
  const contractHook = useContract();
  const { fixtures, isLoading: fixturesLoading } = useFixtures();
  const { markets, refreshMarkets } = useMarkets(contractHook);
  
  const [activeTab, setActiveTab] = useState('markets');
  const [selectedMarket, setSelectedMarket] = useState(null);
  const [selectedFixture, setSelectedFixture] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');

  const handleMarketSelect = (market) => {
    setSelectedMarket(market);
    setActiveTab('bet');
  };

  const handleFixtureSelect = (fixture) => {
    setSelectedFixture(fixture);
    setActiveTab('create');
  };

  const handleBetPlaced = () => {
    refreshMarkets();
    setSelectedMarket(null);
    setActiveTab('markets');
  };

  const handleMarketCreated = () => {
    refreshMarkets();
    setSelectedFixture(null);
    setActiveTab('markets');
  };

  const handleMarketResolved = () => {
    refreshMarkets();
  };

  const handleDebugClick = async () => {
    console.log('=== 🐛 DETAILED DEBUG INFO ===');
    console.log('Client connected:', contractHook.isConnected);
    console.log('Current account:', contractHook.account?.address);
    console.log('Client object exists:', !!contractHook.client);
    console.log('');
    
    try {
      // Test market count
      const count = await contractHook.getMarketCount();
      console.log('📊 Total markets from contract:', count);
      console.log('📊 Type of count:', typeof count);
      console.log('');
      
      if (count > 0) {
        console.log(`✅ Found ${count} market(s). Fetching details...`);
        console.log('');
        
        for (let i = 0; i < count; i++) {
          const market = await contractHook.getMarket(i);
          
          console.log(`--- Market ${i} ---`);
          console.log('Type:', typeof market);
          console.log('Is Map?:', market instanceof Map);
          console.log('Is Object?:', typeof market === 'object' && !(market instanceof Map));
          console.log('Full data:', market);
          console.log('');
          console.log('Field Access Tests:');
          console.log('  ✓ market.id:', market.id, '(type:', typeof market.id, ')');
          console.log('  ✓ market.team1:', market.team1, '(type:', typeof market.team1, ')');
          console.log('  ✓ market.team2:', market.team2, '(type:', typeof market.team2, ')');
          console.log('  ✓ market.league:', market.league, '(type:', typeof market.league, ')');
          console.log('  ✓ market.status:', market.status, '(type:', typeof market.status, ')');
          console.log('  ✓ market.odds_team1:', market.odds_team1);
          console.log('  ✓ market.odds_draw:', market.odds_draw);
          console.log('  ✓ market.odds_team2:', market.odds_team2);
          console.log('  ✓ market.total_pool:', market.total_pool);
          console.log('  ✓ market.winner:', market.winner);
          console.log('');
        }
      } else {
        console.log('⚠️ No markets found in contract!');
        console.log('');
        console.log('Possible reasons:');
        console.log('1. No markets have been created yet');
        console.log('2. Wrong contract address');
        console.log('3. GenLayer Studio state was reset');
        console.log('');
      }
      
      console.log('--- Current UI State ---');
      console.log('Markets array:', markets);
      console.log('Markets count:', markets.length);
      console.log('Markets is array?:', Array.isArray(markets));
      
      if (markets.length > 0) {
        console.log('First market in UI:', markets[0]);
        console.log('First market fields accessible?:', {
          team1: markets[0].team1,
          team2: markets[0].team2,
          status: markets[0].status,
        });
      }
      
      console.log('');
      console.log('--- Test getUserBalance ---');
      try {
        const balance = await contractHook.getUserBalance(contractHook.account.address);
        console.log('✅ User balance:', balance, '(type:', typeof balance, ')');
      } catch (err) {
        console.error('❌ getUserBalance error:', err.message);
      }
      
      console.log('=== END DEBUG ===');
    } catch (err) {
      console.error('❌ Debug error:', err);
      console.error('Error message:', err.message);
      console.error('Stack:', err.stack);
    }
  };

  const getFilteredMarkets = () => {
    if (filterStatus === 'all') return markets;
    return markets.filter(m => m.status === filterStatus);
  };

  const filteredMarkets = getFilteredMarkets();

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-white">ConsensusMarkets</h1>
              <p className="text-gray-400 mt-1">AI-Powered Sports Prediction Markets</p>
            </div>
          </div>
          
          <WalletConnect contractHook={contractHook} />
          
          {/* Debug Button */}
          <div className="mt-4 flex gap-3">
            <button
              onClick={handleDebugClick}
              className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white font-semibold rounded-lg transition-colors"
            >
              🐛 Debug Markets
            </button>
            <button
              onClick={refreshMarkets}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
            >
              🔄 Refresh Markets
            </button>
            {markets.length > 0 && (
              <div className="px-4 py-2 bg-green-600 text-white font-semibold rounded-lg">
                ✅ {markets.length} market(s) loaded
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-4">
            <button
              onClick={() => setActiveTab('markets')}
              className={`px-6 py-3 font-semibold transition-colors ${
                activeTab === 'markets'
                  ? 'text-blue-400 border-b-2 border-blue-400'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Markets
            </button>
            <button
              onClick={() => setActiveTab('fixtures')}
              className={`px-6 py-3 font-semibold transition-colors ${
                activeTab === 'fixtures'
                  ? 'text-blue-400 border-b-2 border-blue-400'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Fixtures
            </button>
            <button
              onClick={() => {
                setSelectedFixture(null);
                setActiveTab('create');
              }}
              className={`px-6 py-3 font-semibold transition-colors ${
                activeTab === 'create'
                  ? 'text-blue-400 border-b-2 border-blue-400'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Create Market
            </button>
            <button
              onClick={() => setActiveTab('bet')}
              className={`px-6 py-3 font-semibold transition-colors ${
                activeTab === 'bet'
                  ? 'text-blue-400 border-b-2 border-blue-400'
                  : 'text-gray-400 hover:text-white'
              }`}
              disabled={!selectedMarket}
            >
              Place Bet
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Markets Tab */}
        {activeTab === 'markets' && (
          <div>
            {/* Filter Buttons */}
            <div className="flex gap-3 mb-6">
              <button
                onClick={() => setFilterStatus('all')}
                className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                  filterStatus === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                All Markets
              </button>
              <button
                onClick={() => setFilterStatus('open')}
                className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                  filterStatus === 'open'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                Open
              </button>
              <button
                onClick={() => setFilterStatus('resolved')}
                className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                  filterStatus === 'resolved'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                Resolved
              </button>
              <button
                onClick={() => setFilterStatus('disputed')}
                className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                  filterStatus === 'disputed'
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                Disputed
              </button>
            </div>

            {/* Markets Grid */}
            {filteredMarkets.length === 0 ? (
              <div className="bg-gray-800 rounded-lg p-12 border border-gray-700 text-center">
                <p className="text-gray-400 text-lg">No markets found</p>
                <p className="text-gray-500 text-sm mt-2">Click the debug button above to check contract state</p>
                <button
                  onClick={() => setActiveTab('create')}
                  className="mt-4 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
                >
                  Create First Market
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredMarkets.map((market) => (
                  <MarketCard
                    key={market.id}
                    market={market}
                    onSelect={handleMarketSelect}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Fixtures Tab */}
        {activeTab === 'fixtures' && (
          <div>
            <h2 className="text-2xl font-bold text-white mb-6">Upcoming Fixtures</h2>
            <FixtureList
              fixtures={fixtures}
              onSelectFixture={handleFixtureSelect}
              isLoading={fixturesLoading}
            />
          </div>
        )}

        {/* Create Market Tab */}
        {activeTab === 'create' && (
          <div className="max-w-2xl mx-auto">
            <CreateMarket
              contractHook={contractHook}
              onMarketCreated={handleMarketCreated}
              selectedFixture={selectedFixture}
            />
          </div>
        )}

        {/* Place Bet Tab */}
        {activeTab === 'bet' && (
          <div className="max-w-4xl mx-auto">
            {selectedMarket ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <MarketCard market={selectedMarket} />
                  <div className="mt-6">
                    <MarketResolution
                      market={selectedMarket}
                      contractHook={contractHook}
                      onResolved={handleMarketResolved}
                    />
                  </div>
                </div>
                <div>
                  <BettingInterface
                    market={selectedMarket}
                    contractHook={contractHook}
                    onBetPlaced={handleBetPlaced}
                  />
                </div>
              </div>
            ) : (
              <div className="bg-gray-800 rounded-lg p-12 border border-gray-700 text-center">
                <p className="text-gray-400 text-lg">No market selected</p>
                <button
                  onClick={() => setActiveTab('markets')}
                  className="mt-4 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
                >
                  Browse Markets
                </button>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 border-t border-gray-700 mt-12">
        <div className="max-w-7xl mx-auto px-4 py-6 text-center text-gray-400 text-sm">
          <p>ConsensusMarkets • Built on GenLayer • AI-Powered Market Resolution</p>
          <p className="mt-2">Play-money only • No real money involved</p>
        </div>
      </footer>
    </div>
  );
}

export default App;