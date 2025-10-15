# Pokemon Showdown AI

An AI agent that learns to play Pokemon Showdown's "Anything Goes" format using reinforcement learning.

## Features

- **Reinforcement Learning**: Uses PPO (Proximal Policy Optimization) to learn optimal strategies
- **Meta Team Integration**: Trains with real competitive teams from Smogon
- **Real-time Play**: Can connect to live Pokemon Showdown games
- **Strategic Learning**: Learns complex strategies like sacrificial plays and move selection

## Project Structure

```
pokemon_ai/
├── data/                   # Pokemon data and team configurations
├── environment/           # Game environment simulation
├── models/                # AI model implementations
├── training/              # Training scripts and utilities
├── interface/             # Real-time game interface
└── tests/                 # Test files
```

## Installation

1. Install dependencies: `pip install -r requirements.txt`
2. Run training: `python training/train_agent.py`
3. Test with live games: `python interface/live_play.py`

## Training

The AI learns through self-play and opponent simulation, receiving rewards for:
- Winning battles (+100)
- Losing battles (-100)
- Strategic plays (variable rewards)

No penalty for taking damage, as this can be strategically beneficial.
