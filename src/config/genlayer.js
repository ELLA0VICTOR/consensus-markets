// GenLayer configuration
export const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS || '0x1B2450Cfef068e70B150D7f777437cEc1F35f1D7';

// Network configurations
export const NETWORKS = {
  STUDIO: {
    name: 'GenLayer Studio',
    rpcUrl: 'https://studio.genlayer.com/api',
    chainId: 61999,
    currency: 'GEN',
  },
  TESTNET: {
    name: 'GenLayer Asimov Testnet',
    rpcUrl: 'https://genlayer-testnet.rpc.caldera.xyz/http',
    chainId: 4221,
    currency: 'GEN',
    explorer: 'https://genlayer-testnet.explorer.caldera.xyz',
  },
};

// Default network (change to TESTNET if deploying to testnet)
export const ACTIVE_NETWORK = NETWORKS.STUDIO;

export const GENLAYER_CONFIG = {
  rpcUrl: import.meta.env.VITE_GENLAYER_RPC_URL || ACTIVE_NETWORK.rpcUrl,
  chainId: import.meta.env.VITE_GENLAYER_CHAIN_ID || ACTIVE_NETWORK.chainId,
};

// Market status constants
export const MARKET_STATUS = {
  OPEN: 'open',
  LOCKED: 'locked',
  RESOLVED: 'resolved',
  DISPUTED: 'disputed',
};

// Outcome constants
export const OUTCOMES = {
  DRAW: 0,
  TEAM1: 1,
  TEAM2: 2,
};

export const OUTCOME_LABELS = {
  0: 'Draw',
  1: 'Team 1 Win',
  2: 'Team 2 Win',
};

// Dispute status constants
export const DISPUTE_STATUS = {
  PENDING: 'pending',
  UPHELD: 'upheld',
  REJECTED: 'rejected',
};