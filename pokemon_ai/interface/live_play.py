"""
Script for running the Pokemon AI in live Pokemon Showdown games.
"""

import asyncio
import sys
import os
from typing import Optional

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from interface.showdown_client import PokemonShowdownClient

class LivePlayManager:
    """Manages live play sessions with Pokemon Showdown."""
    
    def __init__(self, username: str, password: Optional[str] = None):
        self.username = username
        self.password = password
        self.client = None
        
    async def start_live_play(self):
        """Start live play session."""
        
        print("Starting Pokemon Showdown AI Live Play")
        print("=" * 50)
        
        # Create client
        self.client = PokemonShowdownClient(self.username, self.password)
        
        try:
            # Connect to Pokemon Showdown
            await self.client.connect()
            
            # Keep running until interrupted
            while True:
                await asyncio.sleep(1)
                
        except KeyboardInterrupt:
            print("\\nStopping live play...")
        except Exception as e:
            print(f"Error during live play: {e}")
        finally:
            if self.client:
                await self.client.disconnect()
    
    def run(self):
        """Run the live play session."""
        
        asyncio.run(self.start_live_play())

def main():
    """Main function for live play."""
    
    import argparse
    
    parser = argparse.ArgumentParser(description="Run Pokemon AI in live Pokemon Showdown games")
    parser.add_argument("--username", required=True, help="Pokemon Showdown username")
    parser.add_argument("--password", help="Pokemon Showdown password (optional)")
    
    args = parser.parse_args()
    
    # Create and run live play manager
    manager = LivePlayManager(args.username, args.password)
    manager.run()

if __name__ == "__main__":
    main()
