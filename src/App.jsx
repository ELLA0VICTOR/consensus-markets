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
    console.log('=== 🐛 DEBUG MARKET INFO ===');
    console.log('Client connected:', contractHook.isConnected);
    console.log('Current account:', contractHook.account?.address);
    console.log('Client object:', contractHook.client);
    
    try {
      const count = await contractHook.getMarketCount();
      console.log('📊 Total markets from contract:', count);
      
      if (count > 0) {
        console.log(`✅ Found ${count} market(s). Fetching details...`);
        for (let i = 0; i < count; i++) {
          const market = await contractHook.getMarket(i);
          console.log(`Market ${i}:`, market);
          console.log(`  - Team 1: ${market.team1}`);
          console.log(`  - Team 2: ${market.team2}`);
          console.log(`  - Status: ${market.status}`);
          console.log(`  - League: ${market.league}`);
        }
      } else {
        console.log('⚠️ No markets found in contract!');
        console.log('');
        console.log('Possible reasons:');
        console.log('1. Wrong contract address');
        console.log('2. Markets created on different account/network');
        console.log('3. GenLayer Studio state was reset');
        console.log('4. Contract deployment failed');
      }
      
      console.log('');
      console.log('Current UI state:');
      console.log('Markets in UI:', markets);
      console.log('Markets count in UI:', markets.length);
      console.log('======================');
    } catch (err) {
      console.error('❌ Debug error:', err);
      console.error('Error details:', err.message);
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
          <div className="mt-4">
            <button
              onClick={handleDebugClick}
              className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white font-semibold rounded-lg transition-colors"
            >
              🐛 Debug Markets
            </button>
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