import { formatDate, formatBalance, formatOdds, getOutcomeLabel } from '../utils/formatting';

export function MarketCard({ market, onSelect }) {
  const getWinnerText = () => {
    if (market.winner === -1) return 'Not resolved';
    return getOutcomeLabel(market.winner, market.team1, market.team2);
  };

  const getStatusBadge = () => {
    const statusConfig = {
      open: {
        icon: (
          <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
          </svg>
        ),
        color: 'border-success/30 bg-success/10 text-success',
      },
      resolved: {
        icon: (
          <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        ),
        color: 'border-info/30 bg-info/10 text-info',
      },
      disputed: {
        icon: (
          <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        ),
        color: 'border-error/30 bg-error/10 text-error',
      },
    };

    const config = statusConfig[market.status] || statusConfig.open;

    return (
      <div className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-medium ${config.color}`}>
        {config.icon}
        <span className="capitalize">{market.status}</span>
      </div>
    );
  };

  return (
    <div className="group relative cursor-pointer overflow-hidden rounded-xl p-4 glass-card-hover sm:p-6" onClick={() => onSelect && onSelect(market)}>
      <div className="mb-4 flex flex-col gap-3 sm:mb-5">
        <div className="flex-1">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center gap-1.5 rounded border border-white/10 bg-white/5 px-2 py-0.5">
              <svg className="h-3 w-3 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
              </svg>
              <span className="text-xs font-mono uppercase tracking-wide text-gray-400">{market.league}</span>
            </div>
            {getStatusBadge()}
          </div>

          <h3 className="pr-6 text-lg font-bold tracking-tight text-white transition-all duration-300 group-hover:text-gradient sm:pr-10 sm:text-xl">
            {market.team1} <span className="mx-2 text-gray-600">vs</span> {market.team2}
          </h3>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2 text-sm text-gray-400 sm:mb-5">
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <span className="font-mono">{formatDate(market.match_date)}</span>
      </div>

      <div className="mb-5 grid grid-cols-1 gap-2 sm:grid-cols-3">
        {[
          { label: market.team1, odds: market.odds_team1 },
          { label: 'Draw', odds: market.odds_draw },
          { label: market.team2, odds: market.odds_team2 },
        ].map((outcome, idx) => (
          <div
            key={idx}
            className="group/odds relative rounded-lg border border-white/10 bg-white/5 p-3 transition-all duration-200 hover:border-white/20 hover:bg-white/10"
          >
            <div className="mb-1.5 truncate text-[10px] font-medium uppercase tracking-wider text-gray-500">
              {outcome.label}
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-bold text-white transition-colors duration-200 group-hover/odds:text-success font-mono">
                {formatOdds(outcome.odds)}
              </span>
              <span className="text-[10px] text-gray-500">x</span>
            </div>

            <div className="pointer-events-none absolute inset-0 rounded-lg opacity-0 transition-opacity duration-200 group-hover/odds:opacity-100">
              <div className="absolute inset-0 rounded-lg bg-success/5" />
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-3">
        <div className="flex flex-col gap-2 rounded-lg border border-white/10 bg-white/5 p-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span className="text-xs font-medium text-gray-400">Total Pool</span>
          </div>
          <span className="text-sm font-bold text-white font-mono">${formatBalance(market.total_pool)}</span>
        </div>

        {market.status === 'resolved' && (
          <div className="rounded-lg border border-info/30 bg-info/10 p-3">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2">
                <svg className="h-4 w-4 text-info" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-xs font-medium text-info">Winner</span>
              </div>
              <span className="text-sm font-bold text-info">{getWinnerText()}</span>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between gap-3 border-t border-white/10 pt-2">
          <span className="text-[10px] font-mono uppercase tracking-wider text-gray-600">Market ID</span>
          <span className="text-[10px] font-mono text-gray-500">#{market.id.toString().padStart(4, '0')}</span>
        </div>
      </div>

      <div className="absolute right-4 top-4 hidden opacity-0 transition-opacity duration-200 group-hover:opacity-100 sm:block sm:right-6 sm:top-6">
        <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
        </svg>
      </div>
    </div>
  );
}
