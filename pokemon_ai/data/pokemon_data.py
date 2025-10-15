"""
Pokemon data structures and type effectiveness calculations.
"""

import json
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass
from enum import Enum

class Type(Enum):
    NORMAL = "Normal"
    FIRE = "Fire"
    WATER = "Water"
    ELECTRIC = "Electric"
    GRASS = "Grass"
    ICE = "Ice"
    FIGHTING = "Fighting"
    POISON = "Poison"
    GROUND = "Ground"
    FLYING = "Flying"
    PSYCHIC = "Psychic"
    BUG = "Bug"
    ROCK = "Rock"
    GHOST = "Ghost"
    DRAGON = "Dragon"
    DARK = "Dark"
    STEEL = "Steel"
    FAIRY = "Fairy"

@dataclass
class Stats:
    hp: int
    attack: int
    defense: int
    sp_attack: int
    sp_defense: int
    speed: int

@dataclass
class Move:
    name: str
    type: Type
    power: int
    accuracy: int
    pp: int
    priority: int = 0
    category: str = "Physical"  # Physical, Special, Status
    effect: Optional[str] = None

@dataclass
class Pokemon:
    name: str
    types: List[Type]
    base_stats: Stats
    abilities: List[str]
    moves: List[Move]
    item: Optional[str] = None
    level: int = 100

@dataclass
class ActivePokemon:
    pokemon: Pokemon
    current_hp: int
    status_conditions: List[str]
    stat_modifiers: Dict[str, int]  # Attack, Defense, etc.
    is_terastallized: bool = False
    tera_type: Optional[Type] = None

class TypeEffectiveness:
    """Handles type effectiveness calculations."""
    
    EFFECTIVENESS_CHART = {
        Type.NORMAL: {
            Type.ROCK: 0.5, Type.STEEL: 0.5, Type.GHOST: 0
        },
        Type.FIRE: {
            Type.FIRE: 0.5, Type.WATER: 0.5, Type.GRASS: 2, Type.ICE: 2,
            Type.BUG: 2, Type.ROCK: 0.5, Type.DRAGON: 0.5, Type.STEEL: 2
        },
        Type.WATER: {
            Type.FIRE: 2, Type.WATER: 0.5, Type.GRASS: 0.5, Type.GROUND: 2,
            Type.ROCK: 2, Type.DRAGON: 0.5
        },
        Type.ELECTRIC: {
            Type.WATER: 2, Type.ELECTRIC: 0.5, Type.GRASS: 0.5, Type.GROUND: 0,
            Type.FLYING: 2, Type.DRAGON: 0.5
        },
        Type.GRASS: {
            Type.FIRE: 0.5, Type.WATER: 2, Type.GRASS: 0.5, Type.POISON: 0.5,
            Type.GROUND: 2, Type.FLYING: 0.5, Type.BUG: 0.5, Type.ROCK: 2,
            Type.DRAGON: 0.5, Type.STEEL: 0.5
        },
        Type.ICE: {
            Type.FIRE: 0.5, Type.WATER: 0.5, Type.GRASS: 2, Type.ICE: 0.5,
            Type.GROUND: 2, Type.FLYING: 2, Type.DRAGON: 2, Type.STEEL: 0.5
        },
        Type.FIGHTING: {
            Type.NORMAL: 2, Type.ICE: 2, Type.POISON: 0.5, Type.FLYING: 0.5,
            Type.PSYCHIC: 0.5, Type.BUG: 0.5, Type.ROCK: 2, Type.DARK: 2,
            Type.STEEL: 2, Type.FAIRY: 0.5
        },
        Type.POISON: {
            Type.GRASS: 2, Type.POISON: 0.5, Type.GROUND: 0.5, Type.ROCK: 0.5,
            Type.GHOST: 0.5, Type.STEEL: 0, Type.FAIRY: 2
        },
        Type.GROUND: {
            Type.FIRE: 2, Type.ELECTRIC: 2, Type.GRASS: 0.5, Type.POISON: 2,
            Type.FLYING: 0, Type.BUG: 0.5, Type.ROCK: 2, Type.STEEL: 2
        },
        Type.FLYING: {
            Type.ELECTRIC: 0.5, Type.GRASS: 2, Type.FIGHTING: 2, Type.BUG: 2,
            Type.ROCK: 0.5, Type.STEEL: 0.5
        },
        Type.PSYCHIC: {
            Type.FIGHTING: 2, Type.POISON: 2, Type.PSYCHIC: 0.5, Type.DARK: 0,
            Type.STEEL: 0.5
        },
        Type.BUG: {
            Type.FIRE: 0.5, Type.GRASS: 2, Type.FIGHTING: 0.5, Type.POISON: 0.5,
            Type.FLYING: 0.5, Type.PSYCHIC: 2, Type.GHOST: 0.5, Type.DARK: 2,
            Type.STEEL: 0.5, Type.FAIRY: 0.5
        },
        Type.ROCK: {
            Type.FIRE: 2, Type.ICE: 2, Type.FIGHTING: 0.5, Type.GROUND: 0.5,
            Type.FLYING: 2, Type.BUG: 2, Type.STEEL: 0.5
        },
        Type.GHOST: {
            Type.NORMAL: 0, Type.PSYCHIC: 2, Type.GHOST: 2, Type.DARK: 0.5
        },
        Type.DRAGON: {
            Type.DRAGON: 2, Type.STEEL: 0.5, Type.FAIRY: 0
        },
        Type.DARK: {
            Type.FIGHTING: 0.5, Type.PSYCHIC: 2, Type.GHOST: 2, Type.DARK: 0.5,
            Type.FAIRY: 0.5
        },
        Type.STEEL: {
            Type.FIRE: 0.5, Type.WATER: 0.5, Type.ELECTRIC: 0.5, Type.ICE: 2,
            Type.GROUND: 2, Type.FLYING: 0.5, Type.PSYCHIC: 0.5, Type.BUG: 0.5,
            Type.ROCK: 2, Type.DRAGON: 0.5, Type.STEEL: 0.5, Type.FAIRY: 2
        },
        Type.FAIRY: {
            Type.FIRE: 0.5, Type.FIGHTING: 2, Type.POISON: 0.5, Type.DRAGON: 2,
            Type.DARK: 2, Type.STEEL: 0.5
        }
    }
    
    @classmethod
    def get_effectiveness(cls, attack_type: Type, defense_types: List[Type]) -> float:
        """Calculate type effectiveness multiplier."""
        total_effectiveness = 1.0
        
        for defense_type in defense_types:
            if attack_type in cls.EFFECTIVENESS_CHART:
                effectiveness = cls.EFFECTIVENESS_CHART[attack_type].get(defense_type, 1.0)
                total_effectiveness *= effectiveness
        
        return total_effectiveness

def load_pokemon_data() -> Dict[str, Pokemon]:
    """Load Pokemon data from JSON files."""
    # This would load from actual data files
    # For now, return a sample structure
    return {}

def get_meta_teams() -> List[List[Pokemon]]:
    """Load meta teams for Anything Goes format."""
    # This would load from Smogon data
    # For now, return empty list
    return []
