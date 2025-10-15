"""
Load and manage meta teams for Pokemon Showdown.
"""

import json
import os
from typing import List, Dict, Any
from dataclasses import dataclass

from .pokemon_data import Pokemon, Stats, Move, Type, ActivePokemon

class TeamLoader:
    """Loads and manages meta teams for training and testing."""
    
    def __init__(self, data_dir: str = "data"):
        self.data_dir = data_dir
        self.meta_teams = []
        self.team_stats = {}
        
    def load_meta_teams(self) -> List[List[ActivePokemon]]:
        """Load meta teams from JSON file."""
        
        teams_file = os.path.join(self.data_dir, "meta_teams.json")
        
        if not os.path.exists(teams_file):
            print(f"Meta teams file not found: {teams_file}")
            return []
        
        try:
            with open(teams_file, 'r') as f:
                data = json.load(f)
            
            teams = []
            for team_data in data["anything_goes_teams"]:
                team = self._parse_team(team_data)
                if team:
                    teams.append(team)
            
            self.meta_teams = teams
            print(f"Loaded {len(teams)} meta teams")
            return teams
            
        except Exception as e:
            print(f"Error loading meta teams: {e}")
            return []
    
    def _parse_team(self, team_data: Dict[str, Any]) -> List[ActivePokemon]:
        """Parse a team from JSON data."""
        
        try:
            team = []
            
            for pokemon_data in team_data["pokemon"]:
                # Parse types
                types = [Type(t) for t in pokemon_data["types"]]
                
                # Parse base stats
                stats = Stats(**pokemon_data["base_stats"])
                
                # Parse moves
                moves = []
                for move_data in pokemon_data["moves"]:
                    move = Move(
                        name=move_data["name"],
                        type=Type(move_data["type"]),
                        power=move_data["power"],
                        accuracy=move_data["accuracy"],
                        pp=move_data["pp"],
                        priority=move_data.get("priority", 0),
                        category=move_data.get("category", "Physical")
                    )
                    moves.append(move)
                
                # Create Pokemon
                pokemon = Pokemon(
                    name=pokemon_data["name"],
                    types=types,
                    base_stats=stats,
                    abilities=pokemon_data["abilities"],
                    moves=moves,
                    item=pokemon_data.get("item")
                )
                
                # Create ActivePokemon
                active_pokemon = ActivePokemon(
                    pokemon=pokemon,
                    current_hp=pokemon.base_stats.hp,
                    status_conditions=[],
                    stat_modifiers={}
                )
                
                team.append(active_pokemon)
            
            return team
            
        except Exception as e:
            print(f"Error parsing team: {e}")
            return None
    
    def get_team_by_name(self, team_name: str) -> List[ActivePokemon]:
        """Get a specific team by name."""
        
        for team in self.meta_teams:
            # This is simplified - in reality, you'd need to track team names
            if team:
                return team
        
        return None
    
    def get_random_team(self) -> List[ActivePokemon]:
        """Get a random meta team."""
        
        if not self.meta_teams:
            return []
        
        import random
        return random.choice(self.meta_teams)
    
    def get_team_count(self) -> int:
        """Get the number of loaded teams."""
        
        return len(self.meta_teams)
    
    def get_team_stats(self) -> Dict[str, Any]:
        """Get statistics about loaded teams."""
        
        if not self.meta_teams:
            return {}
        
        stats = {
            "total_teams": len(self.meta_teams),
            "team_sizes": [len(team) for team in self.meta_teams],
            "pokemon_types": {},
            "common_moves": {},
            "common_items": {}
        }
        
        # Analyze teams
        for team in self.meta_teams:
            for pokemon in team:
                # Count types
                for pokemon_type in pokemon.pokemon.types:
                    type_name = pokemon_type.value
                    stats["pokemon_types"][type_name] = stats["pokemon_types"].get(type_name, 0) + 1
                
                # Count moves
                for move in pokemon.pokemon.moves:
                    move_name = move.name
                    stats["common_moves"][move_name] = stats["common_moves"].get(move_name, 0) + 1
                
                # Count items
                if pokemon.pokemon.item:
                    item_name = pokemon.pokemon.item
                    stats["common_items"][item_name] = stats["common_items"].get(item_name, 0) + 1
        
        return stats
