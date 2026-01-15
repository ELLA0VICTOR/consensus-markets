# ConsensusMarkets

AI-powered sports prediction markets built on GenLayer. Create markets, place bets with play-money, and let AI resolve outcomes through web scraping and consensus.

## Features

- **AI-Powered Odds Generation**: LLM generates realistic betting odds for matches
- **Automated Market Resolution**: AI scrapes match results from trusted sources (BBC Sport)
- **Dispute Mechanism**: Economic disputes with automated AI adjudication
- **Play-Money Only**: No real money involved - perfect for learning and entertainment
- **Nondeterministic Consensus**: GenLayer's equivalence principle ensures fair outcomes

## Technology Stack

**Smart Contract**
- GenLayer Intelligent Contracts (Python)
- LLM integration via `gl.exec_prompt`
- Web scraping via `gl.get_webpage`
- Nondeterministic consensus via `gl.eq_principle_strict_eq`

**Frontend**
- React 19
- Vite
- TailwindCSS v3
- GenLayerJS SDK

## Project Structure

```
consensusmarkets/
├── contracts/
│   └── prediction_market.py           # Main Intelligent Contract
├── frontend/
│   ├── src/
│   │   ├── components/                # React components
│   │   ├── config/                    # Configuration
│   │   ├── hooks/                     # Custom React hooks
│   │   ├── utils/                     # Utility functions
│   │   ├── App.jsx                    # Main app component
│   │   ├── main.jsx                   # Entry point
│   │   └── index.css                  # Global styles
│   ├── public/
│   │   └── fixtures.json              # Upcoming fixtures
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── index.html
├── fixtures/
│   └── fixtures.json                  # Fixtures data
├── .env.example
└── README.md
```

## Quick Start

### Prerequisites

