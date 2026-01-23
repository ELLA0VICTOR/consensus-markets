# ConsensusMarkets

AI-powered sports prediction markets built on GenLayer. Create markets, place bets with play-money, and let AI resolve outcomes through web scraping and nondeterministic consensus.

## Features

- **AI-Powered Odds Generation**: LLM generates realistic betting odds for matches using GenLayer's non-comparative equivalence principle
- **Automated Market Resolution**: AI scrapes match results from trusted sources (BBC Sport) and determines winners through consensus
- **Dispute Mechanism**: Economic disputes with automated AI adjudication and re-evaluation
- **Play-Money Only**: No real money involved - perfect for learning and entertainment
- **Nondeterministic Consensus**: GenLayer's `gl.eq_principle.prompt_non_comparative` ensures fair, decentralized outcomes
- **Real-time Balance Tracking**: Persistent balance management across sessions with automatic contract synchronization

## Technology Stack

### Smart Contract
- **GenLayer Intelligent Contracts** (Python)
- LLM integration via `gl.eq_principle.prompt_non_comparative`
- Web scraping via `gl.nondet.web.render`
- Storage management with `gl.storage.copy_to_memory` for nondeterministic operations
- Type-safe storage using `TreeMap`, `DynArray`, and sized integers (`u256`, `i8`)

### Frontend
- **React 19**
- **Vite**
- **TailwindCSS v3**
- **GenLayerJS SDK**
- Custom hooks for contract interaction and state management
- Wallet integration (MetaMask + GenLayer native wallet)

## Project Structure

```
consensusmarkets/
├── contracts/
│   └── prediction_market.py              # Main Intelligent Contract
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── MarketCard.jsx            # Display market information
│   │   │   ├── CreateMarket.jsx          # Market creation interface
│   │   │   ├── BettingInterface.jsx      # Place bets UI
│   │   │   ├── FixtureList.jsx           # Browse upcoming fixtures
│   │   │   ├── MarketResolution.jsx      # Resolve markets & disputes
│   │   │   ├── WalletConnect.jsx         # Connection status & balance
│   │   │   └── WalletButton.jsx          # Wallet connection button
│   │   │
│   │   ├── contexts/
│   │   │   └── WalletContext.jsx         # Global wallet state management
│   │   │
│   │   ├── config/
│   │   │   └── genlayer.js               # Network & contract configuration
│   │   │
│   │   ├── hooks/
│   │   │   ├── useContract.js            # Contract interaction hook
│   │   │   ├── useFixtures.js            # Fixtures data management
│   │   │   └── useMarkets.js             # Market state polling
│   │   │
│   │   ├── utils/
│   │   │   ├── formatting.js             # Display formatting helpers
│   │   │   └── genlayerUtils.js          # GenLayer data conversion
│   │   │
│   │   ├── App.jsx                       # Main application component
│   │   ├── main.jsx                      # Entry point
│   │   └── index.css                     # Global styles
│   │
│   ├── public/
│   │   └── fixtures.json                 # Curated upcoming fixtures
│   │
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── package.json
│
├── fixtures/
│   └── fixtures.json                     # Fixtures data source
│
├── scripts/
│   ├── deploy.py                         # Contract deployment script
│   └── setup_account.py                  # Account setup utilities
│
├── .env.example                          # Environment variables template
└── README.md                             # This file
```

## Quick Start

### Prerequisites

- **Node.js 18+** and npm
- **GenLayer Studio account**: https://studio.genlayer.com
- **MetaMask** with GenLayer network configured (optional - built-in wallet available)

### 1. Deploy Smart Contract

1. Go to **GenLayer Studio**: https://studio.genlayer.com
2. Create a new project or open existing one
3. Copy the contents of `contracts/prediction_market.py`
4. Paste into GenLayer Studio editor
5. Set constructor parameters:
   - `initial_balance`: `10000` (play-money for new users)
   - `protocol_fee_bps`: `250` (2.5% fee)
6. Click **Deploy**
7. **Copy the deployed contract address**

### 2. Configure Frontend

