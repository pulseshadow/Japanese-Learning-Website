"""
Neural network agent for Pokemon Showdown battles.
"""

import torch
import torch.nn as nn
import torch.nn.functional as F
import numpy as np
from typing import Tuple, List, Dict, Any
from stable_baselines3 import PPO
from stable_baselines3.common.torch_layers import BaseFeaturesExtractor

class PokemonFeatureExtractor(BaseFeaturesExtractor):
    """Custom feature extractor for Pokemon battle states."""
    
    def __init__(self, observation_space, features_dim: int = 512):
        super().__init__(observation_space, features_dim)
        
        # Input size from observation space
        input_size = observation_space.shape[0]
        
        # Neural network layers
        self.fc1 = nn.Linear(input_size, 512)
        self.fc2 = nn.Linear(512, 512)
        self.fc3 = nn.Linear(512, 256)
        self.fc4 = nn.Linear(256, features_dim)
        
        # Dropout for regularization
        self.dropout = nn.Dropout(0.2)
        
    def forward(self, observations: torch.Tensor) -> torch.Tensor:
        """Forward pass through the network."""
        
        x = F.relu(self.fc1(observations))
        x = self.dropout(x)
        x = F.relu(self.fc2(x))
        x = self.dropout(x)
        x = F.relu(self.fc3(x))
        x = self.dropout(x)
        x = self.fc4(x)
        
        return x

class PokemonAgent:
    """Main agent class for Pokemon Showdown battles."""
    
    def __init__(self, env, learning_rate: float = 3e-4, n_steps: int = 2048):
        self.env = env
        self.learning_rate = learning_rate
        self.n_steps = n_steps
        
        # Create PPO agent with custom feature extractor
        self.agent = PPO(
            "MlpPolicy",
            env,
            learning_rate=learning_rate,
            n_steps=n_steps,
            batch_size=64,
            n_epochs=10,
            gamma=0.99,
            gae_lambda=0.95,
            clip_range=0.2,
            ent_coef=0.01,
            vf_coef=0.5,
            max_grad_norm=0.5,
            policy_kwargs={
                "features_extractor_class": PokemonFeatureExtractor,
                "features_extractor_kwargs": {"features_dim": 512},
                "net_arch": [dict(pi=[256, 256], vf=[256, 256])]
            },
            verbose=1
        )
        
        # Training metrics
        self.training_metrics = {
            'episode_rewards': [],
            'episode_lengths': [],
            'win_rate': [],
            'loss': []
        }
        
    def train(self, total_timesteps: int = 1000000, save_freq: int = 10000):
        """Train the agent."""
        
        print(f"Starting training for {total_timesteps} timesteps...")
        
        # Train the agent
        self.agent.learn(
            total_timesteps=total_timesteps,
            progress_bar=True
        )
        
        # Save the trained model
        self.agent.save("pokemon_agent")
        print("Training completed and model saved!")
        
    def predict(self, observation: np.ndarray) -> Tuple[np.ndarray, np.ndarray]:
        """Predict action for given observation."""
        
        action, _ = self.agent.predict(observation, deterministic=True)
        return action
    
    def evaluate(self, n_episodes: int = 100) -> Dict[str, float]:
        """Evaluate the agent's performance."""
        
        episode_rewards = []
        episode_lengths = []
        wins = 0
        
        for episode in range(n_episodes):
            obs, _ = self.env.reset()  # Unpack the tuple
            episode_reward = 0
            episode_length = 0
            
            done = False
            while not done:
                action, _ = self.agent.predict(obs, deterministic=True)
                obs, reward, done, truncated, info = self.env.step(action)  # Updated for gymnasium
                episode_reward += reward
                episode_length += 1
                
                if done or truncated:
                    break
            
            episode_rewards.append(episode_reward)
            episode_lengths.append(episode_length)
            
            if reward > 0:  # Positive reward means win
                wins += 1
        
        return {
            'mean_reward': np.mean(episode_rewards),
            'std_reward': np.std(episode_rewards),
            'mean_length': np.mean(episode_lengths),
            'win_rate': wins / n_episodes
        }
    
    def load_model(self, model_path: str):
        """Load a trained model."""
        
        self.agent = PPO.load(model_path, env=self.env)
        print(f"Model loaded from {model_path}")
    
    def save_model(self, model_path: str):
        """Save the current model."""
        
        self.agent.save(model_path)
        print(f"Model saved to {model_path}")

class TeamSelector:
    """Selects the best team based on win rate."""
    
    def __init__(self, num_teams: int = 10):
        self.num_teams = num_teams
        self.team_performance = {i: {'wins': 0, 'losses': 0, 'win_rate': 0.0} 
                                for i in range(num_teams)}
        
    def update_performance(self, team_index: int, won: bool):
        """Update team performance after a battle."""
        
        if won:
            self.team_performance[team_index]['wins'] += 1
        else:
            self.team_performance[team_index]['losses'] += 1
        
        total_games = (self.team_performance[team_index]['wins'] + 
                      self.team_performance[team_index]['losses'])
        
        if total_games > 0:
            self.team_performance[team_index]['win_rate'] = (
                self.team_performance[team_index]['wins'] / total_games
            )
    
    def get_best_team(self) -> int:
        """Get the team with the highest win rate."""
        
        best_team = max(self.team_performance.keys(), 
                       key=lambda x: self.team_performance[x]['win_rate'])
        return best_team
    
    def get_team_stats(self) -> Dict[int, Dict[str, float]]:
        """Get performance statistics for all teams."""
        
        return self.team_performance.copy()
