# Pokemon Showdown AI - Usage Guide

This guide explains how to use the Pokemon Showdown AI system for training and live play.

## Quick Start

### 1. Installation

```bash
# Install dependencies
pip install -r requirements.txt

# Install the package (optional)
pip install -e .
```

### 2. Test the System

```bash
# Run comprehensive tests
python main.py test
```

### 3. Train the AI

```bash
# Train with default settings (1M timesteps)
python main.py train

# Train with custom settings
python main.py train --timesteps 2000000 --eval-freq 20000 --save-freq 100000
```

### 4. Run Live Play

```bash
# Run AI in live Pokemon Showdown games
python main.py live --username YourUsername --password YourPassword
```

## Detailed Usage

### Training Configuration

The training system supports various configuration options:

```python
config = {
    'team_size': 6,                    # Number of Pokemon per team
    'total_timesteps': 1000000,        # Total training timesteps
    'evaluation_freq': 10000,           # How often to evaluate (timesteps)
    'save_freq': 50000,                # How often to save model (timesteps)
    'learning_rate': 3e-4,             # Learning rate for PPO
    'n_steps': 2048                    # Steps per update
}
```

### Training Process

1. **Data Loading**: The system loads meta teams from `data/meta_teams.json`
2. **Environment Setup**: Creates a Pokemon battle environment with realistic mechanics
3. **Agent Training**: Uses PPO (Proximal Policy Optimization) for reinforcement learning
4. **Evaluation**: Regularly evaluates performance and tracks metrics
5. **Model Saving**: Saves trained models at regular intervals

### Training Metrics

The system tracks several metrics during training:

- **Episode Rewards**: Average reward per episode
- **Win Rate**: Percentage of battles won
- **Episode Length**: Average number of turns per battle
- **Team Performance**: Performance of different meta teams

### Live Play Interface

The live play interface connects to Pokemon Showdown and plays real games:

1. **Connection**: Connects to Pokemon Showdown via WebSocket
2. **Battle Parsing**: Parses battle state from Showdown messages
3. **AI Decision**: Uses trained model to make decisions
4. **Action Execution**: Sends actions back to Pokemon Showdown

### Customization

#### Adding New Teams

1. Edit `data/meta_teams.json`
2. Add new team configurations
3. Restart training

#### Modifying Rewards

Edit the reward function in `environment/pokemon_env.py`:

```python
def _calculate_reward(self) -> float:
    if self.game_state.is_game_over():
        winner = self.game_state.get_winner()
        if winner == 0:  # Player wins
            return 100.0
        elif winner == 1:  # Opponent wins
            return -100.0
    return 0.0
```

#### Custom State Representation

Modify `environment/game_state.py` to change how the AI sees the game state.

## File Structure

```
pokemon_ai/
├── data/                   # Pokemon data and team configurations
│   ├── pokemon_data.py     # Pokemon data structures
│   ├── meta_teams.json     # Meta team configurations
│   └── team_loader.py       # Team loading utilities
├── environment/            # Game environment simulation
│   ├── game_state.py       # Game state representation
│   ├── battle_simulator.py # Battle simulation logic
│   └── pokemon_env.py      # Gym environment wrapper
├── models/                 # AI model implementations
│   └── pokemon_agent.py    # PPO agent and neural networks
├── training/               # Training scripts and utilities
│   ├── train_agent.py      # Basic training script
│   └── training_pipeline.py # Complete training pipeline
├── interface/              # Real-time game interface
│   ├── showdown_client.py  # Pokemon Showdown client
│   └── live_play.py        # Live play manager
├── main.py                 # Main entry point
├── test_ai.py             # Test suite
└── requirements.txt        # Dependencies
```

## Troubleshooting

### Common Issues

1. **Import Errors**: Make sure all dependencies are installed
2. **Memory Issues**: Reduce batch size or use smaller models
3. **Training Slow**: Use GPU acceleration or reduce model complexity
4. **Connection Issues**: Check Pokemon Showdown server status

### Performance Optimization

1. **GPU Acceleration**: Install PyTorch with CUDA support
2. **Parallel Training**: Use multiple environments for faster training
3. **Model Compression**: Use smaller neural networks for faster inference

## Advanced Usage

### Custom Training Loop

```python
from training.training_pipeline import PokemonTrainingPipeline

# Create custom configuration
config = {
    'team_size': 6,
    'total_timesteps': 500000,
    'evaluation_freq': 5000,
    'save_freq': 25000,
    'learning_rate': 1e-4
}

# Create and run pipeline
pipeline = PokemonTrainingPipeline(config)
pipeline.train()
```

### Custom Environment

```python
from environment.pokemon_env import PokemonBattleEnv

# Create custom environment
env = PokemonBattleEnv(team_size=6)

# Modify environment settings
env.meta_teams = custom_teams
env.current_team_index = 0
```

### Model Evaluation

```python
from models.pokemon_agent import PokemonAgent

# Load trained model
agent = PokemonAgent(env)
agent.load_model("models/pokemon_agent_final")

# Evaluate performance
performance = agent.evaluate(n_episodes=1000)
print(f"Performance: {performance}")
```

## Support

For issues and questions:

1. Check the test suite: `python main.py test`
2. Review the code documentation
3. Check Pokemon Showdown server status
4. Verify all dependencies are installed correctly

## License

This project is licensed under the MIT License. See LICENSE file for details.
