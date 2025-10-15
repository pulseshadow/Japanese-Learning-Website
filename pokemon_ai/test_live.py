#!/usr/bin/env python3
"""
Test the AI against live Pokemon Showdown (requires manual setup).
"""

import sys
import os

# Add current directory to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

def test_live_play():
    """Instructions for testing against live Pokemon Showdown."""
    
    print("Pokemon Showdown AI - Live Testing")
    print("=" * 50)
    
    print("To test your AI against live Pokemon Showdown:")
    print()
    print("1. 🎮 Go to https://play.pokemonshowdown.com/")
    print("2. 🔐 Create an account or login")
    print("3. 🏆 Go to 'Battle' → 'Find a User' → 'Anything Goes'")
    print("4. 🤖 Run this command in another terminal:")
    print("   python main.py live --username YourUsername --password YourPassword")
    print()
    print("⚠️  Note: The live interface is complex and may need manual setup.")
    print("   For now, use the battle viewer to test your AI!")
    print()
    print("🎯 Recommended: Use 'python watch_ai_play.py' to see your AI in action!")

if __name__ == "__main__":
    test_live_play()
