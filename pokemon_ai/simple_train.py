#!/usr/bin/env python3
"""
Simple training script that skips evaluation and goes straight to training.
"""

import sys
import os

# Add current directory to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from environment.pokemon_env import PokemonBattleEnv
from models.pokemon_agent import PokemonAgent
from data.team_loader import TeamLoader

def simple_training():
    """Run simple training without evaluations."""
    
    print("Pokemon Showdown AI - Simple Training")
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
    
    # Start training immediately (no evaluation)
    print("Starting training...")
    print("Training for 100,000 timesteps...")
    
    try:
        # Train the agent
        agent.agent.learn(total_timesteps=100000, progress_bar=True)
        
        print("\\n🎉 Training completed!")
        
        # Save model
        agent.save_model("models/pokemon_agent_simple")
        print("Model saved to models/pokemon_agent_simple")
        
        # Quick test
        print("\\nRunning quick test...")
        try:
            performance = agent.evaluate(n_episodes=10)
            print(f"Test results: {performance}")
        except Exception as e:
            print(f"Test failed (but training worked): {e}")
        
    except KeyboardInterrupt:
        print("\\n⏹️ Training interrupted by user")
        # Save partial model
        agent.save_model("models/pokemon_agent_partial")
        print("Partial model saved to models/pokemon_agent_partial")
    except Exception as e:
        print(f"\\n❌ Training failed: {e}")
        raise

if __name__ == "__main__":
    simple_training()
