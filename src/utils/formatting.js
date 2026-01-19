// Format large numbers with commas
export function formatNumber(num) {
  if (!num && num !== 0) return '0';
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

// Format play-money balance
export function formatBalance(balance) {
  if (!balance && balance !== 0) return '0';
  return formatNumber(balance);
}

// Format odds (e.g., "2.50")
export function formatOdds(odds) {
  if (!odds) return '0.00';
  const num = parseFloat(odds);
  return num.toFixed(2);
}

// Format date to readable string
export function formatDate(dateString) {
  if (!dateString) return 'Unknown';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// Format date to short format (e.g., "Jan 18")
export function formatDateShort(dateString) {
  if (!dateString) return 'Unknown';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

// Format time remaining until match
export function formatTimeRemaining(dateString) {
  if (!dateString) return 'Unknown';
  const date = new Date(dateString);
  const now = new Date();
  const diff = date - now;

  if (diff < 0) {
    return 'Match started';
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  if (days > 0) {
    return `${days}d ${hours}h`;
  } else if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else {
    return `${minutes}m`;
  }
}

// Shorten address (e.g., 0x1234...5678)
export function shortenAddress(address) {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

// Get outcome label
export function getOutcomeLabel(outcome, team1, team2) {
  switch (outcome) {
    case 0:
      return 'Draw';
    case 1:
      return team1 || 'Team 1';
    case 2:
      return team2 || 'Team 2';
    default:
      return 'Unknown';
  }
}

// Get status badge color
export function getStatusColor(status) {
  switch (status) {
    case 'open':
      return 'bg-green-500';
    case 'locked':
      return 'bg-yellow-500';
    case 'resolved':
      return 'bg-blue-500';
    case 'disputed':
      return 'bg-red-500';
    default:
      return 'bg-gray-500';
  }
}

// Calculate potential payout
export function calculatePayout(amount, odds) {
  if (!amount || !odds) return 0;
  return Math.floor(parseFloat(amount) * parseFloat(odds));
}

// Calculate implied probability from odds
export function calculateImpliedProbability(odds) {
  if (!odds) return 0;
  return (1 / parseFloat(odds)) * 100;
}

// Format percentage
export function formatPercentage(value) {
  if (!value && value !== 0) return '0%';
  return `${value.toFixed(1)}%`;
}