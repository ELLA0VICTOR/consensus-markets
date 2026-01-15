import { formatDate, formatBalance, formatOdds, getStatusColor, getOutcomeLabel } from '../utils/formatting';

export function MarketCard({ market, onSelect }) {
  const getWinnerText = () => {
    if (market.winner === -1) return 'Not resolved';
    return getOutcomeLabel(market.winner, market.team1, market.team2);
  };

  return (
    <div 
      className="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-blue-500 transition-colors cursor-pointer"
      onClick={() => onSelect && onSelect(market)}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="text-xs text-gray-400 mb-1">{market.league}</div>
          <h3 className="text-xl font-bold text-white">
            {market.team1} vs {market.team2}
          </h3>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-semibold text-white ${getStatusColor(market.status)}`}>
          {market.status}
        </span>
      </div>

      {/* Match Info */}
      <div className="text-sm text-gray-400 mb-4">
        {formatDate(market.match_date)}
      </div>

      {/* Odds */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-gray-900 rounded p-3 text-center">
          <div className="text-xs text-gray-400 mb-1">{market.team1}</div>
          <div className="text-lg font-bold text-green-400">{formatOdds(market.odds_team1)}</div>
        </div>
        <div className="bg-gray-900 rounded p-3 text-center">
          <div className="text-xs text-gray-400 mb-1">Draw</div>
          <div className="text-lg font-bold text-green-400">{formatOdds(market.odds_draw)}</div>
        </div>
        <div className="bg-gray-900 rounded p-3 text-center">
          <div className="text-xs text-gray-400 mb-1">{market.team2}</div>
          <div className="text-lg font-bold text-green-400">{formatOdds(market.odds_team2)}</div>
        </div>
      </div>

      {/* Total Pool */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-400">Total Pool:</span>
        <span className="font-bold text-white">${formatBalance(market.total_pool)}</span>
      </div>

      {/* Winner (if resolved) */}
      {market.status === 'resolved' && (
        <div className="mt-3 pt-3 border-t border-gray-700">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">Winner:</span>
            <span className="font-bold text-blue-400">{getWinnerText()}</span>
          </div>
        </div>
      )}

      {/* Market ID */}
      <div className="mt-3 text-xs text-gray-500">
        Market #{market.id}
      </div>
    </div>
  );
}