```bash
# Copy environment template
cp .env.example .env

# Edit .env and add your contract address
# VITE_CONTRACT_ADDRESS=0x... (paste your deployed contract address)
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

Visit **http://localhost:5173**

## Networks

### GenLayer Studio (Default - Local Development)
- **Network Name**: GenLayer Studio
- **RPC URL**: `https://studio.genlayer.com/api`
- **Chain ID**: `61999`
- **Currency**: GEN

### GenLayer Asimov Testnet (Public Testnet)
- **Network Name**: GenLayer Asimov Testnet
- **RPC URL**: `https://genlayer-testnet.rpc.caldera.xyz/http`
- **Chain ID**: `4221`
- **Currency**: GEN
- **Explorer**: https://genlayer-testnet.explorer.caldera.xyz

To switch networks, update your `.env` file with the appropriate RPC URL and Chain ID.

## Smart Contract

### Constructor Parameters

When deploying from GenLayer Studio:

- **`initial_balance`** (int): Play-money balance for new users (recommended: `10000`)
- **`protocol_fee_bps`** (int): Protocol fee in basis points (recommended: `250` = 2.5%)

### Key Methods

#### Write Methods (Modify State)

- **`create_market(team1, team2, league, match_date, resolution_url, generate_odds, fixture_id)`**  
  Create a new prediction market with optional AI-generated odds

- **`place_bet(market_id, outcome, amount)`**  
  Place a bet on an outcome (0=draw, 1=team1, 2=team2)

- **`resolve_market(market_id)`**  
  Resolve market using AI consensus - triggers web scraping and LLM evaluation

- **`dispute_market(market_id, claimed_winner, stake)`**  
  Dispute a market outcome with economic stake

- **`claim_winnings(market_id)`**  
  Claim winnings from resolved markets (minus 2.5% protocol fee)

#### View Methods (Read-Only)

- **`get_market(market_id)`** → Market details
- **`get_user_balance(user)`** → User's play-money balance
- **`get_market_bets(market_id)`** → All bets for a market
- **`get_user_bets(user)`** → All bets by a user
- **`get_market_count()`** → Total number of markets
- **`get_dispute(market_id)`** → Dispute details

### Storage Types

The contract uses **GenLayer-specific storage types**:

- **`TreeMap[K, V]`** for key-value storage (replaces Python `dict`)
- **`DynArray[T]`** for dynamic arrays (replaces Python `list`)
- **Sized integers**: `u256` (unsigned 256-bit), `i8` (signed 8-bit)
- **`@allow_storage` decorator** for custom dataclasses

### Critical Implementation Details

#### Storage Access in Nondeterministic Blocks

**WARNING**: Storage objects cannot be accessed directly inside nondeterministic blocks (lambda functions passed to equivalence principles).

**Solution**: Use `gl.storage.copy_to_memory()` before nondeterministic operations:

```python
# WRONG - Causes SystemError: 6: forbidden
result = gl.eq_principle.prompt_non_comparative(
    lambda: f"Match: {market.team1} vs {market.team2}"  # Direct storage access
)

# CORRECT - Copy to memory first
market_memory = gl.storage.copy_to_memory(market)
result = gl.eq_principle.prompt_non_comparative(
    lambda: f"Match: {market_memory.team1} vs {market_memory.team2}"
)
```

This pattern is used in:
- `resolve_market()` - Web scraping and result extraction
- `dispute_market()` - Re-evaluation and adjudication

## AI Integration

The contract uses **three AI-powered features** with GenLayer's non-comparative equivalence principle:

### 1. Odds Generation
Analyzes match details to generate fair, realistic betting odds using `gl.eq_principle.prompt_non_comparative`:

```python
task="Generate realistic betting odds for this football match in JSON format"
criteria="""
    Output must be valid JSON with keys: odds_team1, odds_draw, odds_team2
    All odds must be decimal strings between 1.50 and 5.00
    Total implied probability should be 100-110% (bookmaker margin)
"""
```

### 2. Market Resolution
Scrapes match results from resolution URLs using `gl.nondet.web.render()` and determines winner:

