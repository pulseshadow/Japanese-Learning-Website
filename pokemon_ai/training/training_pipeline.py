"""
Complete training pipeline for the Pokemon Showdown AI.
"""

import os
import sys
import numpy as np
import matplotlib.pyplot as plt
from typing import List, Dict, Any, Tuple
import json
from datetime import datetime
import logging

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from environment.pokemon_env import PokemonBattleEnv
from models.pokemon_agent import PokemonAgent, TeamSelector
from data.team_loader import TeamLoader

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class PokemonTrainingPipeline:
    """Complete training pipeline for Pokemon Showdown AI."""
    
    def __init__(self, config: Dict[str, Any]):
        self.config = config
        self.env = None
        self.agent = None
        self.team_loader = None
        self.team_selector = None
        
        # Training metrics
        self.training_history = {
            'episode_rewards': [],
            'episode_lengths': [],
            'win_rates': [],
            'team_performance': [],
            'losses': []
        }
        
        # Initialize components
        self._initialize_components()
        
    def _initialize_components(self):
        """Initialize all training components."""
        
        logger.info("Initializing training components...")
        
        # Create environment
        self.env = PokemonBattleEnv(
            team_size=self.config.get('team_size', 6)
        )
        
        # Create team loader
        self.team_loader = TeamLoader()
        
        # Load meta teams
        meta_teams = self.team_loader.load_meta_teams()
        if meta_teams:
            self.env.meta_teams = meta_teams
            logger.info(f"Loaded {len(meta_teams)} meta teams")
        
        # Create agent
        self.agent = PokemonAgent(
            env=self.env,
            learning_rate=self.config.get('learning_rate', 3e-4),
            n_steps=self.config.get('n_steps', 2048)
        )
        
        # Create team selector
        self.team_selector = TeamSelector(
            num_teams=len(meta_teams) if meta_teams else 10
        )
        
        logger.info("Components initialized successfully")
        
    def train(self):
        """Run the complete training pipeline."""
        
        logger.info("Starting Pokemon Showdown AI training pipeline")
        logger.info("=" * 60)
        
        # Training configuration
        total_timesteps = self.config.get('total_timesteps', 1000000)
        evaluation_freq = self.config.get('evaluation_freq', 10000)
        save_freq = self.config.get('save_freq', 50000)
        
        # Initial evaluation
        logger.info("Running initial evaluation...")
        initial_performance = self.agent.evaluate(n_episodes=100)
        logger.info(f"Initial Performance: {initial_performance}")
        
        # Training loop
        timesteps_completed = 0
        evaluation_count = 0
        
        while timesteps_completed < total_timesteps:
            # Train for evaluation_freq timesteps
            timesteps_to_train = min(evaluation_freq, total_timesteps - timesteps_completed)
            
            logger.info(f"Training for {timesteps_to_train} timesteps...")
            
            # Train the agent
            self.agent.agent.learn(
                total_timesteps=timesteps_to_train,
                progress_bar=True
            )
            
            timesteps_completed += timesteps_to_train
            
            # Evaluate performance
            logger.info("Evaluating performance...")
            performance = self.agent.evaluate(n_episodes=100)
            
            # Update training history
            self.training_history['episode_rewards'].append(performance['mean_reward'])
            self.training_history['episode_lengths'].append(performance['mean_length'])
            self.training_history['win_rates'].append(performance['win_rate'])
            
            # Log progress
            logger.info(f"Timesteps: {timesteps_completed}/{total_timesteps}")
            logger.info(f"Mean Reward: {performance['mean_reward']:.2f}")
            logger.info(f"Win Rate: {performance['win_rate']:.2f}")
            logger.info(f"Mean Episode Length: {performance['mean_length']:.2f}")
            logger.info("-" * 40)
            
            # Save model periodically
            if timesteps_completed % save_freq == 0:
                model_path = f"models/pokemon_agent_{timesteps_completed}"
                self.agent.save_model(model_path)
                logger.info(f"Model saved to {model_path}")
            
            # Update team performance
            self._update_team_performance(performance)
            
            evaluation_count += 1
        
        # Final evaluation
        logger.info("Running final evaluation...")
        final_performance = self.agent.evaluate(n_episodes=1000)
        logger.info(f"Final Performance: {final_performance}")
        
        # Save final model
        self.agent.save_model("models/pokemon_agent_final")
        
        # Save training history
        self._save_training_history()
        
        # Plot training progress
        self._plot_training_progress()
        
        logger.info("Training pipeline completed successfully!")
        
    def _update_team_performance(self, performance: Dict[str, float]):
        """Update team performance based on evaluation results."""
        
        # Simulate team performance update
        for team_index in range(self.team_selector.num_teams):
            wins = int(performance['win_rate'] * 100)
            losses = 100 - wins
            self.team_selector.update_performance(team_index, wins > losses)
        
        # Get best team
        best_team = self.team_selector.get_best_team()
        team_stats = self.team_selector.get_team_stats()
        
        self.training_history['team_performance'].append({
            'best_team': best_team,
            'team_stats': team_stats
        })
        
        logger.info(f"Best performing team: {best_team}")
        team_rates = [f'{i}: {stats["win_rate"]:.2f}' for i, stats in team_stats.items()]
        logger.info(f"Team win rates: {team_rates}")
        
    def _save_training_history(self):
        """Save training history to file."""
        
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"training_history_{timestamp}.json"
        
        with open(filename, 'w') as f:
            json.dump(self.training_history, f, indent=2)
        
        logger.info(f"Training history saved to {filename}")
        
    def _plot_training_progress(self):
        """Plot training progress."""
        
        try:
            fig, axes = plt.subplots(2, 2, figsize=(15, 10))
            
            # Episode rewards
            axes[0, 0].plot(self.training_history['episode_rewards'])
            axes[0, 0].set_title('Episode Rewards')
            axes[0, 0].set_xlabel('Evaluation')
            axes[0, 0].set_ylabel('Mean Reward')
            axes[0, 0].grid(True)
            
            # Win rates
            axes[0, 1].plot(self.training_history['win_rates'])
            axes[0, 1].set_title('Win Rate')
            axes[0, 1].set_xlabel('Evaluation')
            axes[0, 1].set_ylabel('Win Rate')
            axes[0, 1].grid(True)
            
            # Episode lengths
            axes[1, 0].plot(self.training_history['episode_lengths'])
            axes[1, 0].set_title('Episode Lengths')
            axes[1, 0].set_xlabel('Evaluation')
            axes[1, 0].set_ylabel('Mean Length')
            axes[1, 0].grid(True)
            
            # Team performance
            if self.training_history['team_performance']:
                team_stats = self.training_history['team_performance'][-1]['team_stats']
                teams = list(team_stats.keys())
                win_rates = [team_stats[team]['win_rate'] for team in teams]
                
                axes[1, 1].bar(teams, win_rates)
                axes[1, 1].set_title('Team Performance')
                axes[1, 1].set_xlabel('Team Index')
                axes[1, 1].set_ylabel('Win Rate')
                axes[1, 1].grid(True)
            
            plt.tight_layout()
            plt.savefig('training_progress.png', dpi=300, bbox_inches='tight')
            plt.show()
            
            logger.info("Training progress plot saved to training_progress.png")
            
        except Exception as e:
            logger.error(f"Error plotting training progress: {e}")
    
    def test_agent(self, n_episodes: int = 100) -> Dict[str, float]:
        """Test the trained agent."""
        
        logger.info(f"Testing agent for {n_episodes} episodes...")
        
        performance = self.agent.evaluate(n_episodes=n_episodes)
        
        logger.info(f"Test Performance: {performance}")
        
        return performance

def main():
    """Main function for running the training pipeline."""
    
    # Training configuration
    config = {
        'team_size': 6,
        'total_timesteps': 1000000,
        'evaluation_freq': 10000,
        'save_freq': 50000,
        'learning_rate': 3e-4,
        'n_steps': 2048
    }
    
    # Create and run training pipeline
    pipeline = PokemonTrainingPipeline(config)
    pipeline.train()
    
    # Test the trained agent
    test_performance = pipeline.test_agent(n_episodes=100)
    print(f"Final test performance: {test_performance}")

if __name__ == "__main__":
    main()
