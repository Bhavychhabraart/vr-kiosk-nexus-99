
#!/usr/bin/env python3
import argparse
import json
import os
import sys
import logging
import sqlite3
from datetime import datetime

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    handlers=[logging.StreamHandler(sys.stdout)],
)
logger = logging.getLogger("vr-admin")

# Default paths
DATABASE_PATH = os.getenv("VR_DATABASE", "vr_kiosk.db")
GAMES_CONFIG_PATH = os.getenv("VR_GAMES_CONFIG", "games.json")

def connect_db():
    """Connect to the SQLite database"""
    try:
        conn = sqlite3.connect(DATABASE_PATH)
        conn.row_factory = sqlite3.Row
        return conn
    except sqlite3.Error as e:
        logger.error(f"Error connecting to database: {e}")
        sys.exit(1)

def list_games():
    """List all games in the database"""
    conn = connect_db()
    cursor = conn.cursor()
    
    try:
        cursor.execute("SELECT id, title, executable_path FROM games ORDER BY title")
        games = cursor.fetchall()
        
        if not games:
            print("No games found in the database.")
            return
        
        print("\nGames:")
        print("-" * 80)
        print(f"{'ID':<10} {'Title':<30} {'Executable Path':<40}")
        print("-" * 80)
        
        for game in games:
            print(f"{game['id']:<10} {game['title']:<30} {game['executable_path']:<40}")
            
    except sqlite3.Error as e:
        logger.error(f"Error listing games: {e}")
    finally:
        conn.close()

def list_rfid_cards():
    """List all RFID cards in the database"""
    conn = connect_db()
    cursor = conn.cursor()
    
    try:
        cursor.execute("SELECT tag_id, name, status, last_used_at FROM rfid_cards ORDER BY status, name")
        cards = cursor.fetchall()
        
        if not cards:
            print("No RFID cards found in the database.")
            return
        
        print("\nRFID Cards:")
        print("-" * 80)
        print(f"{'Tag ID':<20} {'Name':<20} {'Status':<10} {'Last Used':<20}")
        print("-" * 80)
        
        for card in cards:
            last_used = card['last_used_at'] or "Never"
            print(f"{card['tag_id']:<20} {card['name']:<20} {card['status']:<10} {last_used:<20}")
            
    except sqlite3.Error as e:
        logger.error(f"Error listing RFID cards: {e}")
    finally:
        conn.close()

def list_sessions(limit=10):
    """List recent game sessions"""
    conn = connect_db()
    cursor = conn.cursor()
    
    try:
        cursor.execute("""
            SELECT s.id, s.game_id, g.title, s.start_time, s.end_time, 
                   s.duration_seconds, s.rfid_tag, s.rating, s.status
            FROM sessions s
            LEFT JOIN games g ON s.game_id = g.id
            ORDER BY s.start_time DESC
            LIMIT ?
        """, (limit,))
        
        sessions = cursor.fetchall()
        
        if not sessions:
            print("No game sessions found in the database.")
            return
        
        print("\nRecent Game Sessions:")
        print("-" * 100)
        print(f"{'Session ID':<15} {'Game':<20} {'Start Time':<20} {'Duration':<10} {'Status':<10} {'Rating':<6}")
        print("-" * 100)
        
        for session in sessions:
            game_name = session['title'] or session['game_id']
            start_time = session['start_time'][:16] if session['start_time'] else "Unknown"
            duration = f"{session['duration_seconds']}s" if session['duration_seconds'] else "N/A"
            rating = session['rating'] if session['rating'] else "-"
            
            print(f"{session['id'][:12]:<15} {game_name[:20]:<20} {start_time:<20} {duration:<10} {session['status']:<10} {rating:<6}")
            
    except sqlite3.Error as e:
        logger.error(f"Error listing sessions: {e}")
    finally:
        conn.close()

def add_rfid_card(tag_id, name):
    """Add a new RFID card"""
    conn = connect_db()
    cursor = conn.cursor()
    
    try:
        # Check if tag already exists
        cursor.execute("SELECT tag_id FROM rfid_cards WHERE tag_id = ?", (tag_id,))
        if cursor.fetchone():
            print(f"RFID card with tag ID {tag_id} already exists")
            return False
        
        # Add the new card
        cursor.execute("""
            INSERT INTO rfid_cards (tag_id, name, status, created_at)
            VALUES (?, ?, ?, ?)
        """, (tag_id, name, "active", datetime.now().isoformat()))
        
        conn.commit()
        print(f"Added RFID card: {tag_id} - {name}")
        return True
        
    except sqlite3.Error as e:
        logger.error(f"Error adding RFID card: {e}")
        return False
    finally:
        conn.close()