```python
task="Extract match result and determine winner from webpage content"
criteria="""
    Output must be valid JSON with keys: winner, score_team1, score_team2
    winner must be -1, 0, 1, or 2
    Scores must be integers (-1 if not played)
"""
```

### 3. Dispute Adjudication
Re-evaluates disputed outcomes with fresh data:

```python
task="Re-evaluate match result and determine if dispute is valid"
criteria="""
    Output must be valid JSON with keys: correct_winner, dispute_valid, reasoning
    correct_winner must be -1, 0, 1, or 2
    dispute_valid must be boolean
"""
```

**All operations use `gl.eq_principle.prompt_non_comparative`** for validator consensus without requiring identical outputs.

## Frontend Features

### Components

- **WalletConnect**: Shows connection status, network, and real-time balance from contract
- **WalletButton**: Unified wallet connection (MetaMask + GenLayer native)
- **MarketCard**: Displays market information with live status updates
- **BettingInterface**: Place bets with real-time odds and balance validation
- **CreateMarket**: Create markets from fixtures or custom input with AI odds option
- **FixtureList**: Browse curated upcoming fixtures
- **MarketResolution**: Resolve markets and submit disputes

### Custom Hooks

- **`useContract`**: GenLayerJS integration with automatic balance syncing
  - Fetches real balance from contract (no hardcoded values)
  - Auto-refreshes balance after transactions
  - Handles 502 errors with retry logic
  
- **`useFixtures`**: Fetches and manages fixtures data from public JSON

- **`useMarkets`**: Polls contract for market state updates

### Wallet Integration

Supports **two wallet types**:

1. **MetaMask**: Industry-standard browser extension
2. **GenLayer Native**: Built-in wallet via GenLayerJS

Wallet state managed globally via `WalletContext`.

## How It Works

### 1. Create Market

Users can create markets from:

- **Curated Fixtures**: Pre-populated match data from `fixtures.json`
- **Custom Matches**: Manual entry of match details

Markets can optionally use AI to generate realistic odds via LLM.

### 2. Place Bets

Users bet play-money on outcomes:
- **Team 1 Win** (outcome = 1)
- **Draw** (outcome = 0)
- **Team 2 Win** (outcome = 2)

Potential payouts calculated based on odds. Balance deducted immediately.

### 3. Resolve Market

After the match, anyone can trigger resolution:

1. AI fetches content from `resolution_url` via `gl.nondet.web.render()`
2. LLM extracts match result from webpage text
3. Validators reach consensus via `gl.eq_principle.prompt_non_comparative`
4. Winner determined, market status changes to "resolved"

### 4. Disputes

If resolution appears incorrect:

1. Submit dispute with economic stake
2. AI re-evaluates with fresh webpage data
3. Validators determine if dispute is valid:
   - **Upheld**: Disputer wins 2x stake, resolution corrected
   - **Rejected**: Disputer loses stake

### 5. Claim Winnings

Winners claim payouts (minus 2.5% protocol fee). Balance updated in contract storage and synced to frontend.

## Configuration

### Contract Parameters

- **`initial_balance`**: Play-money given to new users (default: 10,000)
- **`protocol_fee_bps`**: Protocol fee in basis points (default: 250 = 2.5%)

### Resolution URLs

Markets use **BBC Sport URLs** for resolution:

```
https://www.bbc.com/sport/football/scores-fixtures/YYYY-MM-DD
```

The AI extracts final scores and determines winners from these pages.

### Environment Variables

Create `.env` in the frontend directory:

```bash
# Contract Address (required)
VITE_CONTRACT_ADDRESS=0x...

# Network Configuration (optional - defaults to Studio)
VITE_GENLAYER_RPC_URL=https://studio.genlayer.com/api
VITE_GENLAYER_CHAIN_ID=61999
```

## Development

### Adding Fixtures

Edit `fixtures/fixtures.json` and `frontend/public/fixtures.json`:

