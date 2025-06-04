
import os
import json
import logging
import asyncio
import aiohttp
from datetime import datetime
from typing import Dict, Any, Optional

class SupabaseSync:
    """Synchronizes session data with Supabase for analytics"""
    
    def __init__(self, logger):
        self.logger = logger
        self.supabase_url = os.getenv("SUPABASE_URL", "https://niqnhnallagcabxpeckx.supabase.co")
        self.supabase_key = os.getenv("SUPABASE_ANON_KEY", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5pcW5obmFsbGFnY2FieHBlY2t4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc2OTE5NjUsImV4cCI6MjA2MzI2Nzk2NX0.eJnacEIoqyEloeTrxI1nhb6D6vaPmSESoElMPo23o94")
        self.headers = {
            "apikey": self.supabase_key,
            "Authorization": f"Bearer {self.supabase_key}",
            "Content-Type": "application/json"
        }
        self.session = None
    
    async def _get_session(self):
        """Get or create aiohttp session"""
        if self.session is None or self.session.closed:
            self.session = aiohttp.ClientSession(headers=self.headers)
        return self.session
    
    async def sync_session_start(self, session_data: Dict[str, Any]) -> bool:
        """Sync session start with Supabase"""
        try:
            session = await self._get_session()
            
            # Map local session data to Supabase format
            supabase_data = {
                "session_id": session_data.get("session_id"),
                "game_id": session_data.get("game_id"),
                "venue_id": session_data.get("venue_id"),
                "payment_method": "rfid",  # Default for backend sessions
                "amount_paid": self._calculate_session_price(session_data.get("duration_seconds", 300)),
                "rfid_tag": session_data.get("rfid_tag"),
                "status": "active"
            }
            
            url = f"{self.supabase_url}/rest/v1/session_tracking"
            
            async with session.post(url, json=supabase_data) as response:
                if response.status == 201:
                    self.logger.info(f"Session {session_data['session_id']} synced to Supabase")
                    return True
                else:
                    error_text = await response.text()
                    self.logger.error(f"Failed to sync session start: {response.status} - {error_text}")
                    return False
                    
        except Exception as e:
            self.logger.error(f"Error syncing session start: {e}")
            return False
    
    async def sync_session_end(self, session_id: str, end_data: Dict[str, Any]) -> bool:
        """Sync session end with Supabase"""
        try:
            session = await self._get_session()
            
            # Update session with end data
            update_data = {
                "end_time": datetime.now().isoformat(),
                "duration_seconds": end_data.get("duration_seconds"),
                "status": "completed",
                "rating": end_data.get("rating")
            }
            
            url = f"{self.supabase_url}/rest/v1/session_tracking"
            params = {"session_id": f"eq.{session_id}"}
            
            async with session.patch(url, json=update_data, params=params) as response:
                if response.status == 204:
                    self.logger.info(f"Session {session_id} end synced to Supabase")
                    return True
                else:
                    error_text = await response.text()
                    self.logger.error(f"Failed to sync session end: {response.status} - {error_text}")
                    return False
                    
        except Exception as e:
            self.logger.error(f"Error syncing session end: {e}")
            return False
    
    def _calculate_session_price(self, duration_seconds: int) -> float:
        """Calculate session price based on duration"""
        if duration_seconds <= 300:  # 5 minutes
            return 100.0
        elif duration_seconds <= 600:  # 10 minutes
            return 150.0
        elif duration_seconds <= 900:  # 15 minutes
            return 200.0
        elif duration_seconds <= 1200:  # 20 minutes
            return 220.0
        else:
            return 250.0  # 20+ minutes
    
    async def close(self):
        """Close the aiohttp session"""
        if self.session and not self.session.closed:
            await self.session.close()
