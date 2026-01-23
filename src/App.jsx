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

  const getFilteredMarkets = () => {
    if (filterStatus === 'all') return markets;
    return markets.filter(m => m.status === filterStatus);
  };

  const filteredMarkets = getFilteredMarkets();

  return (
    <div className="min-h-screen bg-black">
      {/* === HEADER === */}
      <header className="border-b border-white/10 bg-black/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-6">
          {/* Logo & Tagline */}
          <div className="flex items-start justify-between mb-8">
            <div className="space-y-1">
              <h1 className="text-4xl font-bold tracking-tight text-white" 
                  style={{ fontFamily: "'Space Grotesk', 'Inter', sans-serif", letterSpacing: '-0.02em' }}>
                CONSENSUS MARKETS
              </h1>
              <p className="text-sm text-gray-400" 
                 style={{ fontFamily: "'JetBrains Mono', 'Courier New', monospace", letterSpacing: '0.05em' }}>
                AI-POWERED SPORTS PREDICTION MARKETS
              </p>
            </div>
            
            {/* Market Status Indicator */}
            {markets.length > 0 && (
              <div className="glass-card px-4 py-2 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-success animate-pulse-subtle" />
                  <span className="text-sm font-mono text-gray-300">
                    {markets.length} {markets.length === 1 ? 'market' : 'markets'}
                  </span>
                </div>
              </div>
            )}
          </div>
          
          {/* Wallet Connection */}
          <WalletConnect contractHook={contractHook} />
          
          {/* Action Bar */}
          <div className="mt-6 flex items-center gap-3">
            <button
              onClick={refreshMarkets}
              className="group relative px-5 py-2.5 rounded-lg bg-white/5 hover:bg-white/10 
                       border border-white/10 hover:border-white/20 transition-all duration-300
                       text-sm font-medium text-gray-300 hover:text-white"
            >
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" 
                     fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* === NAVIGATION === */}
      <nav className="border-b border-white/10 bg-gray-950/50 backdrop-blur-xl sticky top-[140px] z-40">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex gap-1">
            {[
              { 
                id: 'markets', 
                label: 'Markets', 
                icon: (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                )
              },
              { 
                id: 'fixtures', 
                label: 'Fixtures', 
                icon: (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                )
              },
              { 
                id: 'create', 
                label: 'Create', 
                icon: (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                          d="M12 4v16m8-8H4" />
                  </svg>
                )
              },
              { 
                id: 'bet', 
                label: 'Place Bet', 
                icon: (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                          d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                ),
                disabled: !selectedMarket 
              }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  if (tab.id === 'create') {
                    setSelectedFixture(null);
                  }
                  setActiveTab(tab.id);
                }}
                disabled={tab.disabled}
                className={`
                  relative px-6 py-4 text-sm font-medium transition-all duration-200
                  ${activeTab === tab.id 
                    ? 'text-white' 
                    : 'text-gray-500 hover:text-gray-300'
                  }
                  ${tab.disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}
                `}
              >
                <span className="flex items-center gap-2">
                  {tab.icon}
                  {tab.label}
                </span>
                
                {/* Active Indicator */}
                {activeTab === tab.id && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white" />
                )}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* === MAIN CONTENT === */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        
        {/* MARKETS TAB */}
        {activeTab === 'markets' && (
          <div className="space-y-8 fade-in">
            {/* Filter Bar */}
            <div className="flex items-center gap-3">
              {[
                { id: 'all', label: 'All Markets', color: 'white' },
                { id: 'open', label: 'Open', color: 'success' },
                { id: 'resolved', label: 'Resolved', color: 'info' },
                { id: 'disputed', label: 'Disputed', color: 'error' }
              ].map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => setFilterStatus(filter.id)}
                  className={`
                    px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
                    ${filterStatus === filter.id
                      ? `bg-${filter.color}/10 text-${filter.color} border border-${filter.color}/30`
                      : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10 hover:text-gray-300'
                    }
                  `}
                >
                  {filter.label}
                </button>
              ))}
            </div>

            {/* Markets Grid */}
            {filteredMarkets.length === 0 ? (
              <div className="glass-card rounded-2xl p-16 text-center border border-white/10">
                <div className="max-w-md mx-auto space-y-4">
                  <div className="w-16 h-16 mx-auto rounded-full bg-white/5 flex items-center justify-center">
                    <svg className="w-8 h-8 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                            d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-white">No Markets Found</h3>
                  <p className="text-gray-400">
                    Create the first prediction market to get started
                  </p>
                  <button
                    onClick={() => setActiveTab('create')}
                    className="mt-4 px-6 py-3 bg-white text-black rounded-lg font-medium 
                             hover:bg-gray-100 transition-all duration-200"
                  >
                    Create Market
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredMarkets.map((market, idx) => (
                  <div 
                    key={market.id}
                    className={`fade-in fade-in-delay-${Math.min(idx, 3)}`}
                  >
                    <MarketCard
                      market={market}
                      onSelect={handleMarketSelect}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* FIXTURES TAB */}
        {activeTab === 'fixtures' && (
          <div className="fade-in space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white tracking-tight">
                Upcoming Fixtures
              </h2>
              {!fixturesLoading && (
                <span className="text-sm text-gray-400 font-mono">
                  {fixtures.length} available
                </span>
              )}
            </div>
            <FixtureList
              fixtures={fixtures}
              onSelectFixture={handleFixtureSelect}
              isLoading={fixturesLoading}
            />
          </div>
        )}

        {/* CREATE MARKET TAB */}
        {activeTab === 'create' && (
          <div className="fade-in max-w-2xl mx-auto">
            <CreateMarket
              contractHook={contractHook}
              onMarketCreated={handleMarketCreated}
              selectedFixture={selectedFixture}
            />
          </div>
        )}

        {/* PLACE BET TAB */}
        {activeTab === 'bet' && (
          <div className="fade-in max-w-5xl mx-auto">
            {selectedMarket ? (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <MarketCard market={selectedMarket} />
                  <MarketResolution
                    market={selectedMarket}
                    contractHook={contractHook}
                    onResolved={handleMarketResolved}
                  />
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
              <div className="glass-card rounded-2xl p-16 text-center border border-white/10">
                <div className="max-w-md mx-auto space-y-4">
                  <div className="w-16 h-16 mx-auto rounded-full bg-white/5 flex items-center justify-center">
                    <svg className="w-8 h-8 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                            d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-white">No Market Selected</h3>
                  <p className="text-gray-400">
                    Browse available markets to place a bet
                  </p>
                  <button
                    onClick={() => setActiveTab('markets')}
                    className="mt-4 px-6 py-3 bg-white text-black rounded-lg font-medium 
                             hover:bg-gray-100 transition-all duration-200"
                  >
                    Browse Markets
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* === FOOTER === */}
      <footer className="mt-24 border-t border-white/10 bg-gray-950/50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-center md:text-left">
              <p className="text-sm text-gray-400">
                <span className="font-semibold text-white">Consensus-Markets</span>
                <span className="mx-2 text-gray-600">•</span>
                Built on GenLayer
              </p>
              <p className="text-xs text-gray-500 mt-1">
                AI-Powered Market Resolution • Play-money only
              </p>
            </div>
            
            <div className="flex items-center gap-6">
              <a href="#" className="text-xs text-gray-400 hover:text-white transition-colors">
                Documentation
              </a>
              <a href="#" className="text-xs text-gray-400 hover:text-white transition-colors">
                GitHub
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;