```json
{
  "id": "unique_id",
  "sport": "Football",
  "league": "Premier League",
  "team1": "Manchester City",
  "team2": "Liverpool",
  "date": "2025-01-25T15:00:00Z",
  "resolution_url": "https://www.bbc.com/sport/football/scores-fixtures/2025-01-25"
}
```

### Testing Workflow

1. **Deploy to GenLayer Studio**: Deploy contract from https://studio.genlayer.com
2. **Copy Contract Address**: Paste into `.env` file
3. **Start Frontend**: `npm run dev` in `frontend/` directory
4. **Create Markets**: Test market creation with fixtures
5. **Place Bets**: Test betting with different outcomes
6. **Resolution**: Test AI-powered resolution
7. **Disputes**: Test dispute mechanism
8. **Balance Persistence**: Refresh page, verify balance persists

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

3. Update `VITE_CONTRACT_ADDRESS` with new testnet address

## Important Notes

### Play-Money Only

This is a **play-money prediction market** for educational and entertainment purposes. **No real money is involved.**

### AI Limitations

- Resolution accuracy depends on webpage structure
- BBC Sport URLs may change format over time
- Always verify AI decisions for important outcomes
- Validators may disagree if webpage content is ambiguous

### GenLayer Specifics

- Use `TreeMap` instead of Python `dict`
- Use `DynArray` instead of Python `list`
- Use sized integers (`u256`, `i8`, `u16`)
- Use `gl.storage.copy_to_memory()` before accessing storage in nondeterministic blocks
- All LLM operations must use `gl.eq_principle.prompt_non_comparative` or other equivalence principles
- Decorate custom storage classes with `@allow_storage`

### Contract Dependencies

The contract requires the GenLayer test dependencies header:

```python
# { "Depends": "py-genlayer:test" }
```

## Troubleshooting

### Contract Deployment Fails in Studio

- Verify contract syntax (no `dict`/`list`, use `TreeMap`/`DynArray`)
- Ensure dependencies header is present: `# { "Depends": "py-genlayer:test" }`
- Check constructor parameters are correct types (`int`, not `str`)

### Frontend Can't Connect

- Verify contract address in `.env` matches deployed address
- Check RPC URL and Chain ID match your network
- Ensure GenLayer network is added to MetaMask (if using MetaMask)
- Try GenLayer native wallet if MetaMask fails

### Balance Shows Wrong Amount / Doesn't Update

- Wait 2-3 seconds for balance fetch to complete
- Check browser console for API errors
- Verify contract address is correct
- Refresh page - balance should persist from contract storage

### Resolution Fails

- Verify resolution URL is accessible
- Check if match has been played
- Ensure URL format matches expected structure (BBC Sport)
- Check GenLayer Studio logs for LLM errors

### "Storage Read Error: SystemError: 6: forbidden"

- This means you're accessing storage inside a nondeterministic block
- Use `gl.storage.copy_to_memory()` before the lambda function
- See **Critical Implementation Details** section above

### "Client not initialized" Error

- Wait a few seconds for GenLayerJS to initialize
- Check browser console for connection errors
- Verify RPC URL is accessible
- Try refreshing the page

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
- [ ] Verify balance decreases
- [ ] Test market resolution
- [ ] Test claim winnings
- [ ] Verify balance persists on refresh

## Future Enhancements

- Multi-sport support (basketball, tennis, MMA, etc.)
- Live odds updates based on betting activity
- Market maker for better liquidity
- Historical statistics and analytics dashboard
- Social features (following, leaderboards, chat)
- Mobile app (React Native)
- Advanced dispute arbitration with evidence submission
- Multi-source resolution (cross-reference multiple websites)

## License

MIT

## Contributing

Contributions welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## Support

For issues or questions:

- **Open a GitHub issue**
- **Check GenLayer documentation**: https://docs.genlayer.com
- **Visit GenLayer Studio**: https://studio.genlayer.com
- **GenLayer Discord**: https://discord.gg/genlayer

---

**Built on GenLayer**

*Leveraging nondeterministic consensus and LLM-powered intelligence for decentralized prediction markets.*