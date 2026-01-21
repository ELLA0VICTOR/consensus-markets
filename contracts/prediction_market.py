# { "Depends": "py-genlayer:test" }

from genlayer import *
from dataclasses import dataclass
import json
import typing

# Data structures for storage
@allow_storage
@dataclass
class Market:
    id: u256
    creator: Address
    team1: str
    team2: str
    league: str
    match_date: str
    resolution_url: str
    odds_team1: str
    odds_draw: str
    odds_team2: str
    status: str  # "open", "locked", "resolved", "disputed"
    winner: i8  # -1=unresolved, 0=draw, 1=team1, 2=team2
    total_pool: u256
    created_at: u256

@allow_storage
@dataclass
class Bet:
    user: Address
    market_id: u256
    outcome: i8  # 0=draw, 1=team1, 2=team2
    amount: u256
    potential_payout: u256
    timestamp: u256
    claimed: bool

@allow_storage
@dataclass
class Dispute:
    disputer: Address
    market_id: u256
    stake: u256
    claimed_winner: i8
    status: str  # "pending", "upheld", "rejected"
    created_at: u256

class PredictionMarket(gl.Contract):
    # ✅ CRITICAL FIX: Declare persistent storage fields in class body, NOT in __init__
    markets: TreeMap[u256, Market]
    user_balances: TreeMap[Address, u256]
    bets: TreeMap[u256, DynArray[Bet]]
    disputes: TreeMap[u256, Dispute]
    next_market_id: u256
    protocol_fee_bps: u16
    initial_balance: u256
    
    def __init__(self, initial_balance: int, protocol_fee_bps: int):
        """
        Initialize the prediction market contract.
        
        Args:
            initial_balance: Play-money balance given to each new user
            protocol_fee_bps: Protocol fee in basis points (e.g., 250 = 2.5%)
        """
        # ✅ NO inmem_allocate! Storage is automatically zero-initialized
        # Just set the config values
        self.next_market_id = u256(0)
        self.protocol_fee_bps = u16(protocol_fee_bps)
        self.initial_balance = u256(initial_balance)
    
    def _ensure_user_balance(self, user: Address):
        """Initialize user balance if they're new."""
        if user not in self.user_balances:
            self.user_balances[user] = self.initial_balance
    
    def _get_default_market(self) -> Market:
        """Return a default market for null cases."""
        return Market(
            id=u256(0),
            creator=Address("0x0000000000000000000000000000000000000000"),
            team1="",
            team2="",
            league="",
            match_date="",
            resolution_url="",
            odds_team1="0.00",
            odds_draw="0.00",
            odds_team2="0.00",
            status="",
            winner=i8(-1),
            total_pool=u256(0),
            created_at=u256(0)
        )
    
    @gl.public.write
    def create_market(
        self,
        team1: str,
        team2: str,
        league: str,
        match_date: str,
        resolution_url: str,
        generate_odds: bool,
        fixture_id: str
    ):
        """
        Create a new prediction market.
        
        Args:
            team1: First team name
            team2: Second team name
            league: League/competition name
            match_date: Match date in ISO format
            resolution_url: URL to resolve the match result
            generate_odds: Whether to generate odds using LLM
            fixture_id: Optional fixture identifier
        """
        creator = gl.message.sender_address
        self._ensure_user_balance(creator)
        
        # Generate odds if requested
        if generate_odds:
            odds_data = gl.eq_principle.prompt_non_comparative(
                lambda: f"""Generate betting odds for this match:
Team 1: {team1}
Team 2: {team2}
League: {league}
Date: {match_date}

Provide realistic decimal odds between 1.50 and 5.00.
Respond ONLY with JSON (no markdown):
{{
  "odds_team1": "2.50",
  "odds_draw": "3.20",
  "odds_team2": "2.80"
}}""",
                task="Generate realistic betting odds for this football match in JSON format",
                criteria="""
                    Output must be valid JSON with keys: odds_team1, odds_draw, odds_team2
                    All odds must be decimal strings between 1.50 and 5.00
                    Total implied probability should be 100-110% (bookmaker margin)
                    No markdown formatting or extra text
                """
            )
            
            # Parse the JSON response
            if isinstance(odds_data, str):
                odds_data = json.loads(odds_data.replace("```json", "").replace("```", "").strip())
            
            odds_team1 = odds_data["odds_team1"]
            odds_draw = odds_data["odds_draw"]
            odds_team2 = odds_data["odds_team2"]
        else:
            odds_team1 = "2.00"
            odds_draw = "3.00"
            odds_team2 = "2.00"
        
        # Create market
        current_market_id = self.next_market_id
        market = Market(
            id=current_market_id,
            creator=creator,
            team1=team1,
            team2=team2,
            league=league,
            match_date=match_date,
            resolution_url=resolution_url,
            odds_team1=odds_team1,
            odds_draw=odds_draw,
            odds_team2=odds_team2,
            status="open",
            winner=i8(-1),
            total_pool=u256(0),
            created_at=current_market_id
        )
        
        self.markets[current_market_id] = market
        self.bets[current_market_id] = []
        self.next_market_id = u256(int(self.next_market_id) + 1)
    
    @gl.public.write
    def place_bet(self, market_id: int, outcome: int, amount: int):
        """
        Place a bet on a market.
        
        Args:
            market_id: ID of the market to bet on
            outcome: 0=draw, 1=team1, 2=team2
            amount: Bet amount in play-money
        """
        user = gl.message.sender_address
        self._ensure_user_balance(user)
        
        market_id_u256 = u256(market_id)
        outcome_i8 = i8(outcome)
        amount_u256 = u256(amount)
        
        if market_id_u256 not in self.markets:
            raise Exception("Market does not exist")
        
        market = self.markets[market_id_u256]
        
        if market.status != "open":
            raise Exception("Market is not open for betting")
        
        if outcome < 0 or outcome > 2:
            raise Exception("Invalid outcome")
        
        user_balance = self.user_balances[user]
        if user_balance < amount_u256:
            raise Exception("Insufficient balance")
        
        # Calculate potential payout based on odds
        if outcome == 0:
            odds = float(market.odds_draw)
        elif outcome == 1:
            odds = float(market.odds_team1)
        else:
            odds = float(market.odds_team2)
        
        potential_payout = u256(int(float(amount_u256) * odds))
        
        self.user_balances[user] = user_balance - amount_u256
        
        bet = Bet(
            user=user,
            market_id=market_id_u256,
            outcome=outcome_i8,
            amount=amount_u256,
            potential_payout=potential_payout,
            timestamp=market_id_u256,
            claimed=False
        )
        
        market_bets = self.bets[market_id_u256]
        market_bets.append(bet)
        self.bets[market_id_u256] = market_bets
        
        market.total_pool += amount_u256
        self.markets[market_id_u256] = market
    
    @gl.public.write
    def resolve_market(self, market_id: int):
        """
        Resolve a market using LLM to determine the winner from the resolution URL.
        
        Args:
            market_id: ID of the market to resolve
        """
        market_id_u256 = u256(market_id)
        
        if market_id_u256 not in self.markets:
            raise Exception("Market does not exist")
        
        market = self.markets[market_id_u256]
        
        if market.status != "open":
            raise Exception("Market cannot be resolved")
        
        result_str = gl.eq_principle.prompt_non_comparative(
            lambda: f"""Extract the match result from this webpage.

Match: {market.team1} vs {market.team2}
Date: {market.match_date}
URL: {market.resolution_url}

Webpage content:
{gl.nondet.web.render(market.resolution_url, mode='text')}

Determine the winner. Respond ONLY with JSON (no markdown):
{{
  "winner": -1,
  "score_team1": -1,
  "score_team2": -1
}}

Where winner is: -1=not played, 0=draw, 1=team1, 2=team2""",
            task="Extract match result and determine winner from webpage content",
            criteria="""
                Output must be valid JSON with keys: winner, score_team1, score_team2
                winner must be -1, 0, 1, or 2
                Scores must be integers (-1 if not played)
                No markdown formatting or extra text
            """
        )
        
        # Parse result
        result_str = result_str.replace("```json", "").replace("```", "").strip()
        result = json.loads(result_str)
        
        winner = i8(result["winner"])
        
        if winner == -1:
            raise Exception("Match has not been played yet")
        
        market.winner = winner
        market.status = "resolved"
        self.markets[market_id_u256] = market
    
    @gl.public.write
    def dispute_market(self, market_id: int, claimed_winner: int, stake: int):
        """
        Dispute a resolved market's outcome.
        
        Args:
            market_id: ID of the market to dispute
            claimed_winner: The winner the disputer claims is correct
            stake: Amount to stake on the dispute
        """
        user = gl.message.sender_address
        self._ensure_user_balance(user)
        
        market_id_u256 = u256(market_id)
        claimed_winner_i8 = i8(claimed_winner)
        stake_u256 = u256(stake)
        
        if market_id_u256 not in self.markets:
            raise Exception("Market does not exist")
        
        market = self.markets[market_id_u256]
        
        if market.status != "resolved":
            raise Exception("Can only dispute resolved markets")
        
        if market_id_u256 in self.disputes:
            raise Exception("Market already disputed")
        
        user_balance = self.user_balances[user]
        if user_balance < stake_u256:
            raise Exception("Insufficient balance for stake")
        
        self.user_balances[user] = user_balance - stake_u256
        
        dispute = Dispute(
            disputer=user,
            market_id=market_id_u256,
            stake=stake_u256,
            claimed_winner=claimed_winner_i8,
            status="pending",
            created_at=market_id_u256
        )
        
        self.disputes[market_id_u256] = dispute
        market.status = "disputed"
        self.markets[market_id_u256] = market
        
        adjudication_str = gl.eq_principle.prompt_non_comparative(
            lambda: f"""Re-evaluate this match result due to a dispute.

Match: {market.team1} vs {market.team2}
Original Resolution: Winner = {market.winner}
Disputed Claim: Winner = {claimed_winner}

Fresh webpage content:
{gl.nondet.web.render(market.resolution_url, mode='text')}

Carefully analyze the content and determine:
1. What is the correct winner?
2. Was the original resolution incorrect?

Respond ONLY with JSON:
{{
  "correct_winner": int,
  "dispute_valid": bool,
  "reasoning": "brief explanation"
}}

Where correct_winner is: -1=not played, 0=draw, 1=team1, 2=team2""",
            task="Re-evaluate match result and determine if dispute is valid",
            criteria="""
                Output must be valid JSON with keys: correct_winner, dispute_valid, reasoning
                correct_winner must be -1, 0, 1, or 2
                dispute_valid must be boolean
                reasoning must be a brief explanation
                No markdown formatting or extra text
            """
        )
        
        # Parse adjudication
        adjudication_str = adjudication_str.replace("```json", "").replace("```", "").strip()
        adjudication = json.loads(adjudication_str)
        
        correct_winner = i8(adjudication["correct_winner"])
        dispute_valid = adjudication["dispute_valid"]
        
        if dispute_valid:
            market.winner = correct_winner
            market.status = "resolved"
            dispute.status = "upheld"
            self.user_balances[user] = self.user_balances[user] + stake_u256 + stake_u256
        else:
            market.status = "resolved"
            dispute.status = "rejected"
        
        self.markets[market_id_u256] = market
        self.disputes[market_id_u256] = dispute
    
    @gl.public.write
    def claim_winnings(self, market_id: int):
        """
        Claim winnings from a resolved market.
        
        Args:
            market_id: ID of the market to claim from
        """
        user = gl.message.sender_address
        self._ensure_user_balance(user)
        
        market_id_u256 = u256(market_id)
        
        if market_id_u256 not in self.markets:
            raise Exception("Market does not exist")
        
        market = self.markets[market_id_u256]
        
        if market.status != "resolved":
            raise Exception("Market not resolved yet")
        
        market_bets = self.bets[market_id_u256]
        total_winnings = u256(0)
        
        for i in range(len(market_bets)):
            bet = market_bets[i]
            
            if bet.user == user and not bet.claimed and bet.outcome == market.winner:
                gross_winnings = bet.potential_payout
                fee = (gross_winnings * u256(self.protocol_fee_bps)) // u256(10000)
                net_winnings = gross_winnings - fee
                
                total_winnings += net_winnings
                bet.claimed = True
                market_bets[i] = bet
        
        if total_winnings == 0:
            raise Exception("No winnings to claim")
        
        self.bets[market_id_u256] = market_bets
        self.user_balances[user] = self.user_balances[user] + total_winnings
    
    # View methods
    @gl.public.view
    def get_market(self, market_id: int) -> Market:
        """Get market details by ID."""
        market_id_u256 = u256(market_id)
        if market_id_u256 in self.markets:
            return self.markets[market_id_u256]
        return self._get_default_market()
    
    @gl.public.view
    def get_user_balance(self, user: Address) -> int:
        """Get user's play-money balance."""
        if user in self.user_balances:
            return int(self.user_balances[user])
        return int(self.initial_balance)
    
    @gl.public.view
    def get_market_bets(self, market_id: int) -> DynArray[Bet]:
        """Get all bets for a market."""
        market_id_u256 = u256(market_id)
        if market_id_u256 in self.bets:
            return self.bets[market_id_u256]
        return []
    
    @gl.public.view
    def get_user_bets(self, user: Address) -> DynArray[Bet]:
        """Get all bets placed by a user."""
        user_bets = []
        
        for market_id_int in range(int(self.next_market_id)):
            market_id = u256(market_id_int)
            if market_id in self.bets:
                market_bets = self.bets[market_id]
                for bet in market_bets:
                    if bet.user == user:
                        user_bets.append(bet)
        
        return user_bets
    
    @gl.public.view
    def get_market_count(self) -> int:
        """Get total number of markets created."""
        return int(self.next_market_id)
    
    @gl.public.view
    def get_dispute(self, market_id: int) -> Dispute:
        """Get dispute details for a market."""
        market_id_u256 = u256(market_id)
        if market_id_u256 in self.disputes:
            return self.disputes[market_id_u256]
        
        return Dispute(
            disputer=Address("0x0000000000000000000000000000000000000000"),
            market_id=u256(0),
            stake=u256(0),
            claimed_winner=i8(-1),
            status="",
            created_at=u256(0)
        )