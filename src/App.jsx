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

const TABS = [
  {
    id: 'markets',
    label: 'Markets',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
        />
      </svg>
    ),
  },
  {
    id: 'fixtures',
    label: 'Fixtures',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
        />
      </svg>
    ),
  },
  {
    id: 'create',
    label: 'Create',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
      </svg>
    ),
  },
  {
    id: 'bet',
    label: 'Place Bet',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
        />
      </svg>
    ),
  },
];

const FILTER_OPTIONS = [
  {
    id: 'all',
    label: 'All Markets',
    activeClassName: 'border-white/30 bg-white/10 text-white',
  },
  {
    id: 'open',
    label: 'Open',
    activeClassName: 'border-success/30 bg-success/10 text-success',
  },
  {
    id: 'resolved',
    label: 'Resolved',
    activeClassName: 'border-info/30 bg-info/10 text-info',
  },
  {
    id: 'disputed',
    label: 'Disputed',
    activeClassName: 'border-error/30 bg-error/10 text-error',
  },
];

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
    return markets.filter((market) => market.status === filterStatus);
  };

  const filteredMarkets = getFilteredMarkets();

  return (
    <div className="min-h-screen overflow-x-hidden bg-black">
      <header className="sticky top-0 z-50 border-b border-white/10 bg-black/80 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 sm:py-6">
          <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-2">
              <h1
                className="max-w-4xl text-2xl font-bold leading-tight tracking-tight text-white sm:text-4xl"
                style={{ fontFamily: "'Space Grotesk', 'Inter', sans-serif", letterSpacing: '-0.02em' }}
              >
                CONSENSUS MARKETS
              </h1>
              <p
                className="text-xs text-gray-400 sm:text-sm"
                style={{ fontFamily: "'JetBrains Mono', 'Courier New', monospace", letterSpacing: '0.05em' }}
              >
                AI-POWERED SPORTS PREDICTION MARKETS
              </p>
            </div>

            {markets.length > 0 && (
              <div className="glass-card self-start rounded-lg px-4 py-2">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-success animate-pulse-subtle" />
                  <span className="text-sm font-mono text-gray-300">
                    {markets.length} {markets.length === 1 ? 'market' : 'markets'}
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <WalletConnect contractHook={contractHook} />

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={refreshMarkets}
                className="group relative inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-gray-300 transition-all duration-300 hover:border-white/20 hover:bg-white/10 hover:text-white sm:px-5"
              >
                <svg
                  className="h-4 w-4 transition-transform duration-500 group-hover:rotate-180"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                Refresh
              </button>
            </div>
          </div>
        </div>
      </header>

      <nav className="border-b border-white/10 bg-gray-950/50 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="-mx-4 overflow-x-auto px-4 py-2 no-scrollbar sm:mx-0 sm:px-0">
            <div className="flex min-w-max gap-2">
              {TABS.map((tab) => {
                const isDisabled = tab.id === 'bet' && !selectedMarket;

                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      if (tab.id === 'create') {
                        setSelectedFixture(null);
                      }
                      setActiveTab(tab.id);
                    }}
                    disabled={isDisabled}
                    className={`
                      relative flex shrink-0 items-center gap-2 whitespace-nowrap rounded-lg px-4 py-3 text-sm font-medium transition-all duration-200 sm:px-5
                      ${activeTab === tab.id
                        ? 'bg-white/10 text-white'
                        : 'text-gray-500 hover:bg-white/5 hover:text-gray-300'}
                      ${isDisabled ? 'cursor-not-allowed opacity-40' : 'cursor-pointer'}
                    `}
                  >
                    {tab.icon}
                    {tab.label}

                    {activeTab === tab.id && (
                      <div className="absolute bottom-1 left-3 right-3 h-0.5 rounded-full bg-white" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12">
        {activeTab === 'markets' && (
          <div className="fade-in space-y-8">
            <div className="-mx-4 overflow-x-auto px-4 pb-1 no-scrollbar sm:mx-0 sm:px-0">
              <div className="flex min-w-max items-center gap-3">
                {FILTER_OPTIONS.map((filter) => (
                  <button
                    key={filter.id}
                    onClick={() => setFilterStatus(filter.id)}
                    className={`
                      whitespace-nowrap rounded-lg border px-4 py-2.5 text-sm font-medium transition-all duration-200 sm:px-5
                      ${filterStatus === filter.id
                        ? filter.activeClassName
                        : 'border-white/10 bg-white/5 text-gray-400 hover:bg-white/10 hover:text-gray-300'}
                    `}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
            </div>

            {filteredMarkets.length === 0 ? (
              <div className="glass-card rounded-2xl border border-white/10 p-10 text-center sm:p-16">
                <div className="mx-auto max-w-md space-y-4">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white/5">
                    <svg className="h-8 w-8 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-white">No Markets Found</h3>
                  <p className="text-gray-400">Create the first prediction market to get started</p>
                  <button
                    onClick={() => setActiveTab('create')}
                    className="mt-4 w-full rounded-lg bg-white px-6 py-3 font-medium text-black transition-all duration-200 hover:bg-gray-100 sm:w-auto"
                  >
                    Create Market
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
                {filteredMarkets.map((market, idx) => (
                  <div key={market.id} className={`fade-in fade-in-delay-${Math.min(idx, 3)}`}>
                    <MarketCard market={market} onSelect={handleMarketSelect} />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'fixtures' && (
          <div className="fade-in space-y-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-2xl font-bold tracking-tight text-white">Upcoming Fixtures</h2>
              {!fixturesLoading && (
                <span className="text-sm font-mono text-gray-400">{fixtures.length} available</span>
              )}
            </div>
            <FixtureList
              fixtures={fixtures}
              onSelectFixture={handleFixtureSelect}
              isLoading={fixturesLoading}
            />
          </div>
        )}

        {activeTab === 'create' && (
          <div className="mx-auto max-w-3xl fade-in">
            <CreateMarket
              contractHook={contractHook}
              onMarketCreated={handleMarketCreated}
              selectedFixture={selectedFixture}
            />
          </div>
        )}

        {activeTab === 'bet' && (
          <div className="mx-auto max-w-5xl fade-in">
            {selectedMarket ? (
              <div className="grid grid-cols-1 gap-6 xl:grid-cols-2 xl:gap-8">
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
              <div className="glass-card rounded-2xl border border-white/10 p-10 text-center sm:p-16">
                <div className="mx-auto max-w-md space-y-4">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white/5">
                    <svg className="h-8 w-8 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-white">No Market Selected</h3>
                  <p className="text-gray-400">Browse available markets to place a bet</p>
                  <button
                    onClick={() => setActiveTab('markets')}
                    className="mt-4 w-full rounded-lg bg-white px-6 py-3 font-medium text-black transition-all duration-200 hover:bg-gray-100 sm:w-auto"
                  >
                    Browse Markets
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      <footer className="mt-16 border-t border-white/10 bg-gray-950/50 backdrop-blur-xl sm:mt-24">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="text-center md:text-left">
              <p className="text-sm text-gray-400">
                <span className="font-semibold text-white">Consensus-Markets</span>
                <span className="mx-2 text-gray-600">&middot;</span>
                Built on GenLayer
              </p>
              <p className="mt-1 text-xs text-gray-500">
                AI-Powered Market Resolution <span className="mx-1">&middot;</span> Play-money only
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-6">
              <a href="#" className="text-xs text-gray-400 transition-colors hover:text-white">
                Documentation
              </a>
              <a href="#" className="text-xs text-gray-400 transition-colors hover:text-white">
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