def change_rfid_status(tag_id, status):
    """Change the status of an RFID card"""
    if status not in ["active", "inactive"]:
        print(f"Invalid status: {status}. Must be 'active' or 'inactive'")
        return False
    
    conn = connect_db()
    cursor = conn.cursor()
    
    try:
        cursor.execute("""
            UPDATE rfid_cards
            SET status = ?, updated_at = ?
            WHERE tag_id = ?
        """, (status, datetime.now().isoformat(), tag_id))
        
        if cursor.rowcount == 0:
            print(f"No RFID card found with tag ID: {tag_id}")
            return False
            
        conn.commit()
        print(f"Changed RFID card {tag_id} status to {status}")
        return True
        
    except sqlite3.Error as e:
        logger.error(f"Error changing RFID card status: {e}")
        return False
    finally:
        conn.close()

def show_system_info():
    """Show system information"""
    conn = connect_db()
    cursor = conn.cursor()
    
    try:
        # Count games
        cursor.execute("SELECT COUNT(*) as count FROM games")
        game_count = cursor.fetchone()['count']
        
        # Count RFID cards
        cursor.execute("SELECT COUNT(*) as count FROM rfid_cards")
        rfid_count = cursor.fetchone()['count']
        
        # Count sessions
        cursor.execute("SELECT COUNT(*) as count FROM sessions")
        session_count = cursor.fetchone()['count']
        
        # Get database file size
        db_size_mb = os.path.getsize(DATABASE_PATH) / (1024 * 1024)
        
        # Get settings
        cursor.execute("SELECT COUNT(*) as count FROM settings")
        settings_count = cursor.fetchone()['count']
        
        print("\nSystem Information:")
        print("-" * 40)
        print(f"Database Path:      {DATABASE_PATH}")
        print(f"Database Size:      {db_size_mb:.2f} MB")
        print(f"Games:              {game_count}")
        print(f"RFID Cards:         {rfid_count}")
        print(f"Session History:    {session_count}")
        print(f"Settings:           {settings_count}")
        
        # Show database schema version or other important info
        print("\nDatabase Tables:")
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
        tables = cursor.fetchall()
        for table in tables:
            print(f"  - {table['name']}")
            
    except sqlite3.Error as e:
        logger.error(f"Error getting system info: {e}")
    finally:
        conn.close()

def main():
    parser = argparse.ArgumentParser(description='VR Kiosk Server Admin Utility')
    subparsers = parser.add_subparsers(dest='command', help='Command to run')
    
    # List games command
    list_games_parser = subparsers.add_parser('list-games', help='List all games')
    
    # List RFID cards command
    list_rfid_parser = subparsers.add_parser('list-rfid', help='List all RFID cards')
    
    # List sessions command
    list_sessions_parser = subparsers.add_parser('list-sessions', help='List recent game sessions')
    list_sessions_parser.add_argument('--limit', type=int, default=10, help='Maximum number of sessions to show')
    
    # Add RFID card command
    add_rfid_parser = subparsers.add_parser('add-rfid', help='Add a new RFID card')
    add_rfid_parser.add_argument('tag_id', help='RFID tag ID')
    add_rfid_parser.add_argument('name', help='Name for the RFID card')
    
    # Change RFID status command
    change_rfid_status_parser = subparsers.add_parser('change-rfid-status', help='Change RFID card status')
    change_rfid_status_parser.add_argument('tag_id', help='RFID tag ID')
    change_rfid_status_parser.add_argument('status', choices=['active', 'inactive'], help='New status')
    
    # System info command
    system_info_parser = subparsers.add_parser('system-info', help='Show system information')
    
    # Parse arguments
    args = parser.parse_args()
    
    # Check if database exists
    if not os.path.exists(DATABASE_PATH):
        logger.error(f"Database file not found: {DATABASE_PATH}")
        return 1
    
    # Execute command
    if args.command == 'list-games':
        list_games()
    elif args.command == 'list-rfid':
        list_rfid_cards()
    elif args.command == 'list-sessions':
        list_sessions(args.limit)
    elif args.command == 'add-rfid':
        add_rfid_card(args.tag_id, args.name)
    elif args.command == 'change-rfid-status':
        change_rfid_status(args.tag_id, args.status)
    elif args.command == 'system-info':
        show_system_info()
    else:
        parser.print_help()
    
    return 0

if __name__ == "__main__":
    sys.exit(main())
