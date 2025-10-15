"""
Main entry point for the Pokemon Showdown AI system.
"""

import argparse
import sys
import os
from typing import Dict, Any

# Add current directory to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from training.training_pipeline import PokemonTrainingPipeline
from interface.live_play import LivePlayManager
from test_ai import run_comprehensive_test

def train_ai(config: Dict[str, Any]):
    """Train the Pokemon AI agent."""
    
    print("Starting Pokemon Showdown AI Training")
    print("=" * 50)
    
    # Create training pipeline
    pipeline = PokemonTrainingPipeline(config)
    
    # Run training
    pipeline.train()
    
    # Test the trained agent
    test_performance = pipeline.test_agent(n_episodes=100)
    print(f"Final test performance: {test_performance}")

def run_live_play(username: str, password: str = None):
    """Run the AI in live Pokemon Showdown games."""
    
    print("Starting Pokemon Showdown AI Live Play")
    print("=" * 50)
    
    # Create live play manager
    manager = LivePlayManager(username, password)
    
    # Start live play
    manager.run()

def test_system():
    """Test the Pokemon AI system."""
    
    print("Testing Pokemon Showdown AI System")
    print("=" * 50)
    
    # Run comprehensive tests
    success = run_comprehensive_test()
    
    if success:
        print("\\n🎉 All tests passed! The Pokemon AI system is ready for training.")
    else:
        print("\\n❌ Some tests failed. Please check the errors above.")
    
    return success

def main():
    """Main function for the Pokemon Showdown AI system."""
    
    parser = argparse.ArgumentParser(
        description="Pokemon Showdown AI - Train and play Pokemon Showdown battles"
    )
    
    subparsers = parser.add_subparsers(dest='command', help='Available commands')
    
    # Train command
    train_parser = subparsers.add_parser('train', help='Train the AI agent')
    train_parser.add_argument('--timesteps', type=int, default=1000000, 
                            help='Total training timesteps (default: 1000000)')
    train_parser.add_argument('--eval-freq', type=int, default=10000,
                            help='Evaluation frequency (default: 10000)')
    train_parser.add_argument('--save-freq', type=int, default=50000,
                            help='Save frequency (default: 50000)')
    train_parser.add_argument('--learning-rate', type=float, default=3e-4,
                            help='Learning rate (default: 3e-4)')
    
    # Live play command
    live_parser = subparsers.add_parser('live', help='Run AI in live Pokemon Showdown games')
    live_parser.add_argument('--username', required=True, help='Pokemon Showdown username')
    live_parser.add_argument('--password', help='Pokemon Showdown password (optional)')
    
    # Test command
    test_parser = subparsers.add_parser('test', help='Test the AI system')
    
    # Parse arguments
    args = parser.parse_args()
    
    if args.command == 'train':
        # Training configuration
        config = {
            'team_size': 6,
            'total_timesteps': args.timesteps,
            'evaluation_freq': args.eval_freq,
            'save_freq': args.save_freq,
            'learning_rate': args.learning_rate,
            'n_steps': 2048
        }
        
        train_ai(config)
        
    elif args.command == 'live':
        run_live_play(args.username, args.password)
        
    elif args.command == 'test':
        test_system()
        
    else:
        parser.print_help()

if __name__ == "__main__":
    main()
