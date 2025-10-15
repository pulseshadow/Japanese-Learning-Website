#!/usr/bin/env python3
"""
Quick training script for the Pokemon Showdown AI.
"""

import sys
import os

# Add current directory to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from training.training_pipeline import PokemonTrainingPipeline

def main():
    """Run training with default settings."""
    
    print("Pokemon Showdown AI - Quick Training")
    print("=" * 50)
    
    # Default training configuration
    config = {
        'team_size': 6,
        'total_timesteps': 1000000,  # 1 million timesteps
        'evaluation_freq': 10000,    # Evaluate every 10k timesteps
        'save_freq': 50000,          # Save every 50k timesteps
        'learning_rate': 3e-4,       # Learning rate
        'n_steps': 2048              # Steps per update
    }
    
    print("Training Configuration:")
    for key, value in config.items():
        print(f"  {key}: {value}")
    print()
    
    # Create and run training pipeline
    pipeline = PokemonTrainingPipeline(config)
    
    try:
        pipeline.train()
        print("\\n🎉 Training completed successfully!")
        
        # Test the trained agent
        print("\\nTesting trained agent...")
        test_performance = pipeline.test_agent(n_episodes=100)
        print(f"Test performance: {test_performance}")
        
    except KeyboardInterrupt:
        print("\\n⏹️ Training interrupted by user")
    except Exception as e:
        print(f"\\n❌ Training failed: {e}")
        raise

if __name__ == "__main__":
    main()
