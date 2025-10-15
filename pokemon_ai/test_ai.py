"""
Test script for the Pokemon Showdown AI.
"""

import os
import sys
import numpy as np
import matplotlib.pyplot as plt
from typing import List, Dict, Any
import json

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from environment.pokemon_env import PokemonBattleEnv
from models.pokemon_agent import PokemonAgent
from data.team_loader import TeamLoader
from environment.game_state import ActionType

def test_environment():
    """Test the Pokemon battle environment."""
    
    print("Testing Pokemon Battle Environment")
    print("=" * 40)
    
    # Create environment
    env = PokemonBattleEnv(team_size=6)
    
    # Test environment reset
    obs = env.reset()
    print(f"Initial observation shape: {obs.shape}")
    
    # Test random actions
    for i in range(10):
        action = env.action_space.sample()
        obs, reward, done, info = env.step(action)
        
        print(f"Step {i+1}: Reward={reward:.2f}, Done={done}")
        
        if done:
            print("Episode ended")
            break
    
    print("Environment test completed successfully!")
    return True

def test_agent():
    """Test the Pokemon AI agent."""
    
    print("\\nTesting Pokemon AI Agent")
    print("=" * 40)
    
    # Create environment
    env = PokemonBattleEnv(team_size=6)
    
    # Create agent
    agent = PokemonAgent(env)
    
    # Test agent prediction
    obs = env.reset()
    action = agent.predict(obs)
    print(f"Agent action shape: {action.shape}")
    
    # Test agent evaluation
    performance = agent.evaluate(n_episodes=10)
    print(f"Agent performance: {performance}")
    
    print("Agent test completed successfully!")
    return True

def test_team_loader():
    """Test the team loader."""
    
    print("\\nTesting Team Loader")
    print("=" * 40)
    
    # Create team loader
    team_loader = TeamLoader()
    
    # Load meta teams
    teams = team_loader.load_meta_teams()
    print(f"Loaded {len(teams)} teams")
    
    if teams:
        # Test team stats
        stats = team_loader.get_team_stats()
        print(f"Team statistics: {stats}")
        
        # Test random team
        random_team = team_loader.get_random_team()
        print(f"Random team size: {len(random_team)}")
        
        if random_team:
            print(f"First Pokemon: {random_team[0].pokemon.name}")
            print(f"First Pokemon types: {[t.value for t in random_team[0].pokemon.types]}")
            print(f"First Pokemon moves: {[m.name for m in random_team[0].pokemon.moves]}")
    
    print("Team loader test completed successfully!")
    return True

def test_battle_simulation():
    """Test battle simulation."""
    
    print("\\nTesting Battle Simulation")
    print("=" * 40)
    
    # Create environment
    env = PokemonBattleEnv(team_size=6)
    
    # Run a complete battle
    obs = env.reset()
    total_reward = 0
    step_count = 0
    
    while step_count < 50:  # Limit steps for testing
        action = env.action_space.sample()
        obs, reward, done, info = env.step(action)
        
        total_reward += reward
        step_count += 1
        
        if done:
            print(f"Battle ended after {step_count} steps")
            print(f"Total reward: {total_reward:.2f}")
            break
    
    print("Battle simulation test completed successfully!")
    return True

def run_comprehensive_test():
    """Run comprehensive tests for the Pokemon AI system."""
    
    print("Pokemon Showdown AI - Comprehensive Test Suite")
    print("=" * 60)
    
    tests = [
        ("Environment", test_environment),
        ("Agent", test_agent),
        ("Team Loader", test_team_loader),
        ("Battle Simulation", test_battle_simulation)
    ]
    
    results = {}
    
    for test_name, test_func in tests:
        try:
            print(f"\\nRunning {test_name} test...")
            success = test_func()
            results[test_name] = "PASSED" if success else "FAILED"
        except Exception as e:
            print(f"Error in {test_name} test: {e}")
            results[test_name] = "FAILED"
    
    # Print results
    print("\\n" + "=" * 60)
    print("TEST RESULTS")
    print("=" * 60)
    
    for test_name, result in results.items():
        status = "✓" if result == "PASSED" else "✗"
        print(f"{status} {test_name}: {result}")
    
    # Overall result
    all_passed = all(result == "PASSED" for result in results.values())
    print(f"\\nOverall: {'ALL TESTS PASSED' if all_passed else 'SOME TESTS FAILED'}")
    
    return all_passed

def main():
    """Main test function."""
    
    # Run comprehensive tests
    success = run_comprehensive_test()
    
    if success:
        print("\\n🎉 All tests passed! The Pokemon AI system is ready for training.")
    else:
        print("\\n❌ Some tests failed. Please check the errors above.")
    
    return success

if __name__ == "__main__":
    main()
