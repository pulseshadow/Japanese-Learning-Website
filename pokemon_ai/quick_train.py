#!/usr/bin/env python3
"""
Quick training script that skips lengthy evaluations.
"""

import sys
import os

# Add current directory to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from environment.pokemon_env import PokemonBattleEnv
from models.pokemon_agent import PokemonAgent
from data.team_loader import TeamLoader

def quick_training():
    """Run quick training without lengthy evaluations."""
    
    print("Pokemon Showdown AI - Quick Training")
    print("=" * 50)
    
    # Create environment
    print("Creating environment...")
    env = PokemonBattleEnv(team_size=6)
    
    # Load meta teams
    print("Loading meta teams...")
    team_loader = TeamLoader()
    meta_teams = team_loader.load_meta_teams()
    if meta_teams:
        env.meta_teams = meta_teams
        print(f"Loaded {len(meta_teams)} meta teams")
    
    # Create agent
    print("Creating AI agent...")
    agent = PokemonAgent(env)
    
    # Skip initial evaluation and start training immediately
    print("Starting training (skipping initial evaluation)...")
    print("Training for 50,000 timesteps...")
    
    try:
        # Train for a smaller amount first
        agent.agent.learn(total_timesteps=50000, progress_bar=False)
        
        print("\\n🎉 Quick training completed!")
        
        # Quick test
        print("\\nRunning quick test...")
        performance = agent.evaluate(n_episodes=10)  # Much smaller test
        print(f"Quick test results: {performance}")
        
        # Save model
        agent.save_model("models/pokemon_agent_quick")
        print("Model saved to models/pokemon_agent_quick")
        
    except KeyboardInterrupt:
        print("\\n⏹️ Training interrupted by user")
    except Exception as e:
        print(f"\\n❌ Training failed: {e}")
        raise

if __name__ == "__main__":
    quick_training()
