"""
Game state representation for Pokemon Showdown battles.
"""

import numpy as np
from typing import List, Dict, Optional, Tuple
from dataclasses import dataclass
from enum import Enum

from data.pokemon_data import ActivePokemon, Pokemon, Type

class ActionType(Enum):
    MOVE = "move"
    SWITCH = "switch"
    TERASTALLIZE = "terastallize"

@dataclass
class Action:
    action_type: ActionType
    move_index: Optional[int] = None
    pokemon_index: Optional[int] = None
    tera_type: Optional[Type] = None

class GameState:
    """Represents the current state of a Pokemon battle."""
    
    def __init__(self, team_size: int = 6):
        self.team_size = team_size
        self.player_pokemon: List[ActivePokemon] = []
        self.opponent_pokemon: List[ActivePokemon] = []
        self.active_player_index: int = 0
        self.active_opponent_index: int = 0
        self.turn_number: int = 0
        self.weather: Optional[str] = None
        self.terrain: Optional[str] = None
        self.trick_room: bool = False
        self.player_tera_used: bool = False
        self.opponent_tera_used: bool = False
        
    def get_state_vector(self) -> np.ndarray:
        """Convert game state to neural network input vector."""
        # This is a simplified representation
        # In practice, this would be much more detailed
        
        state_vector = []
        
        # Player team state
        for i in range(self.team_size):
            if i < len(self.player_pokemon):
                pokemon = self.player_pokemon[i]
                state_vector.extend([
                    pokemon.current_hp / pokemon.pokemon.base_stats.hp,  # HP ratio
                    1 if i == self.active_player_index else 0,  # Active pokemon
                    len(pokemon.status_conditions),  # Status conditions
                    pokemon.stat_modifiers.get('attack', 0) / 6,  # Attack modifier
                    pokemon.stat_modifiers.get('defense', 0) / 6,  # Defense modifier
                    pokemon.stat_modifiers.get('speed', 0) / 6,  # Speed modifier
                ])
            else:
                state_vector.extend([0, 0, 0, 0, 0, 0])  # Empty slot
        
        # Opponent team state (limited visibility)
        for i in range(self.team_size):
            if i < len(self.opponent_pokemon):
                pokemon = self.opponent_pokemon[i]
                state_vector.extend([
                    pokemon.current_hp / pokemon.pokemon.base_stats.hp,  # HP ratio
                    1 if i == self.active_opponent_index else 0,  # Active pokemon
                    len(pokemon.status_conditions),  # Status conditions
                    pokemon.stat_modifiers.get('attack', 0) / 6,  # Attack modifier
                    pokemon.stat_modifiers.get('defense', 0) / 6,  # Defense modifier
                    pokemon.stat_modifiers.get('speed', 0) / 6,  # Speed modifier
                ])
            else:
                state_vector.extend([0, 0, 0, 0, 0, 0])  # Empty slot
        
        # Battle conditions
        state_vector.extend([
            1 if self.weather else 0,
            1 if self.terrain else 0,
            1 if self.trick_room else 0,
            1 if self.player_tera_used else 0,
            1 if self.opponent_tera_used else 0,
            self.turn_number / 100,  # Normalized turn number
        ])
        
        return np.array(state_vector, dtype=np.float32)
    
    def get_available_actions(self) -> List[Action]:
        """Get all available actions for the current player."""
        actions = []
        
        # Move actions
        active_pokemon = self.player_pokemon[self.active_player_index]
        for i, move in enumerate(active_pokemon.pokemon.moves):
            actions.append(Action(ActionType.MOVE, move_index=i))
        
        # Switch actions
        for i, pokemon in enumerate(self.player_pokemon):
            if i != self.active_player_index and pokemon.current_hp > 0:
                actions.append(Action(ActionType.SWITCH, pokemon_index=i))
        
        # Terastallize action (if not used)
        if not self.player_tera_used:
            # Add terastallize actions for each type
            for tera_type in active_pokemon.pokemon.types:
                actions.append(Action(ActionType.TERASTALLIZE, tera_type=tera_type))
        
        return actions
    
    def is_game_over(self) -> bool:
        """Check if the game is over."""
        player_alive = any(pokemon.current_hp > 0 for pokemon in self.player_pokemon)
        opponent_alive = any(pokemon.current_hp > 0 for pokemon in self.opponent_pokemon)
        return not player_alive or not opponent_alive
    
    def get_winner(self) -> Optional[int]:
        """Get the winner (0 for player, 1 for opponent, None if ongoing)."""
        if not self.is_game_over():
            return None
        
        player_alive = any(pokemon.current_hp > 0 for pokemon in self.player_pokemon)
        return 0 if player_alive else 1