- Node.js 18+ and npm
- GenLayer Studio account (https://studio.genlayer.com)
- MetaMask with GenLayer network configured

### 1. Deploy Smart Contract

1. Go to **GenLayer Studio**: https://studio.genlayer.com
2. Create a new project or open existing one
3. Copy the contents of `contracts/prediction_market.py`
4. Paste into GenLayer Studio editor
5. Set constructor parameters:
   - `initial_balance`: `10000` (play-money for new users)
   - `protocol_fee_bps`: `250` (2.5% fee)
6. Click **Deploy**
7. Copy the deployed contract address

### 2. Configure Frontend

```bash
# Copy environment template
cp .env.example .env

# Edit .env and add your contract address
# VITE_CONTRACT_ADDRESS=0x... (paste your address here)
```

### 3. Run Frontend

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Visit `http://localhost:3000`

## Networks

### GenLayer Studio (Default - Local Development)
- Network Name: GenLayer Studio
- RPC URL: `https://studio.genlayer.com/api`
- Chain ID: `61999`
- Currency: GEN

### GenLayer Asimov Testnet (Public Testnet)
- Network Name: GenLayer Asimov Testnet
- RPC URL: `https://genlayer-testnet.rpc.caldera.xyz/http`
- Chain ID: `4221`
- Currency: GEN
- Explorer: https://genlayer-testnet.explorer.caldera.xyz

To switch networks, update your `.env` file with the appropriate RPC URL and Chain ID.

## Smart Contract

### Constructor Parameters

When deploying from GenLayer Studio, you'll need to provide:
- `initial_balance` (u256): Play-money balance for new users (recommended: 10000)
- `protocol_fee_bps` (u16): Protocol fee in basis points (recommended: 250 = 2.5%)

### Key Methods

**Write Methods:**
- `create_market(team1, team2, league, match_date, resolution_url, generate_odds, fixture_id)` - Create a new prediction market
- `place_bet(market_id, outcome, amount)` - Place a bet on an outcome
- `resolve_market(market_id)` - Resolve market using AI
- `dispute_market(market_id, claimed_winner, stake)` - Dispute a market outcome
- `claim_winnings(market_id)` - Claim winnings from resolved markets

**View Methods:**
- `get_market(market_id)` - Get market details
- `get_user_balance(user)` - Get user's play-money balance
- `get_market_bets(market_id)` - Get all bets for a market
- `get_user_bets(user)` - Get all bets by a user
- `get_market_count()` - Get total number of markets
- `get_dispute(market_id)` - Get dispute details

### Storage Types

The contract uses GenLayer-specific storage types:
- `TreeMap` for key-value storage (instead of `dict`)
- `DynArray` for dynamic arrays (instead of `list`)
- Sized integers (`u256`, `i8`) for type safety

### LLM Integration

The contract uses three AI-powered features:

1. **Odds Generation**: Analyzes match details to generate fair betting odds
2. **Market Resolution**: Scrapes match results from resolution URLs
3. **Dispute Adjudication**: Re-evaluates disputed outcomes

All LLM operations use `gl.eq_principle_strict_eq` for nondeterministic consensus.

## Frontend Features

### Components

- **WalletConnect**: Shows connection status and balance
- **MarketCard**: Displays market information
- **BettingInterface**: Place bets on markets
- **CreateMarket**: Create new markets (from fixtures or custom)
- **FixtureList**: Browse upcoming fixtures
- **MarketResolution**: Resolve markets and dispute outcomes

### Custom Hooks

- `useContract`: GenLayerJS integration for contract interaction
- `useFixtures`: Fetches and manages fixtures data
- `useMarkets`: Polls and manages market state

## How It Works

### 1. Create Market

Users can create markets from:
- **Curated Fixtures**: Pre-populated match data from `fixtures.json`
- **Custom Matches**: Manual entry of match details

Markets can optionally use AI to generate realistic odds.

### 2. Place Bets

Users bet play-money on outcomes:
- Team 1 Win
- Draw
- Team 2 Win

Potential payouts are calculated based on odds.

### 3. Resolve Market

After the match, anyone can trigger resolution. The AI:
1. Fetches content from the resolution URL
2. Extracts the match result
3. Determines the winner
4. Validators reach consensus via equivalence principle

### 4. Disputes

If someone believes the resolution is wrong:
1. Submit a dispute with a stake
2. AI re-evaluates with fresh data
3. If upheld: disputer wins 2x stake
4. If rejected: disputer loses stake

### 5. Claim Winnings

Winners claim their payouts (minus 2.5% protocol fee).

## Configuration

### Contract Parameters

- `initial_balance`: Play-money given to new users (default: 10,000)
- `protocol_fee_bps`: Protocol fee in basis points (default: 250 = 2.5%)

### Resolution URLs

Markets use BBC Sport URLs for resolution:
```
https://www.bbc.com/sport/football/scores-fixtures/YYYY-MM-DD
```

The AI extracts final scores from these pages.

## Development

### Adding Fixtures

Edit `fixtures/fixtures.json` and `frontend/public/fixtures.json`:

```json
{
  "id": "unique_id",
  "sport": "Football",
  "league": "League Name",
  "team1": "Team 1",
  "team2": "Team 2",
  "date": "2025-01-20T15:00:00Z",
  "resolution_url": "https://www.bbc.com/sport/..."
}
```

### Testing Workflow

1. **Deploy to GenLayer Studio**: Deploy contract from studio.genlayer.com
2. **Copy Contract Address**: Paste into `.env` file
3. **Start Frontend**: `npm run dev` in frontend directory
4. **Create Markets**: Test market creation with fixtures
5. **Place Bets**: Test betting with different outcomes
6. **Resolution**: Test AI-powered resolution
7. **Disputes**: Test dispute mechanism

### Building for Production

```bash
cd frontend
npm run build
```

Output will be in `frontend/dist/`

### Switching Networks

To switch from Studio to Testnet:

1. Update `.env`:
```bash
VITE_GENLAYER_RPC_URL=https://genlayer-testnet.rpc.caldera.xyz/http
VITE_GENLAYER_CHAIN_ID=4221
```

2. Deploy contract to testnet via GenLayer Studio
3. Update `VITE_CONTRACT_ADDRESS` with new address

## Important Notes

### Play-Money Only
This is a play-money prediction market for educational and entertainment purposes. No real money is involved.

### AI Limitations
- Resolution accuracy depends on webpage structure
- BBC Sport URLs may change format
- Always verify AI decisions for important outcomes

### GenLayer Specifics
- Use `TreeMap` instead of `dict`
- Use `DynArray` instead of `list`
- Use sized integers (`u256`, `i8`)
- All LLM operations must be in functions passed to equivalence principles

## Troubleshooting

### Contract Deployment Fails in Studio
- Verify contract syntax (no `dict`/`list`, use `TreeMap`/`DynArray`)
- Ensure dependencies header is present: `# { "Depends": "py-genlayer:test" }`
- Check constructor parameters are correct types

### Frontend Can't Connect
- Verify contract address in `.env` matches deployed address
- Check RPC URL and Chain ID match your network
- Ensure GenLayer network is added to MetaMask

### Resolution Fails
- Verify resolution URL is accessible
- Check if match has been played
- Ensure URL format matches expected structure (BBC Sport)

### "Client not initialized" Error
- Wait a few seconds for GenLayerJS to initialize
- Check browser console for connection errors
- Verify RPC URL is accessible

## Deployment Checklist

- [ ] Deploy contract from GenLayer Studio
- [ ] Copy contract address
- [ ] Create `.env` file from `.env.example`
- [ ] Paste contract address in `.env`
- [ ] Verify network settings (Studio or Testnet)
- [ ] Install frontend dependencies (`npm install`)
- [ ] Start frontend (`npm run dev`)
- [ ] Test wallet connection
- [ ] Create test market
- [ ] Place test bet
- [ ] Test market resolution

## Future Enhancements

- Multi-sport support (basketball, tennis, etc.)
- Live odds updates based on betting activity
- Market maker for better liquidity
- Historical statistics and analytics
- Social features (following, leaderboards)
- Mobile app

## License

MIT

## Contributing

Contributions welcome! Please open an issue or PR.

## Support

For issues or questions:
- Open a GitHub issue
- Check GenLayer documentation: https://docs.genlayer.com
- Visit GenLayer Studio: https://studio.genlayer.com

---

Built with ❤️ on GenLayer