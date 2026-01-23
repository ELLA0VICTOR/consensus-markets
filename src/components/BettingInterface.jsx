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
    const outcome = outcomes.find(o => o.id === selectedOutcome);
    if (!outcome) return 0;
    return calculatePayout(betAmount, outcome.odds);
  };

  const quickAmounts = [10, 50, 100, 500];

  if (market.status !== 'open') {
    return (
      <div className="glass-card rounded-xl p-8 border border-white/10">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto rounded-full bg-white/5 flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white mb-1">Market Closed</h3>
            <p className="text-sm text-gray-400">
              This market is <span className="font-medium text-white capitalize">{market.status}</span> and not accepting bets
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-xl p-6 border border-white/10">
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-white tracking-tight mb-1">Place Your Bet</h3>
        <p className="text-sm text-gray-400">Select outcome and enter amount</p>
      </div>

      {/* Outcome Selection */}
      <div className="space-y-3 mb-6">
        <label className="text-xs uppercase tracking-wider text-gray-500 font-medium">
          Select Outcome
        </label>
        {outcomes.map((outcome) => {
          const isSelected = selectedOutcome === outcome.id;
          return (
            <button
              key={outcome.id}
              onClick={() => setSelectedOutcome(outcome.id)}
              className={`
                w-full p-4 rounded-xl border-2 transition-all duration-200 relative overflow-hidden
                ${isSelected
                  ? 'border-white bg-white/10 shadow-glow'
                  : 'border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20'
                }
              `}
            >
              <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {/* Radio Indicator */}
                  <div className={`
                    w-5 h-5 rounded-full border-2 transition-all duration-200 flex items-center justify-center
                    ${isSelected ? 'border-white bg-white' : 'border-white/30'}
                  `}>
                    {isSelected && (
                      <div className="w-2.5 h-2.5 rounded-full bg-black" />
                    )}
                  </div>
                  
                  <span className={`font-semibold text-base transition-colors duration-200 ${
                    isSelected ? 'text-white' : 'text-gray-300'
                  }`}>
                    {outcome.label}
                  </span>
                </div>
                
                <div className="flex items-baseline gap-1">
                  <span className={`text-2xl font-bold font-mono transition-colors duration-200 ${
                    isSelected ? 'text-success' : 'text-gray-300'
                  }`}>
                    {formatOdds(outcome.odds)}
                  </span>
                  <span className="text-xs text-gray-500">x</span>
                </div>
              </div>
              
              {/* Selection Glow */}
              {isSelected && (
                <div className="absolute inset-0 bg-gradient-radial opacity-30 pointer-events-none" />
              )}
            </button>
          );
        })}
      </div>

      {/* Bet Amount Input */}
      <div className="mb-6">
        <label className="block text-xs uppercase tracking-wider text-gray-500 font-medium mb-3">
          Bet Amount
        </label>
        
        {/* Quick Amount Buttons */}
        <div className="grid grid-cols-4 gap-2 mb-3">
          {quickAmounts.map((amount) => (
            <button
              key={amount}
              onClick={() => setBetAmount(amount.toString())}
              className={`
                px-3 py-2 rounded-lg border text-sm font-medium font-mono transition-all duration-200
                ${betAmount === amount.toString()
                  ? 'border-white/30 bg-white/10 text-white'
                  : 'border-white/10 bg-white/5 text-gray-400 hover:bg-white/10 hover:text-gray-300'
                }
              `}
              disabled={isPlacing}
            >
              ${amount}
            </button>
          ))}
        </div>
        
        {/* Manual Input */}
        <div className="relative">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-mono text-lg">
            $
          </div>
          <input
            type="number"
            value={betAmount}
            onChange={(e) => setBetAmount(e.target.value)}
            placeholder="0.00"
            className="w-full pl-10 pr-4 py-4 bg-white/5 border border-white/10 rounded-lg 
                     text-white placeholder-gray-600 font-mono text-lg
                     focus:outline-none focus:border-white/30 focus:bg-white/10
                     transition-all duration-200"
            disabled={isPlacing}
          />
        </div>
      </div>

      {/* Potential Payout */}
      {betAmount && selectedOutcome !== null && (
        <div className="mb-6 p-4 rounded-xl bg-success/10 border border-success/30 animate-scale-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-success" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
              </svg>
              <span className="text-sm text-success font-medium">Potential Payout</span>
            </div>
            <span className="text-2xl font-bold font-mono text-success">
              ${formatBalance(getPotentialPayout())}
            </span>
          </div>
          <div className="mt-2 text-xs text-success/70">
            Profit: ${formatBalance(getPotentialPayout() - parseFloat(betAmount))}
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 rounded-xl bg-error/10 border border-error/30 animate-scale-in">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-error flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <p className="text-sm text-error">{error}</p>
          </div>
        </div>
      )}

      {/* Place Bet Button */}
      <button
        onClick={handlePlaceBet}
        disabled={isPlacing || !betAmount || selectedOutcome === null}
        className="group w-full py-4 bg-white text-black rounded-xl font-semibold text-base
                 hover:bg-gray-100 disabled:bg-white/10 disabled:text-gray-600 
                 disabled:cursor-not-allowed transition-all duration-200 relative overflow-hidden"
      >
        <span className="relative z-10 flex items-center justify-center gap-2">
          {isPlacing ? (
            <>
              <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Placing Bet...
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Place Bet
            </>
          )}
        </span>
        
        {/* Hover Shimmer */}
        {!isPlacing && !(!betAmount || selectedOutcome === null) && (
          <div className="absolute inset-0 shimmer opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        )}
      </button>

      {/* Disclaimer */}
      <p className="mt-4 text-xs text-center text-gray-500">
        Play-money only. No real money involved.
      </p>
    </div>
  );
}