"""
Client for connecting to Pokemon Showdown and playing live games.
"""

import asyncio
import websockets
import json
import re
import numpy as np
from typing import Dict, List, Optional, Tuple, Any
from dataclasses import dataclass
from datetime import datetime

from models.pokemon_agent import PokemonAgent
from environment.game_state import GameState, Action, ActionType
from data.pokemon_data import ActivePokemon, Pokemon, Stats, Move, Type

@dataclass
class ShowdownMessage:
    """Represents a message from Pokemon Showdown."""
    room: str
    message: str
    timestamp: datetime

class PokemonShowdownClient:
    """Client for connecting to Pokemon Showdown and playing live games."""
    
    def __init__(self, username: str, password: str = None):
        self.username = username
        self.password = password
        self.websocket = None
        self.agent = None
        self.current_battle = None
        self.battle_state = None
        
        # Connection settings
        self.showdown_url = "ws://sim.smogon.com:8000/showdown/websocket"
        self.rooms = []
        
    async def connect(self):
        """Connect to Pokemon Showdown."""
        
        try:
            self.websocket = await websockets.connect(self.showdown_url)
            print(f"Connected to Pokemon Showdown as {self.username}")
            
            # Login
            await self._login()
            
            # Start listening for messages
            await self._listen_for_messages()
            
        except Exception as e:
            print(f"Connection failed: {e}")
            raise
    
    async def _login(self):
        """Login to Pokemon Showdown."""
        
        # Send login command
        login_cmd = f"|/trn {self.username},0,{self.password or ''}"
        await self.websocket.send(login_cmd)
        
        # Wait for login confirmation
        await asyncio.sleep(1)
        
        # Join battle room
        await self._join_battle_room()
    
    async def _join_battle_room(self):
        """Join a battle room."""
        
        # For now, join a random battle room
        # In practice, you'd want to join specific rooms or create battles
        join_cmd = "|/join gen9anythinggoes"
        await self.websocket.send(join_cmd)
        self.rooms.append("gen9anythinggoes")
    
    async def _listen_for_messages(self):
        """Listen for messages from Pokemon Showdown."""
        
        try:
            async for message in self.websocket:
                await self._handle_message(message)
        except websockets.exceptions.ConnectionClosed:
            print("Connection closed")
        except Exception as e:
            print(f"Error listening for messages: {e}")
    
    async def _handle_message(self, message: str):
        """Handle incoming messages from Pokemon Showdown."""
        
        # Parse message
        parts = message.split('|')
        if len(parts) < 2:
            return
        
        room = parts[0] if parts[0] else "global"
        message_type = parts[1]
        
        # Handle different message types
        if message_type == "init":
            await self._handle_battle_init(parts)
        elif message_type == "start":
            await self._handle_battle_start(parts)
        elif message_type == "turn":
            await self._handle_turn_start(parts)
        elif message_type == "move":
            await self._handle_move(parts)
        elif message_type == "switch":
            await self._handle_switch(parts)
        elif message_type == "win":
            await self._handle_battle_end(parts)
        elif message_type == "error":
            await self._handle_error(parts)
    
    async def _handle_battle_init(self, parts: List[str]):
        """Handle battle initialization."""
        
        print("Battle initialized")
        self.current_battle = {
            'id': parts[2] if len(parts) > 2 else 'unknown',
            'format': parts[3] if len(parts) > 3 else 'unknown',
            'state': 'initializing'
        }
        
        # Initialize battle state
        self.battle_state = GameState()
        
    async def _handle_battle_start(self, parts: List[str]):
        """Handle battle start."""
        
        print("Battle started")
        if self.current_battle:
            self.current_battle['state'] = 'active'
        
        # Load agent if not already loaded
        if self.agent is None:
            self.agent = PokemonAgent(None)  # Environment not needed for live play
            self.agent.load_model("models/pokemon_agent_final")
    
    async def _handle_turn_start(self, parts: List[str]):
        """Handle turn start."""
        
        print("Turn started")
        
        # Get current game state
        if self.battle_state:
            # Parse battle state from message
            await self._parse_battle_state(parts)
            
            # Get AI action
            action = await self._get_ai_action()
            
            # Send action to Pokemon Showdown
            if action:
                await self._send_action(action)
    
    async def _handle_move(self, parts: List[str]):
        """Handle move execution."""
        
        if len(parts) > 2:
            move_name = parts[2]
            print(f"Move executed: {move_name}")
    
    async def _handle_switch(self, parts: List[str]):
        """Handle Pokemon switch."""
        
        if len(parts) > 2:
            pokemon_name = parts[2]
            print(f"Pokemon switched: {pokemon_name}")
    
    async def _handle_battle_end(self, parts: List[str]):
        """Handle battle end."""
        
        if len(parts) > 2:
            winner = parts[2]
            print(f"Battle ended. Winner: {winner}")
            
            # Reset battle state
            self.current_battle = None
            self.battle_state = None
    
    async def _handle_error(self, parts: List[str]):
        """Handle error messages."""
        
        if len(parts) > 2:
            error_msg = parts[2]
            print(f"Error: {error_msg}")
    
    async def _parse_battle_state(self, parts: List[str]):
        """Parse battle state from Pokemon Showdown message."""
        
        # This is a simplified parser
        # In reality, you'd need to parse the full battle state
        # from the Pokemon Showdown protocol
        
        if self.battle_state is None:
            self.battle_state = GameState()
        
        # Parse team information, HP, status, etc.
        # This would be much more complex in practice
        
    async def _get_ai_action(self) -> Optional[Action]:
        """Get AI action for current state."""
        
        if self.agent is None or self.battle_state is None:
            return None
        
        try:
            # Get state vector
            state_vector = self.battle_state.get_state_vector()
            
            # Get AI prediction
            action_array = self.agent.predict(state_vector)
            
            # Convert to Action object
            action = self._action_array_to_action(action_array)
            
            return action
            
        except Exception as e:
            print(f"Error getting AI action: {e}")
            return None
    
    def _action_array_to_action(self, action_array: np.ndarray) -> Action:
        """Convert action array to Action object."""
        
        action_type = action_array[0]
        move_index = action_array[1]
        pokemon_index = action_array[2]
        tera_type = action_array[3]
        
        if action_type == 0:  # Move
            return Action(ActionType.MOVE, move_index=move_index)
        elif action_type == 1:  # Switch
            return Action(ActionType.SWITCH, pokemon_index=pokemon_index)
        else:  # Terastallize
            return Action(ActionType.TERASTALLIZE, tera_type=Type(tera_type))
    
    async def _send_action(self, action: Action):
        """Send action to Pokemon Showdown."""
        
        if not self.websocket:
            return
        
        try:
            if action.action_type == ActionType.MOVE:
                # Send move command
                move_cmd = f"|/choose move {action.move_index + 1}"
                await self.websocket.send(move_cmd)
                print(f"Sent move command: {move_cmd}")
                
            elif action.action_type == ActionType.SWITCH:
                # Send switch command
                switch_cmd = f"|/choose switch {action.pokemon_index + 1}"
                await self.websocket.send(switch_cmd)
                print(f"Sent switch command: {switch_cmd}")
                
            elif action.action_type == ActionType.TERASTALLIZE:
                # Send terastallize command
                tera_cmd = f"|/choose terastallize {action.tera_type.value}"
                await self.websocket.send(tera_cmd)
                print(f"Sent terastallize command: {tera_cmd}")
                
        except Exception as e:
            print(f"Error sending action: {e}")
    
    async def disconnect(self):
        """Disconnect from Pokemon Showdown."""
        
        if self.websocket:
            await self.websocket.close()
            print("Disconnected from Pokemon Showdown")

async def main():
    """Main function for running the Pokemon Showdown client."""
    
    # Create client
    client = PokemonShowdownClient("PokemonAI", "password")
    
    try:
        # Connect and start playing
        await client.connect()
    except KeyboardInterrupt:
        print("Interrupted by user")
    except Exception as e:
        print(f"Error: {e}")
    finally:
        await client.disconnect()

if __name__ == "__main__":
    asyncio.run(main())
