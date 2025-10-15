"""
Training script for the Pokemon Showdown AI agent.
"""

import os
import sys
import numpy as np
import matplotlib.pyplot as plt
from typing import Dict, List, Tuple
import json
from datetime import datetime

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from environment.pokemon_env import PokemonBattleEnv
from models.pokemon_agent import PokemonAgent, TeamSelector
from data.pokemon_data import load_pokemon_data, get_meta_teams

class PokemonTrainer:
    """Main training class for the Pokemon AI."""
    
    def __init__(self, team_size: int = 6, num_teams: int = 10):
        self.team_size = team_size
        self.num_teams = num_teams
        
        # Create environment
        self.env = PokemonBattleEnv(team_size)
        
        # Create agent
        self.agent = PokemonAgent(self.env)
        
        # Create team selector
        self.team_selector = TeamSelector(num_teams)
        
        # Training history
        self.training_history = {
            'episode_rewards': [],
            'episode_lengths': [],
            'win_rates': [],
            'team_performance': []
        }
        
    def train(self, total_timesteps: int = 1000000, 
              evaluation_freq: int = 10000,
              save_freq: int = 50000):
        """Train the Pokemon AI agent."""
        
        print("Starting Pokemon Showdown AI Training")
        print("=" * 50)
        
        # Load Pokemon data and meta teams
        print("Loading Pokemon data and meta teams...")
        self._load_training_data()
        
        # Initial evaluation
        print("Running initial evaluation...")
        initial_performance = self.agent.evaluate(n_episodes=100)
        print(f"Initial Performance: {initial_performance}")
        
        # Training loop
        print(f"Training for {total_timesteps} timesteps...")
        
        timesteps_completed = 0
        evaluation_count = 0
        
        while timesteps_completed < total_timesteps:
            # Train for evaluation_freq timesteps
            timesteps_to_train = min(evaluation_freq, total_timesteps - timesteps_completed)
            
            print(f"Training for {timesteps_to_train} timesteps...")
            self.agent.agent.learn(total_timesteps=timesteps_to_train, progress_bar=True)
            
            timesteps_completed += timesteps_to_train
            
            # Evaluate performance
            print("Evaluating performance...")
            performance = self.agent.evaluate(n_episodes=100)
            
            # Update training history
            self.training_history['episode_rewards'].append(performance['mean_reward'])
            self.training_history['episode_lengths'].append(performance['mean_length'])
            self.training_history['win_rates'].append(performance['win_rate'])
            
            print(f"Timesteps: {timesteps_completed}/{total_timesteps}")
            print(f"Mean Reward: {performance['mean_reward']:.2f}")
            print(f"Win Rate: {performance['win_rate']:.2f}")
            print(f"Mean Episode Length: {performance['mean_length']:.2f}")
            print("-" * 30)
            
            # Save model periodically
            if timesteps_completed % save_freq == 0:
                model_path = f"models/pokemon_agent_{timesteps_completed}"
                self.agent.save_model(model_path)
                print(f"Model saved to {model_path}")
            
            # Update team performance
            self._update_team_performance(performance)
            
            evaluation_count += 1
        
        # Final evaluation
        print("Running final evaluation...")
        final_performance = self.agent.evaluate(n_episodes=1000)
        print(f"Final Performance: {final_performance}")
        
        # Save final model
        self.agent.save_model("models/pokemon_agent_final")
        
        # Save training history
        self._save_training_history()
        
        # Plot training progress
        self._plot_training_progress()
        
        print("Training completed!")
        
    def _load_training_data(self):
        """Load Pokemon data and meta teams."""
        
        # Load Pokemon data
        pokemon_data = load_pokemon_data()
        
        # Load meta teams
        meta_teams = get_meta_teams()
        
        # Update environment with meta teams
        if meta_teams:
            self.env.meta_teams = meta_teams
            self.env.current_team_index = 0
        
        print(f"Loaded {len(pokemon_data)} Pokemon")
        print(f"Loaded {len(meta_teams)} meta teams")
        
    def _update_team_performance(self, performance: Dict[str, float]):
        """Update team performance based on evaluation results."""
        
        # This is simplified - in reality, we'd track which team was used
        # and update performance accordingly
        for team_index in range(self.num_teams):
            # Simulate team performance update
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
        
        print(f"Best performing team: {best_team}")
        team_rates = [f'{i}: {stats["win_rate"]:.2f}' for i, stats in team_stats.items()]
        print(f"Team win rates: {team_rates}")
        
    def _save_training_history(self):
        """Save training history to file."""
        
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"training_history_{timestamp}.json"
        
        with open(filename, 'w') as f:
            json.dump(self.training_history, f, indent=2)
        
        print(f"Training history saved to {filename}")
        
    def _plot_training_progress(self):
        """Plot training progress."""
        
        fig, axes = plt.subplots(2, 2, figsize=(15, 10))
        
        # Episode rewards
        axes[0, 0].plot(self.training_history['episode_rewards'])
        axes[0, 0].set_title('Episode Rewards')
        axes[0, 0].set_xlabel('Evaluation')
        axes[0, 0].set_ylabel('Mean Reward')
        
        # Win rates
        axes[0, 1].plot(self.training_history['win_rates'])
        axes[0, 1].set_title('Win Rate')
        axes[0, 1].set_xlabel('Evaluation')
        axes[0, 1].set_ylabel('Win Rate')
        
        # Episode lengths
        axes[1, 0].plot(self.training_history['episode_lengths'])
        axes[1, 0].set_title('Episode Lengths')
        axes[1, 0].set_xlabel('Evaluation')
        axes[1, 0].set_ylabel('Mean Length')
        
        # Team performance
        if self.training_history['team_performance']:
            team_stats = self.training_history['team_performance'][-1]['team_stats']
            teams = list(team_stats.keys())
            win_rates = [team_stats[team]['win_rate'] for team in teams]
            
            axes[1, 1].bar(teams, win_rates)
            axes[1, 1].set_title('Team Performance')
            axes[1, 1].set_xlabel('Team Index')
            axes[1, 1].set_ylabel('Win Rate')
        
        plt.tight_layout()
        plt.savefig('training_progress.png', dpi=300, bbox_inches='tight')
        plt.show()
        
        print("Training progress plot saved to training_progress.png")

def main():
    """Main training function."""
    
    # Create trainer
    trainer = PokemonTrainer(team_size=6, num_teams=10)
    
    # Train the agent
    trainer.train(
        total_timesteps=1000000,  # 1 million timesteps
        evaluation_freq=10000,    # Evaluate every 10k timesteps
        save_freq=50000          # Save every 50k timesteps
    )

if __name__ == "__main__":
    main()
