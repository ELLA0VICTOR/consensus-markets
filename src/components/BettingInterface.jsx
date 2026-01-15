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

  if (market.status !== 'open') {
    return (
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <div className="text-center text-gray-400">
          This market is {market.status} and not accepting bets.
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
      <h3 className="text-xl font-bold text-white mb-4">Place Your Bet</h3>

      {/* Outcome Selection */}
      <div className="space-y-3 mb-6">
        {outcomes.map((outcome) => (
          <button
            key={outcome.id}
            onClick={() => setSelectedOutcome(outcome.id)}
            className={`w-full p-4 rounded-lg border-2 transition-all ${
              selectedOutcome === outcome.id
                ? 'border-blue-500 bg-blue-500/20'
                : 'border-gray-700 bg-gray-900 hover:border-gray-600'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-semibold text-white">{outcome.label}</span>
              <span className="text-2xl font-bold text-green-400">
                {formatOdds(outcome.odds)}
              </span>
            </div>
          </button>
        ))}
      </div>

      {/* Bet Amount Input */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Bet Amount
        </label>
        <input
          type="number"
          value={betAmount}
          onChange={(e) => setBetAmount(e.target.value)}
          placeholder="Enter amount"
          className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
          disabled={isPlacing}
        />
      </div>

      {/* Potential Payout */}
      {betAmount && selectedOutcome !== null && (
        <div className="mb-4 p-4 bg-gray-900 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-gray-400">Potential Payout:</span>
            <span className="text-xl font-bold text-green-400">
              ${formatBalance(getPotentialPayout())}
            </span>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 bg-red-500/20 border border-red-500 rounded-lg text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Place Bet Button */}
      <button
        onClick={handlePlaceBet}
        disabled={isPlacing || !betAmount || selectedOutcome === null}
        className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
      >
        {isPlacing ? 'Placing Bet...' : 'Place Bet'}
      </button>
    </div>
  );
}