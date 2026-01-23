import { formatDate, formatBalance, formatOdds, getStatusColor, getOutcomeLabel } from '../utils/formatting';

export function MarketCard({ market, onSelect }) {
  const getWinnerText = () => {
    if (market.winner === -1) return 'Not resolved';
    return getOutcomeLabel(market.winner, market.team1, market.team2);
  };

  const getStatusBadge = () => {
    const statusConfig = {
      open: { 
        icon: (
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
          </svg>
        ),
        color: 'text-success bg-success/10 border-success/30'
      },
      resolved: { 
        icon: (
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        ),
        color: 'text-info bg-info/10 border-info/30'
      },
      disputed: { 
        icon: (
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        ),
        color: 'text-error bg-error/10 border-error/30'
      }
    };

    const config = statusConfig[market.status] || statusConfig.open;
    
    return (
      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-xs font-medium ${config.color}`}>
        {config.icon}
        <span className="capitalize">{market.status}</span>
      </div>
    );
  };

  return (
    <div 
      className="group glass-card-hover rounded-xl p-6 cursor-pointer"
      onClick={() => onSelect && onSelect(market)}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-5">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            {/* League Badge */}
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-white/5 border border-white/10">
              <svg className="w-3 h-3 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
              </svg>
              <span className="text-xs font-mono text-gray-400 uppercase tracking-wide">{market.league}</span>
            </div>
            
            {/* Status Badge */}
            {getStatusBadge()}
          </div>
          
          <h3 className="text-xl font-bold text-white tracking-tight group-hover:text-gradient transition-all duration-300">
            {market.team1} <span className="text-gray-600 mx-2">vs</span> {market.team2}
          </h3>
        </div>
      </div>

      {/* Match Date */}
      <div className="flex items-center gap-2 mb-5 text-sm text-gray-400">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <span className="font-mono">{formatDate(market.match_date)}</span>
      </div>

      {/* Odds Grid */}
      <div className="grid grid-cols-3 gap-2 mb-5">
        {[
          { label: market.team1, odds: market.odds_team1, position: 'home' },
          { label: 'Draw', odds: market.odds_draw, position: 'draw' },
          { label: market.team2, odds: market.odds_team2, position: 'away' }
        ].map((outcome, idx) => (
          <div 
            key={idx}
            className="relative bg-white/5 border border-white/10 rounded-lg p-3 group/odds hover:bg-white/10 hover:border-white/20 transition-all duration-200"
          >
            <div className="text-[10px] uppercase tracking-wider text-gray-500 mb-1.5 font-medium truncate">
              {outcome.label}
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-bold font-mono text-white group-hover/odds:text-success transition-colors duration-200">
                {formatOdds(outcome.odds)}
              </span>
              <span className="text-[10px] text-gray-500">x</span>
            </div>
            
            {/* Hover Indicator */}
            <div className="absolute inset-0 rounded-lg opacity-0 group-hover/odds:opacity-100 transition-opacity duration-200 pointer-events-none">
              <div className="absolute inset-0 rounded-lg bg-success/5" />
            </div>
          </div>
        ))}
      </div>

      {/* Footer Info */}
      <div className="space-y-3">
        {/* Total Pool */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span className="text-xs text-gray-400 font-medium">Total Pool</span>
          </div>
          <span className="text-sm font-bold font-mono text-white">
            ${formatBalance(market.total_pool)}
          </span>
        </div>

        {/* Winner Info (if resolved) */}
        {market.status === 'resolved' && (
          <div className="p-3 rounded-lg bg-info/10 border border-info/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-info" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-xs text-info font-medium">Winner</span>
              </div>
              <span className="text-sm font-bold text-info">{getWinnerText()}</span>
            </div>
          </div>
        )}

        {/* Market ID */}
        <div className="flex items-center justify-between pt-2 border-t border-white/10">
          <span className="text-[10px] text-gray-600 font-mono uppercase tracking-wider">
            Market ID
          </span>
          <span className="text-[10px] text-gray-500 font-mono">
            #{market.id.toString().padStart(4, '0')}
          </span>
        </div>
      </div>

      {/* Hover Arrow */}
      <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
        </svg>
      </div>
    </div>
  );
}