import { useState } from 'react';
import { getOutcomeLabel, formatBalance } from '../utils/formatting';

export function MarketResolution({ market, contractHook, onResolved }) {
  const [isResolving, setIsResolving] = useState(false);
  const [isDisputing, setIsDisputing] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);
  const [disputeData, setDisputeData] = useState({
    claimedWinner: -1,
    stake: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleResolve = async () => {
    setIsResolving(true);
    setError('');
    setSuccess('');

    try {
      await contractHook.resolveMarket(market.id);
      setSuccess('Market resolved successfully!');
      
      if (onResolved) {
        onResolved();
      }
    } catch (err) {
      setError(err.message || 'Failed to resolve market');
    } finally {
      setIsResolving(false);
    }
  };

  const handleDispute = async () => {
    if (disputeData.claimedWinner === -1) {
      setError('Please select the correct winner');
      return;
    }

    if (!disputeData.stake || parseFloat(disputeData.stake) <= 0) {
      setError('Please enter a valid stake amount');
      return;
    }

    setIsDisputing(true);
    setError('');
    setSuccess('');

    try {
      const stake = Math.floor(parseFloat(disputeData.stake));
      await contractHook.disputeMarket(market.id, disputeData.claimedWinner, stake);
      setSuccess('Dispute submitted successfully!');
      
      setDisputeData({ claimedWinner: -1, stake: '' });
      
      if (onResolved) {
        onResolved();
      }
    } catch (err) {
      setError(err.message || 'Failed to dispute market');
    } finally {
      setIsDisputing(false);
    }
  };

  const handleClaimWinnings = async () => {
    setIsClaiming(true);
    setError('');
    setSuccess('');

    try {
      const amount = await contractHook.claimWinnings(market.id);
      setSuccess(`Claimed $${formatBalance(amount)} successfully!`);
      
      if (onResolved) {
        onResolved();
      }
    } catch (err) {
      setError(err.message || 'Failed to claim winnings');
    } finally {
      setIsClaiming(false);
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
      <h3 className="text-xl font-bold text-white mb-4">Market Actions</h3>

      {/* Success/Error Messages */}
      {success && (
        <div className="mb-4 p-3 bg-green-500/20 border border-green-500 rounded-lg text-green-400 text-sm">
          {success}
        </div>
      )}
      
      {error && (
        <div className="mb-4 p-3 bg-red-500/20 border border-red-500 rounded-lg text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Resolve Market (if open) */}
      {market.status === 'open' && (
        <div className="mb-4">
          <p className="text-sm text-gray-400 mb-3">
            Resolve this market using AI to determine the winner from the match result.
          </p>
          <button
            onClick={handleResolve}
            disabled={isResolving}
            className="w-full py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
          >
            {isResolving ? 'Resolving...' : 'Resolve Market'}
          </button>
        </div>
      )}

      {/* Dispute Market (if resolved) */}
      {market.status === 'resolved' && (
        <div className="mb-4">
          <p className="text-sm text-gray-400 mb-3">
            Think the result is wrong? Dispute it by staking play-money.
          </p>
          
          <div className="space-y-3 mb-3">
            {/* Select Correct Winner */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Correct Winner
              </label>
              <select
                value={disputeData.claimedWinner}
                onChange={(e) => setDisputeData(prev => ({ ...prev, claimedWinner: parseInt(e.target.value) }))}
                className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                disabled={isDisputing}
              >
                <option value={-1}>Select outcome</option>
                <option value={0}>Draw</option>
                <option value={1}>{market.team1}</option>
                <option value={2}>{market.team2}</option>
              </select>
            </div>

            {/* Stake Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Stake Amount
              </label>
              <input
                type="number"
                value={disputeData.stake}
                onChange={(e) => setDisputeData(prev => ({ ...prev, stake: e.target.value }))}
                placeholder="Enter stake amount"
                className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                disabled={isDisputing}
              />
              <p className="mt-1 text-xs text-gray-500">
                You'll lose this stake if the dispute is rejected, or win double if upheld.
              </p>
            </div>
          </div>

          <button
            onClick={handleDispute}
            disabled={isDisputing}
            className="w-full py-3 bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
          >
            {isDisputing ? 'Submitting Dispute...' : 'Dispute Market'}
          </button>
        </div>
      )}

      {/* Claim Winnings (if resolved) */}
      {market.status === 'resolved' && (
        <div className="pt-4 border-t border-gray-700">
          <p className="text-sm text-gray-400 mb-3">
            If you have winning bets on this market, claim them here.
          </p>
          <button
            onClick={handleClaimWinnings}
            disabled={isClaiming}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
          >
            {isClaiming ? 'Claiming...' : 'Claim Winnings'}
          </button>
        </div>
      )}

      {/* Current Winner Info */}
      {market.status === 'resolved' && (
        <div className="mt-4 p-4 bg-gray-900 rounded-lg">
          <div className="text-sm text-gray-400 mb-1">Current Winner:</div>
          <div className="text-lg font-bold text-white">
            {getOutcomeLabel(market.winner, market.team1, market.team2)}
          </div>
        </div>
      )}
    </div>
  );
}