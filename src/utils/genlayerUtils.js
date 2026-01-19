
/**
 * Convert GenLayer Map objects to plain JavaScript objects
 * Also handles BigInt conversion and nested structures
 */
export function convertGenLayerData(data) {
  // Handle null/undefined
  if (data === null || data === undefined) {
    return data;
  }

  // Handle Map objects (GenLayer dataclasses become Maps)
  if (data instanceof Map) {
    const obj = {};
    for (const [key, value] of data.entries()) {
      obj[key] = convertGenLayerData(value);
    }
    return obj;
  }

  // Handle Arrays
  if (Array.isArray(data)) {
    return data.map(item => convertGenLayerData(item));
  }

  // Handle BigInt (convert to string for safe serialization, or number if small enough)
  if (typeof data === 'bigint') {
    // For values that fit in Number.MAX_SAFE_INTEGER, convert to number
    // Otherwise keep as string
    if (data <= Number.MAX_SAFE_INTEGER && data >= Number.MIN_SAFE_INTEGER) {
      return Number(data);
    }
    return data.toString();
  }

  // Handle plain objects recursively
  if (typeof data === 'object' && data.constructor === Object) {
    const obj = {};
    for (const key in data) {
      if (data.hasOwnProperty(key)) {
        obj[key] = convertGenLayerData(data[key]);
      }
    }
    return obj;
  }

  // Handle special GenLayer types
  if (data && typeof data === 'object') {
    // Check if it has a toString method that might be useful
    // This handles CalldataAddress and similar types
    if (typeof data.toString === 'function' && data.constructor.name !== 'Object') {
      // Try to extract address string if it's an address-like object
      const str = data.toString();
      if (str.startsWith('0x')) {
        return str;
      }
    }
  }

  // Return primitive values as-is
  return data;
}

/**
 * Convert a Market object from GenLayer format to React format
 * Ensures all expected fields exist with proper types
 */
export function convertMarket(marketData) {
  if (!marketData) return null;

  const market = convertGenLayerData(marketData);

  // Ensure all expected fields exist with defaults
  return {
    id: market.id ?? 0,
    creator: market.creator ?? '0x0000000000000000000000000000000000000000',
    team1: market.team1 ?? '',
    team2: market.team2 ?? '',
    league: market.league ?? '',
    match_date: market.match_date ?? '',
    resolution_url: market.resolution_url ?? '',
    odds_team1: market.odds_team1 ?? '0.00',
    odds_draw: market.odds_draw ?? '0.00',
    odds_team2: market.odds_team2 ?? '0.00',
    status: market.status ?? 'unknown',
    winner: market.winner ?? -1,
    total_pool: market.total_pool ?? 0,
    created_at: market.created_at ?? 0,
  };
}

/**
 * Convert a Bet object from GenLayer format
 */
export function convertBet(betData) {
  if (!betData) return null;

  const bet = convertGenLayerData(betData);

  return {
    user: bet.user ?? '0x0000000000000000000000000000000000000000',
    market_id: bet.market_id ?? 0,
    outcome: bet.outcome ?? -1,
    amount: bet.amount ?? 0,
    potential_payout: bet.potential_payout ?? 0,
    timestamp: bet.timestamp ?? 0,
    claimed: bet.claimed ?? false,
  };
}

/**
 * Convert a Dispute object from GenLayer format
 */
export function convertDispute(disputeData) {
  if (!disputeData) return null;

  const dispute = convertGenLayerData(disputeData);

  return {
    disputer: dispute.disputer ?? '0x0000000000000000000000000000000000000000',
    market_id: dispute.market_id ?? 0,
    stake: dispute.stake ?? 0,
    claimed_winner: dispute.claimed_winner ?? -1,
    status: dispute.status ?? 'unknown',
    created_at: dispute.created_at ?? 0,
  };
}

/**
 * Format an address for GenLayer contract calls
 * Ensures address is in the correct format
 */
export function formatAddressForContract(address) {
  if (!address) return null;
  
  // If it's already a string starting with 0x, use it
  if (typeof address === 'string' && address.startsWith('0x')) {
    return address;
  }
  
  // If it's an object with an address property
  if (typeof address === 'object' && address.address) {
    return address.address;
  }
  
  // Try toString
  if (typeof address.toString === 'function') {
    return address.toString();
  }
  
  return address;
}