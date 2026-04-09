# ConsensusMarkets

ConsensusMarkets is a full-stack sports prediction market built on GenLayer. Users can create football markets, place play-money bets, and resolve outcomes through AI-assisted validator consensus using public match data.

The project demonstrates real GenLayer intelligent-contract patterns:
- AI-generated odds
- web-assisted market resolution
- economic disputes
- persistent on-chain play-money balances
- frontend integration with GenLayerJS

## What Was Fixed

This repository was updated after a validation rejection caused by nondeterministic contract structure.

The contract now:
- avoids nested nondeterministic calls during market resolution and dispute handling
- uses `gl.storage.copy_to_memory()` before entering nondeterministic blocks
- uses custom leader/validator flows with `gl.vm.run_nondet_unsafe(...)` for resolution and disputes
- keeps odds generation on `gl.eq_principle.prompt_non_comparative(...)`
- avoids storage mutation inside `get_user_balance(...)`
- uses integer-only payout math instead of float-based payout math

These fixes were verified in GenLayer Studio by successfully:
- creating a market
- generating AI odds
- placing a bet
- resolving the market
- claiming winnings

## Features

- AI-powered odds generation for new markets
- Automated resolution from public sports pages such as BBC Sport scores/fixtures pages
- Economic dispute flow for challenged outcomes
- Play-money balances stored on-chain
- React frontend with wallet connection and live contract reads
- Studio-ready workflow for deploy, test, and resubmit

## Stack

### Smart Contract
- GenLayer Intelligent Contracts in Python
- `TreeMap`, `DynArray`, `u256`, `i8`, `u16`
- `gl.eq_principle.prompt_non_comparative(...)` for odds generation
- `gl.nondet.web.get(...)` + `gl.nondet.exec_prompt(...)` inside `gl.vm.run_nondet_unsafe(...)` for resolution/disputes

### Frontend
- React 19
- Vite
- Tailwind CSS
- GenLayerJS

## Project Structure

```text
consensusmarkets/
|-- contracts/
|   `-- prediction_market.py
|-- public/
|   `-- fixtures.json
|-- src/
|   |-- components/
|   |-- config/
|   |-- contexts/
|   |-- hooks/
|   |-- utils/
|   |-- App.jsx
|   |-- main.jsx
|   `-- index.css
|-- index.html
|-- package.json
|-- tailwind.config.js
|-- vite.config.js
`-- README.md
```

## Quick Start

### 1. Deploy The Contract

1. Open GenLayer Studio: `https://studio.genlayer.com`
2. Paste `contracts/prediction_market.py`
3. Deploy with constructor values:
   - `initial_balance = 10000`
   - `protocol_fee_bps = 250`
4. Copy the deployed contract address

### 2. Configure The Frontend

Create a local `.env` file in the project root:

```bash
VITE_CONTRACT_ADDRESS=0x...
VITE_GENLAYER_RPC_URL=https://studio.genlayer.com/api
VITE_GENLAYER_CHAIN_ID=61999
```

`.env` is ignored by Git.

### 3. Run The App

```bash
npm install
npm run dev
```

### 4. Build For Production

```bash
npm run build
```

## Contract API

### Write Methods

- `create_market(team1, team2, league, match_date, resolution_url, generate_odds, fixture_id)`
- `place_bet(market_id, outcome, amount)`
- `resolve_market(market_id)`
- `dispute_market(market_id, claimed_winner, stake)`
- `claim_winnings(market_id)`

### View Methods

- `get_market(market_id)`
- `get_user_balance(user)`
- `get_market_bets(market_id)`
- `get_user_bets(user)`
- `get_market_count()`
- `get_dispute(market_id)`

### Outcome Encoding

- `0` = draw
- `1` = team1
- `2` = team2

## Consensus Design

### 1. Odds Generation

Odds generation uses:

```python
gl.eq_principle.prompt_non_comparative(...)
```

This is suitable because the output is structured and validator-reviewed without needing a second independent extraction flow.

### 2. Market Resolution

Resolution now uses a custom nondeterministic leader/validator pattern:

```python
gl.vm.run_nondet_unsafe(leader_fn, validator_fn)
```

Inside `leader_fn()`:
- fetch webpage text with `gl.nondet.web.get(...)`
- extract structured result with `gl.nondet.exec_prompt(...)`

Inside `validator_fn()`:
- re-run the same extraction independently
- compare only stable fields:
  - `winner`
  - `score_team1`
  - `score_team2`

### 3. Dispute Adjudication

Disputes use the same `run_nondet_unsafe(...)` pattern, comparing:
- `correct_winner`
- `dispute_valid`

This avoids the nested nondeterministic structure that caused the original rejection.

## Frontend Notes

The frontend contract integration lives mainly in:
- `src/hooks/useContract.js`
- `src/hooks/useMarkets.js`
- `src/config/genlayer.js`

Current frontend behavior:
- reads market count, market data, disputes, and balances from the contract
- writes through the deployed contract address
- refreshes balance after write transactions
- displays resolved winners and supports claim/dispute actions

## Resolution URLs

Markets are designed to work well with BBC Sport date-based scores/fixtures pages:

```text
https://www.bbc.com/sport/football/scores-fixtures/YYYY-MM-DD
```

Example:

```text
https://www.bbc.com/sport/football/scores-fixtures/2026-04-08
```

## Studio-Tested Flow

The updated contract was manually verified in GenLayer Studio with a real completed match flow:
- market created successfully
- AI odds generated successfully
- market resolved successfully with validator agreement
- winnings claimed successfully
- frontend-compatible balance read returned updated balance

## Troubleshooting

### Contract Rejected For Nondeterminism

Check for:
- storage reads inside nondeterministic blocks without `gl.storage.copy_to_memory(...)`
- nested nondeterministic calls
- storage writes inside nondeterministic execution paths

### Frontend Not Reading The Right Contract

Check:
- `.env` contract address
- `src/config/genlayer.js`
- restart the dev server after changing `.env`

### Resolution Fails

Check:
- match has actually been played
- resolution URL is accessible
- the page contains enough result text for extraction

## Resubmission Summary

If you are resubmitting this project, the most accurate short summary is:
- the rejection issue was caused by invalid nondeterministic contract structure
- resolution/dispute flows were restructured to compliant GenLayer leader/validator patterns
- the fixed contract was re-tested successfully in GenLayer Studio end to end
