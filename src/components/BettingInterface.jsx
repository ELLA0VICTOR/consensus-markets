import { useState } from 'react';
import { formatOdds, calculatePayout, formatBalance } from '../utils/formatting';
import { OUTCOMES } from '../config/genlayer';

export function BettingInterface({ market, contractHook, onBetPlaced }) {
  const [selectedOutcome, setSelectedOutcome] = useState(null);
  const [betAmount, setBetAmount] = useState('');
  const [isPlacing, setIsPlacing] = useState(false);
  const [error, setError] = useState('');

  const outcomes = [
    { id: OUTCOMES.TEAM1, label: market.team1, odds: market.odds_team1 },
    { id: OUTCOMES.DRAW, label: 'Draw', odds: market.odds_draw },
    { id: OUTCOMES.TEAM2, label: market.team2, odds: market.odds_team2 },
  ];

  const handlePlaceBet = async () => {
    if (selectedOutcome === null) {
      setError('Please select an outcome');
      return;
    }

    if (!betAmount || parseFloat(betAmount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    setIsPlacing(true);
    setError('');

    try {
      const amount = Math.floor(parseFloat(betAmount));
      await contractHook.placeBet(market.id, selectedOutcome, amount);

      setBetAmount('');
      setSelectedOutcome(null);

      if (onBetPlaced) {
        onBetPlaced();
      }
    } catch (err) {
      setError(err.message || 'Failed to place bet');
    } finally {
      setIsPlacing(false);
    }
  };

  const getPotentialPayout = () => {
    if (!betAmount || selectedOutcome === null) return 0;
    const outcome = outcomes.find((item) => item.id === selectedOutcome);
    if (!outcome) return 0;
    return calculatePayout(betAmount, outcome.odds);
  };

  const quickAmounts = [10, 50, 100, 500];

  if (market.status !== 'open') {
    return (
      <div className="glass-card rounded-xl border border-white/10 p-6 sm:p-8">
        <div className="space-y-4 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white/5">
            <svg className="h-8 w-8 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <div>
            <h3 className="mb-1 text-lg font-semibold text-white">Market Closed</h3>
            <p className="text-sm text-gray-400">
              This market is <span className="font-medium capitalize text-white">{market.status}</span> and not accepting bets
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-xl border border-white/10 p-5 sm:p-6">
      <div className="mb-5 sm:mb-6">
        <h3 className="mb-1 text-xl font-bold tracking-tight text-white sm:text-2xl">Place Your Bet</h3>
        <p className="text-sm text-gray-400">Select outcome and enter amount</p>
      </div>

      <div className="mb-6 space-y-3">
        <label className="text-xs font-medium uppercase tracking-wider text-gray-500">Select Outcome</label>
        {outcomes.map((outcome) => {
          const isSelected = selectedOutcome === outcome.id;

          return (
            <button
              key={outcome.id}
              onClick={() => setSelectedOutcome(outcome.id)}
              className={`
                relative w-full overflow-hidden rounded-xl border-2 p-4 transition-all duration-200
                ${isSelected
                  ? 'border-white bg-white/10 shadow-glow'
                  : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10'}
              `}
            >
              <div className="relative z-10 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`
                      flex h-5 w-5 items-center justify-center rounded-full border-2 transition-all duration-200
                      ${isSelected ? 'border-white bg-white' : 'border-white/30'}
                    `}
                  >
                    {isSelected && <div className="h-2.5 w-2.5 rounded-full bg-black" />}
                  </div>

                  <span className={`text-left font-semibold transition-colors duration-200 sm:text-base ${isSelected ? 'text-white' : 'text-gray-300'}`}>
                    {outcome.label}
                  </span>
                </div>

                <div className="flex items-baseline gap-1">
                  <span className={`font-mono text-xl font-bold transition-colors duration-200 sm:text-2xl ${isSelected ? 'text-success' : 'text-gray-300'}`}>
                    {formatOdds(outcome.odds)}
                  </span>
                  <span className="text-xs text-gray-500">x</span>
                </div>
              </div>

              {isSelected && <div className="pointer-events-none absolute inset-0 bg-gradient-radial opacity-30" />}
            </button>
          );
        })}
      </div>

      <div className="mb-6">
        <label className="mb-3 block text-xs font-medium uppercase tracking-wider text-gray-500">Bet Amount</label>

        <div className="mb-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {quickAmounts.map((amount) => (
            <button
              key={amount}
              onClick={() => setBetAmount(amount.toString())}
              className={`
                rounded-lg border px-3 py-2 text-sm font-medium font-mono transition-all duration-200
                ${betAmount === amount.toString()
                  ? 'border-white/30 bg-white/10 text-white'
                  : 'border-white/10 bg-white/5 text-gray-400 hover:bg-white/10 hover:text-gray-300'}
              `}
              disabled={isPlacing}
            >
              ${amount}
            </button>
          ))}
        </div>

        <div className="relative">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-mono text-gray-500">$</div>
          <input
            type="number"
            value={betAmount}
            onChange={(e) => setBetAmount(e.target.value)}
            placeholder="0.00"
            className="w-full rounded-lg border border-white/10 bg-white/5 py-4 pl-10 pr-4 font-mono text-base text-white placeholder-gray-600 transition-all duration-200 focus:border-white/30 focus:bg-white/10 focus:outline-none sm:text-lg"
            disabled={isPlacing}
          />
        </div>
      </div>

      {betAmount && selectedOutcome !== null && (
        <div className="mb-6 rounded-xl border border-success/30 bg-success/10 p-4 animate-scale-in">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <svg className="h-4 w-4 text-success" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
              </svg>
              <span className="text-sm font-medium text-success">Potential Payout</span>
            </div>
            <span className="font-mono text-xl font-bold text-success sm:text-2xl">${formatBalance(getPotentialPayout())}</span>
          </div>
          <div className="mt-2 text-xs text-success/70">Profit: ${formatBalance(getPotentialPayout() - parseFloat(betAmount))}</div>
        </div>
      )}

      {error && (
        <div className="mb-6 rounded-xl border border-error/30 bg-error/10 p-4 animate-scale-in">
          <div className="flex items-start gap-3">
            <svg className="mt-0.5 h-5 w-5 flex-shrink-0 text-error" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <p className="text-sm text-error">{error}</p>
          </div>
        </div>
      )}

      <button
        onClick={handlePlaceBet}
        disabled={isPlacing || !betAmount || selectedOutcome === null}
        className="group relative w-full overflow-hidden rounded-xl bg-white py-4 text-base font-semibold text-black transition-all duration-200 hover:bg-gray-100 disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-gray-600"
      >
        <span className="relative z-10 flex items-center justify-center gap-2">
          {isPlacing ? (
            <>
              <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Placing Bet...
            </>
          ) : (
            <>
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Place Bet
            </>
          )}
        </span>

        {!isPlacing && !(!betAmount || selectedOutcome === null) && (
          <div className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 shimmer" />
        )}
      </button>

      <p className="mt-4 text-center text-xs leading-relaxed text-gray-500">Play-money only. No real money involved.</p>
    </div>
  );
}
