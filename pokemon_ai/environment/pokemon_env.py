"""
Gym environment for Pokemon Showdown battles.
"""

import gymnasium as gym
import numpy as np
from typing import List, Tuple, Dict, Any
from gymnasium import spaces

from environment.game_state import GameState, Action, ActionType
from environment.battle_simulator import BattleSimulator
from data.pokemon_data import ActivePokemon, Pokemon, Stats, Move, Type

class PokemonBattleEnv(gym.Env):
    """Gym environment for Pokemon Showdown battles."""
    
    def __init__(self, team_size: int = 6):
        super().__init__()
        
        self.team_size = team_size
        self.battle_simulator = BattleSimulator()
        self.game_state: Optional[GameState] = None
        
        # Action space: [action_type, move_index, pokemon_index, tera_type]
        # action_type: 0=move, 1=switch, 2=terastallize
        self.action_space = spaces.MultiDiscrete([
            3,  # action_type
            4,  # move_index (max 4 moves)
            team_size,  # pokemon_index
            18  # tera_type (18 types)
        ])
        
        # State space: flattened state vector
        state_size = team_size * 6 * 2 + 6  # 6 stats per pokemon, 2 teams, + battle conditions
        self.observation_space = spaces.Box(
            low=0, high=1, shape=(state_size,), dtype=np.float32
        )
        
        # Meta teams for training
        self.meta_teams = self._load_meta_teams()
        self.current_team_index = 0
        
    def reset(self, seed=None, options=None) -> Tuple[np.ndarray, Dict]:
        """Reset the environment for a new battle."""
        
        # Select a random team for this battle
        self.current_team_index = np.random.randint(0, len(self.meta_teams))
        player_team = self.meta_teams[self.current_team_index]
        
        # Create opponent team (for now, use another random team)
        opponent_team_index = np.random.randint(0, len(self.meta_teams))
        opponent_team = self.meta_teams[opponent_team_index]
        
        # Initialize game state
        self.game_state = GameState(self.team_size)
        self.game_state.player_pokemon = player_team.copy()
        self.game_state.opponent_pokemon = opponent_team.copy()
        
        return self.game_state.get_state_vector(), {}
    
    def step(self, action: np.ndarray) -> Tuple[np.ndarray, float, bool, Dict[str, Any]]:
        """Execute one step in the environment."""
        
        if self.game_state is None:
            raise ValueError("Environment not initialized. Call reset() first.")
        
        # Convert action array to Action object
        action_obj = self._action_array_to_action(action)
        
        # Get opponent action (for now, random)
        opponent_actions = self.game_state.get_available_actions()
        opponent_action = np.random.choice(opponent_actions) if opponent_actions else action_obj
        
        # Execute turn
        self.battle_simulator._execute_turn(self.game_state, action_obj, opponent_action)
        
        # Calculate reward
        reward = self._calculate_reward()
        
        # Check if game is over
        done = self.game_state.is_game_over()
        
        # Get next state
        next_state = self.game_state.get_state_vector() if not done else np.zeros_like(self.game_state.get_state_vector())
        
        info = {
            'turn': self.game_state.turn_number,
            'player_hp': sum(pokemon.current_hp for pokemon in self.game_state.player_pokemon),
            'opponent_hp': sum(pokemon.current_hp for pokemon in self.game_state.opponent_pokemon)
        }
        
        return next_state, reward, done, False, info
    
    def _action_array_to_action(self, action_array: np.ndarray) -> Action:
        """Convert action array to Action object."""
        
        action_type = action_array[0]
        move_index = action_array[1]
        pokemon_index = action_array[2]
        tera_type = action_array[3]
        
        if action_type == 0:  # Move
            return Action(ActionType.MOVE, move_index=move_index)
        elif action_type == 1:  # Switch
            return Action(ActionType.SWITCH, pokemon_index=pokemon_index)
        else:  # Terastallize
            # Get a valid type from the enum
            type_list = list(Type)
            if tera_type < len(type_list):
                return Action(ActionType.TERASTALLIZE, tera_type=type_list[tera_type])
            else:
                return Action(ActionType.MOVE, move_index=0)  # Default to move
    
    def _calculate_reward(self) -> float:
        """Calculate reward for the current state."""
        
        if self.game_state.is_game_over():
            winner = self.game_state.get_winner()
            if winner == 0:  # Player wins
                return 100.0
            elif winner == 1:  # Opponent wins
                return -100.0
            else:  # Draw
                return 0.0
        
        # No penalty for taking damage (as requested)
        # Could add small rewards for strategic plays
        return 0.0
    
    def _load_meta_teams(self) -> List[List[ActivePokemon]]:
        """Load meta teams for training."""
        
        # This would load from actual data files
        # For now, create some sample teams
        teams = []
        
        # Sample team 1: Balanced team
        team1 = self._create_sample_team_1()
        teams.append(team1)
        
        # Sample team 2: Offensive team
        team2 = self._create_sample_team_2()
        teams.append(team2)
        
        return teams
    
    def _create_sample_team_1(self) -> List[ActivePokemon]:
        """Create a sample balanced team."""
        
        # This is a simplified example - real teams would be much more complex
        pokemon_list = []
        
        # Create sample Pokemon (simplified)
        for i in range(self.team_size):
            pokemon = Pokemon(
                name=f"Pokemon_{i}",
                types=[Type.NORMAL],
                base_stats=Stats(100, 100, 100, 100, 100, 100),
                abilities=["Sample Ability"],
                moves=[
                    Move("Tackle", Type.NORMAL, 40, 100, 35),
                    Move("Growl", Type.NORMAL, 0, 100, 40),
                    Move("Quick Attack", Type.NORMAL, 40, 100, 30),
                    Move("Rest", Type.PSYCHIC, 0, 100, 10)
                ]
            )
            
            active_pokemon = ActivePokemon(
                pokemon=pokemon,
                current_hp=pokemon.base_stats.hp,
                status_conditions=[],
                stat_modifiers={}
            )
            
            pokemon_list.append(active_pokemon)
        
        return pokemon_list
    
    def _create_sample_team_2(self) -> List[ActivePokemon]:
        """Create a sample offensive team."""
        
        # Similar to team 1 but with different stats
        pokemon_list = []
        
        for i in range(self.team_size):
            pokemon = Pokemon(
                name=f"Offensive_{i}",
                types=[Type.FIRE],
                base_stats=Stats(80, 120, 80, 120, 80, 120),
                abilities=["Offensive Ability"],
                moves=[
                    Move("Fire Blast", Type.FIRE, 110, 85, 5),
                    Move("Flamethrower", Type.FIRE, 90, 100, 15),
                    Move("Fire Punch", Type.FIRE, 75, 100, 15),
                    Move("Protect", Type.NORMAL, 0, 100, 10)
                ]
            )
            
            active_pokemon = ActivePokemon(
                pokemon=pokemon,
                current_hp=pokemon.base_stats.hp,
                status_conditions=[],
                stat_modifiers={}
            )
            
            pokemon_list.append(active_pokemon)
        
        return pokemon_list
