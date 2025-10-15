"""
Battle simulator for Pokemon Showdown battles.
"""

import random
import numpy as np
from typing import List, Tuple, Optional, Dict
from dataclasses import dataclass

from environment.game_state import GameState, Action, ActionType
from data.pokemon_data import ActivePokemon, Move, Type, TypeEffectiveness

@dataclass
class BattleResult:
    winner: int  # 0 for player, 1 for opponent
    turns: int
    player_remaining_hp: float
    opponent_remaining_hp: float

class BattleSimulator:
    """Simulates Pokemon battles with realistic mechanics."""
    
    def __init__(self):
        self.random = random.Random()
        
    def simulate_battle(self, player_team: List[ActivePokemon], 
                       opponent_team: List[ActivePokemon],
                       player_actions: List[Action],
                       opponent_actions: List[Action]) -> BattleResult:
        """Simulate a complete battle between two teams."""
        
        game_state = GameState()
        game_state.player_pokemon = player_team.copy()
        game_state.opponent_pokemon = opponent_team.copy()
        
        turn = 0
        max_turns = 200  # Prevent infinite battles
        
        while not game_state.is_game_over() and turn < max_turns:
            game_state.turn_number = turn
            
            # Get actions for both players
            if turn < len(player_actions):
                player_action = player_actions[turn]
            else:
                player_action = self._get_random_action(game_state)
                
            if turn < len(opponent_actions):
                opponent_action = opponent_actions[turn]
            else:
                opponent_action = self._get_random_opponent_action(game_state)
            
            # Execute turn
            self._execute_turn(game_state, player_action, opponent_action)
            turn += 1
        
        # Calculate result
        winner = game_state.get_winner()
        player_hp = sum(pokemon.current_hp for pokemon in game_state.player_pokemon)
        opponent_hp = sum(pokemon.current_hp for pokemon in game_state.opponent_pokemon)
        
        return BattleResult(
            winner=winner if winner is not None else -1,
            turns=turn,
            player_remaining_hp=player_hp,
            opponent_remaining_hp=opponent_hp
        )
    
    def _execute_turn(self, game_state: GameState, 
                     player_action: Action, opponent_action: Action):
        """Execute a single turn of battle."""
        
        # Determine turn order based on speed and priority
        player_speed = self._get_effective_speed(game_state.player_pokemon[game_state.active_player_index])
        opponent_speed = self._get_effective_speed(game_state.opponent_pokemon[game_state.active_opponent_index])
        
        # Priority moves go first
        player_priority = 0
        opponent_priority = 0
        
        if player_action.action_type == ActionType.MOVE:
            move = game_state.player_pokemon[game_state.active_player_index].pokemon.moves[player_action.move_index]
            player_priority = move.priority
            
        if opponent_action.action_type == ActionType.MOVE:
            move = game_state.opponent_pokemon[game_state.active_opponent_index].pokemon.moves[opponent_action.move_index]
            opponent_priority = move.priority
        
        # Determine order
        if player_priority > opponent_priority:
            self._execute_action(game_state, player_action, True)
            if not game_state.is_game_over():
                self._execute_action(game_state, opponent_action, False)
        elif opponent_priority > player_priority:
            self._execute_action(game_state, opponent_action, False)
            if not game_state.is_game_over():
                self._execute_action(game_state, player_action, True)
        else:
            # Same priority, speed determines order
            if player_speed >= opponent_speed:
                self._execute_action(game_state, player_action, True)
                if not game_state.is_game_over():
                    self._execute_action(game_state, opponent_action, False)
            else:
                self._execute_action(game_state, opponent_action, False)
                if not game_state.is_game_over():
                    self._execute_action(game_state, player_action, True)
    
    def _execute_action(self, game_state: GameState, action: Action, is_player: bool):
        """Execute a single action."""
        
        if action.action_type == ActionType.MOVE:
            self._execute_move(game_state, action, is_player)
        elif action.action_type == ActionType.SWITCH:
            self._execute_switch(game_state, action, is_player)
        elif action.action_type == ActionType.TERASTALLIZE:
            self._execute_terastallize(game_state, action, is_player)
    
    def _execute_move(self, game_state: GameState, action: Action, is_player: bool):
        """Execute a move action."""
        
        if is_player:
            attacker = game_state.player_pokemon[game_state.active_player_index]
            defender = game_state.opponent_pokemon[game_state.active_opponent_index]
        else:
            attacker = game_state.opponent_pokemon[game_state.active_opponent_index]
            defender = game_state.player_pokemon[game_state.active_player_index]
        
        move = attacker.pokemon.moves[action.move_index]
        
        # Calculate damage
        damage = self._calculate_damage(attacker, defender, move)
        
        # Apply damage
        defender.current_hp = max(0, defender.current_hp - damage)
        
        # Apply status effects, stat changes, etc.
        self._apply_move_effects(attacker, defender, move)
    
    def _execute_switch(self, game_state: GameState, action: Action, is_player: bool):
        """Execute a switch action."""
        
        if is_player:
            game_state.active_player_index = action.pokemon_index
        else:
            game_state.active_opponent_index = action.pokemon_index
    
    def _execute_terastallize(self, game_state: GameState, action: Action, is_player: bool):
        """Execute terastallize action."""
        
        if is_player:
            pokemon = game_state.player_pokemon[game_state.active_player_index]
            game_state.player_tera_used = True
        else:
            pokemon = game_state.opponent_pokemon[game_state.active_opponent_index]
            game_state.opponent_tera_used = True
        
        pokemon.is_terastallized = True
        pokemon.tera_type = action.tera_type
    
    def _calculate_damage(self, attacker: ActivePokemon, defender: ActivePokemon, move: Move) -> int:
        """Calculate damage dealt by a move."""
        
        if move.category == "Status":
            return 0
        
        # Get base stats
        if move.category == "Physical":
            attack_stat = attacker.pokemon.base_stats.attack
            defense_stat = defender.pokemon.base_stats.defense
        else:  # Special
            attack_stat = attacker.pokemon.base_stats.sp_attack
            defense_stat = defender.pokemon.base_stats.sp_defense
        
        # Apply stat modifiers
        attack_modifier = attacker.stat_modifiers.get('attack' if move.category == "Physical" else 'sp_attack', 0)
        defense_modifier = defender.stat_modifiers.get('defense' if move.category == "Physical" else 'sp_defense', 0)
        
        attack_stat = int(attack_stat * (2 + attack_modifier) / 2)
        defense_stat = int(defense_stat * (2 + defense_modifier) / 2)
        
        # Calculate type effectiveness
        effectiveness = TypeEffectiveness.get_effectiveness(
            move.type, 
            defender.pokemon.types if not defender.is_terastallized else [defender.tera_type]
        )
        
        # STAB (Same Type Attack Bonus)
        stab = 1.5 if move.type in attacker.pokemon.types else 1.0
        if attacker.is_terastallized and move.type == attacker.tera_type:
            stab = 1.5
        
        # Damage calculation (simplified)
        base_damage = ((2 * 100 + 10) * move.power * attack_stat / (50 * defense_stat) + 2)
        damage = int(base_damage * effectiveness * stab * self.random.uniform(0.85, 1.0))
        
        return max(1, damage)
    
    def _apply_move_effects(self, attacker: ActivePokemon, defender: ActivePokemon, move: Move):
        """Apply secondary effects of moves."""
        
        # This is simplified - in reality, each move would have specific effects
        if move.effect:
            # Apply status conditions, stat changes, etc.
            pass
    
    def _get_effective_speed(self, pokemon: ActivePokemon) -> int:
        """Get effective speed stat."""
        
        speed = pokemon.pokemon.base_stats.speed
        speed_modifier = pokemon.stat_modifiers.get('speed', 0)
        
        return int(speed * (2 + speed_modifier) / 2)
    
    def _get_random_action(self, game_state: GameState) -> Action:
        """Get a random valid action for the player."""
        
        actions = game_state.get_available_actions()
        return self.random.choice(actions)
    
    def _get_random_opponent_action(self, game_state: GameState) -> Action:
        """Get a random valid action for the opponent."""
        
        # For now, just return a random move
        active_pokemon = game_state.opponent_pokemon[game_state.active_opponent_index]
        move_index = self.random.randint(0, len(active_pokemon.pokemon.moves) - 1)
        return Action(ActionType.MOVE, move_index=move_index)
