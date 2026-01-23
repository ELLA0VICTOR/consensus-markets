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
    <div className="glass-card rounded-xl p-6 border border-white/10 space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-xl font-bold text-white tracking-tight mb-1">Market Actions</h3>
        <p className="text-sm text-gray-400">Resolve, dispute, or claim winnings</p>
      </div>

      {/* Success Message */}
      {success && (
        <div className="p-4 rounded-xl bg-success/10 border border-success/30 animate-scale-in">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-success flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <p className="text-sm text-success font-medium">{success}</p>
          </div>
        </div>
      )}
      
      {/* Error Message */}
      {error && (
        <div className="p-4 rounded-xl bg-error/10 border border-error/30 animate-scale-in">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-error flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <p className="text-sm text-error">{error}</p>
          </div>
        </div>
      )}

      {/* RESOLVE MARKET (if open) */}
      {market.status === 'open' && (
        <div className="p-5 rounded-xl bg-white/5 border border-white/10 space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-success" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-white mb-1">AI Resolution</h4>
              <p className="text-sm text-gray-400 leading-relaxed">
                Trigger AI-powered match result verification to determine the winner
              </p>
            </div>
          </div>
          
          <button
            onClick={handleResolve}
            disabled={isResolving}
            className="w-full py-3 bg-success text-white rounded-lg font-semibold
                     hover:bg-success/90 disabled:bg-white/10 disabled:text-gray-600 
                     disabled:cursor-not-allowed transition-all duration-200
                     flex items-center justify-center gap-2"
          >
            {isResolving ? (
              <>
                <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Resolving...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Resolve Market
              </>
            )}
          </button>
        </div>
      )}

      {/* DISPUTE MARKET (if resolved) */}
      {market.status === 'resolved' && (
        <div className="p-5 rounded-xl bg-white/5 border border-white/10 space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-warning" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-white mb-1">Dispute Resolution</h4>
              <p className="text-sm text-gray-400 leading-relaxed">
                Challenge the result by staking play-money
              </p>
            </div>
          </div>
          
          <div className="space-y-3">
            {/* Select Correct Winner */}
            <div>
              <label className="block text-xs uppercase tracking-wider text-gray-500 font-medium mb-2">
                Correct Winner
              </label>
              <select
                value={disputeData.claimedWinner}
                onChange={(e) => setDisputeData(prev => ({ ...prev, claimedWinner: parseInt(e.target.value) }))}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white
                         focus:outline-none focus:border-white/30 focus:bg-white/10 transition-all duration-200"
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
              <label className="block text-xs uppercase tracking-wider text-gray-500 font-medium mb-2">
                Stake Amount
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-mono">
                  $
                </div>
                <input
                  type="number"
                  value={disputeData.stake}
                  onChange={(e) => setDisputeData(prev => ({ ...prev, stake: e.target.value }))}
                  placeholder="0.00"
                  className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg 
                           text-white placeholder-gray-600 font-mono
                           focus:outline-none focus:border-white/30 focus:bg-white/10
                           transition-all duration-200"
                  disabled={isDisputing}
                />
              </div>
              <p className="mt-2 text-xs text-gray-500 leading-relaxed">
                Risk: Lose stake if rejected • Reward: Double stake if upheld
              </p>
            </div>
          </div>

          <button
            onClick={handleDispute}
            disabled={isDisputing}
            className="w-full py-3 bg-warning text-black rounded-lg font-semibold
                     hover:bg-warning/90 disabled:bg-white/10 disabled:text-gray-600 
                     disabled:cursor-not-allowed transition-all duration-200
                     flex items-center justify-center gap-2"
          >
            {isDisputing ? (
              <>
                <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Submitting...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                Submit Dispute
              </>
            )}
          </button>
        </div>
      )}

      {/* CLAIM WINNINGS (if resolved) */}
      {market.status === 'resolved' && (
        <div className="p-5 rounded-xl bg-info/10 border border-info/30 space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-info/20 flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-info" fill="currentColor" viewBox="0 0 20 20">
                <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-white mb-1">Claim Winnings</h4>
              <p className="text-sm text-gray-400 leading-relaxed">
                Collect your share if you placed winning bets
              </p>
            </div>
          </div>
          
          <button
            onClick={handleClaimWinnings}
            disabled={isClaiming}
            className="w-full py-3 bg-info text-white rounded-lg font-semibold
                     hover:bg-info/90 disabled:bg-white/10 disabled:text-gray-600 
                     disabled:cursor-not-allowed transition-all duration-200
                     flex items-center justify-center gap-2"
          >
            {isClaiming ? (
              <>
                <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Claiming...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
                Claim Winnings
              </>
            )}
          </button>
        </div>
      )}

      {/* Current Winner Display */}
      {market.status === 'resolved' && (
        <div className="p-4 rounded-xl bg-white/5 border border-white/10">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider text-gray-500 font-medium">
              Resolved Winner
            </span>
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-info" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="font-bold font-mono text-white">
                {getOutcomeLabel(market.winner, market.team1, market.team2)}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}