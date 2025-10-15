"""
Pokemon Showdown AI - An AI agent that learns to play Pokemon Showdown.
"""

__version__ = "1.0.0"
__author__ = "Pokemon AI Team"
__description__ = "An AI agent that learns to play Pokemon Showdown's Anything Goes format"

from .environment.pokemon_env import PokemonBattleEnv
from .models.pokemon_agent import PokemonAgent
from .data.team_loader import TeamLoader

__all__ = [
    "PokemonBattleEnv",
    "PokemonAgent", 
    "TeamLoader"
]
