#!/usr/bin/env python3
"""
Watch the AI play individual Pokemon battles.
"""

import sys
import os
import time

# Add current directory to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from environment.pokemon_env import PokemonBattleEnv
from models.pokemon_agent import PokemonAgent
from data.team_loader import TeamLoader

def watch_ai_battle():
    """Watch the AI play a single battle with detailed output."""
    
    print("Pokemon Showdown AI - Battle Viewer")
    print("=" * 50)
    
    # Create environment
    env = PokemonBattleEnv(team_size=6)
    
    # Load meta teams
    team_loader = TeamLoader()
    meta_teams = team_loader.load_meta_teams()
    if meta_teams:
        env.meta_teams = meta_teams
        print(f"Loaded {len(meta_teams)} meta teams")
    
    # Create agent
    agent = PokemonAgent(env)
    
    # Try to load trained model
    try:
        agent.load_model("models/pokemon_agent_simple")
        print("✅ Loaded trained model!")
    except:
        try:
            agent.load_model("models/pokemon_agent_partial")
            print("✅ Loaded partial model!")
        except:
            print("⚠️ No trained model found, using untrained AI")
    
    print("\\n🎮 Starting battle...")
    print("-" * 50)
    
    # Reset environment
    obs, _ = env.reset()
    step_count = 0
    total_reward = 0
    
    print(f"Battle started! Player team: {[p.pokemon.name for p in env.game_state.player_pokemon]}")
    print(f"Opponent team: {[p.pokemon.name for p in env.game_state.opponent_pokemon]}")
    print()
    
    while True:
        step_count += 1
        
        # Get AI action
        action, _ = agent.agent.predict(obs, deterministic=True)
        
        # Convert action to readable format
        action_type = action[0]
        move_index = action[1]
        pokemon_index = action[2]
        tera_type = action[3]
        
        # Display action
        if action_type == 0:  # Move
            active_pokemon = env.game_state.player_pokemon[env.game_state.active_player_index]
            move_name = active_pokemon.pokemon.moves[move_index].name
            print(f"Turn {step_count}: AI uses {move_name} with {active_pokemon.pokemon.name}")
        elif action_type == 1:  # Switch
            pokemon_name = env.game_state.player_pokemon[pokemon_index].pokemon.name
            print(f"Turn {step_count}: AI switches to {pokemon_name}")
        else:  # Terastallize
            print(f"Turn {step_count}: AI terastallizes!")
        
        # Execute action
        obs, reward, done, truncated, info = env.step(action)
        total_reward += reward
        
        # Display battle state
        player_hp = sum(p.current_hp for p in env.game_state.player_pokemon)
        opponent_hp = sum(p.current_hp for p in env.game_state.opponent_pokemon)
        
        print(f"  Player HP: {player_hp}, Opponent HP: {opponent_hp}, Reward: {reward:.1f}")
        
        if done or truncated:
            print(f"\\n🏁 Battle ended after {step_count} turns!")
            print(f"Total reward: {total_reward:.1f}")
            if reward > 0:
                print("🎉 AI WON!")
            else:
                print("💀 AI lost")
            break
        
        # Small delay to make it readable
        time.sleep(0.5)
    
    print("\\n" + "=" * 50)
    print("Battle complete!")

def watch_multiple_battles(n_battles=5):
    """Watch the AI play multiple battles."""
    
    print(f"Pokemon Showdown AI - Watching {n_battles} Battles")
    print("=" * 50)
    
    wins = 0
    total_rewards = []
    
    for battle_num in range(1, n_battles + 1):
        print(f"\\n🎮 Battle {battle_num}/{n_battles}")
        print("-" * 30)
        
        # Create fresh environment for each battle
        env = PokemonBattleEnv(team_size=6)
        team_loader = TeamLoader()
        meta_teams = team_loader.load_meta_teams()
        if meta_teams:
            env.meta_teams = meta_teams
        
        agent = PokemonAgent(env)
        
        # Try to load trained model
        try:
            agent.load_model("models/pokemon_agent_simple")
        except:
            try:
                agent.load_model("models/pokemon_agent_partial")
            except:
                pass  # Use untrained model
        
        # Run battle
        obs, _ = env.reset()
        step_count = 0
        total_reward = 0
        
        while step_count < 50:  # Limit turns
            action, _ = agent.agent.predict(obs, deterministic=True)
            obs, reward, done, truncated, info = env.step(action)
            total_reward += reward
            step_count += 1
            
            if done or truncated:
                break
        
        # Record results
        total_rewards.append(total_reward)
        if reward > 0:
            wins += 1
            print(f"✅ Battle {battle_num}: AI WON! (Reward: {total_reward:.1f})")
        else:
            print(f"❌ Battle {battle_num}: AI lost (Reward: {total_reward:.1f})")
    
    # Summary
    print(f"\\n📊 Results Summary:")
    print(f"Wins: {wins}/{n_battles} ({wins/n_battles*100:.1f}%)")
    print(f"Average reward: {sum(total_rewards)/len(total_rewards):.1f}")

if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description="Watch Pokemon AI play battles")
    parser.add_argument("--battles", type=int, default=1, help="Number of battles to watch")
    
    args = parser.parse_args()
    
    if args.battles == 1:
        watch_ai_battle()
    else:
        watch_multiple_battles(args.battles)
