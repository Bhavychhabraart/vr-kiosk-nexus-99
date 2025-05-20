
#!/usr/bin/env python3
import argparse
import json
import os
import sys
import sqlite3
import secrets
import bcrypt
import datetime
from pathlib import Path
from dotenv import load_dotenv
from loguru import logger

# Load environment variables
load_dotenv()

# Setup logger
logger.remove()
logger.add(sys.stderr, level="INFO")
logger.add("logs/admin.log", level="INFO", rotation="10 MB", retention="30 days")

class AdminUtility:
    """Admin utility for VR Command Center setup and maintenance"""
    
    def __init__(self):
        self.db_path = os.getenv("VR_DATABASE", "vr_kiosk.db")
        self._ensure_directories()
    
    def _ensure_directories(self):
        """Ensure all required directories exist"""
        os.makedirs("logs", exist_ok=True)
        os.makedirs("data", exist_ok=True)
        os.makedirs("certificates", exist_ok=True)
        
    def initialize_database(self):
        """Initialize the SQLite database with all required tables"""
        logger.info(f"Initializing database at {self.db_path}")
        
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        
        # Create games table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS games (
                id TEXT PRIMARY KEY,
                title TEXT NOT NULL,
                executable_path TEXT,
                working_directory TEXT,
                arguments TEXT,
                description TEXT,
                image_url TEXT,
                min_duration_seconds INTEGER NOT NULL DEFAULT 300,
                max_duration_seconds INTEGER NOT NULL DEFAULT 1800,
                created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                is_active BOOLEAN NOT NULL DEFAULT 1,
                trailer_url TEXT
            )
        """)
        
        # Create RFID cards table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS rfid_cards (
                tag_id TEXT PRIMARY KEY,
                name TEXT,
                status TEXT NOT NULL DEFAULT 'active',
                permission_level TEXT DEFAULT 'user',
                created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                last_used_at TIMESTAMP
            )
        """)
        
        # Create RFID access log table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS rfid_access_log (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                tag_id TEXT NOT NULL,
                action TEXT NOT NULL,
                timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                success BOOLEAN NOT NULL,
                details TEXT,
                FOREIGN KEY (tag_id) REFERENCES rfid_cards (tag_id)
            )
        """)
        
        # Create game permissions table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS rfid_game_permissions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                tag_id TEXT NOT NULL,
                game_id TEXT NOT NULL,
                permission_type TEXT NOT NULL DEFAULT 'allow',
                created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(tag_id, game_id),
                FOREIGN KEY (tag_id) REFERENCES rfid_cards (tag_id),
                FOREIGN KEY (game_id) REFERENCES games (id)
            )
        """)
        
        # Create sessions table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS sessions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                game_id TEXT,
                rfid_tag TEXT,
                start_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                end_time TIMESTAMP,
                duration_seconds INTEGER,
                status TEXT NOT NULL DEFAULT 'active',
                rating INTEGER,
                notes TEXT,
                FOREIGN KEY (game_id) REFERENCES games (id),
                FOREIGN KEY (rfid_tag) REFERENCES rfid_cards (tag_id)
            )
        """)
        
        # Create system events table for logging
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS system_events (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                event_type TEXT NOT NULL,
                severity TEXT NOT NULL,
                message TEXT NOT NULL,
                details TEXT,
                timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        # Create admin users table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS admin_users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                permission_level TEXT NOT NULL DEFAULT 'admin',
                created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                last_login TIMESTAMP
            )
        """)
        
        # Create settings table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS settings (
                id TEXT PRIMARY KEY,
                value JSON NOT NULL,
                updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        # Create triggers for updated_at fields
        cursor.execute("""
            CREATE TRIGGER IF NOT EXISTS games_updated_at 
            AFTER UPDATE ON games
            BEGIN
                UPDATE games SET updated_at = CURRENT_TIMESTAMP
                WHERE id = NEW.id;
            END;
        """)
        
        cursor.execute("""
            CREATE TRIGGER IF NOT EXISTS rfid_cards_updated_at 
            AFTER UPDATE ON rfid_cards
            BEGIN
                UPDATE rfid_cards SET updated_at = CURRENT_TIMESTAMP
                WHERE tag_id = NEW.tag_id;
            END;
        """)
        
        cursor.execute("""
            CREATE TRIGGER IF NOT EXISTS settings_updated_at 
            AFTER UPDATE ON settings
            BEGIN
                UPDATE settings SET updated_at = CURRENT_TIMESTAMP
                WHERE id = NEW.id;
            END;
        """)
        
        # Commit changes and close connection
        conn.commit()
        conn.close()
        
        logger.info("Database initialization complete")
        
    def create_admin_user(self, username, password):
        """Create a new admin user"""
        if not username or not password:
            logger.error("Username and password are required")
            return False
            
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        try:
            # Check if user already exists
            cursor.execute("SELECT username FROM admin_users WHERE username = ?", (username,))
            if cursor.fetchone():
                logger.error(f"User {username} already exists")
                return False
            
            # Hash password
            password_hash = bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()
            
            # Insert new user
            cursor.execute(
                """
                INSERT INTO admin_users (username, password_hash)
                VALUES (?, ?)
                """,
                (username, password_hash)
            )
            
            conn.commit()
            logger.info(f"Admin user {username} created successfully")
            return True
            
        except Exception as e:
            logger.exception(f"Error creating admin user: {e}")
            return False
        finally:
            conn.close()
    
    def import_games_from_json(self, json_file):
        """Import games from a JSON file into the database"""
        try:
            if not os.path.exists(json_file):
                logger.error(f"File not found: {json_file}")
                return False
                
            with open(json_file, 'r') as f:
                data = json.load(f)
                
            if not isinstance(data, dict) or 'games' not in data:
                logger.error(f"Invalid JSON format in {json_file}")
                return False
                
            games = data['games']
            if not isinstance(games, list):
                logger.error(f"Invalid games format in {json_file}")
                return False
                
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            # Import each game
            for game in games:
                if 'id' not in game or 'title' not in game:
                    logger.warning(f"Skipping game without id or title: {game}")
                    continue
                    
                # Check if game already exists
                cursor.execute("SELECT id FROM games WHERE id = ?", (game['id'],))
                existing = cursor.fetchone()
                
                if existing:
                    # Update existing game
                    cursor.execute(
                        """
                        UPDATE games SET
                            title = ?,
                            executable_path = ?,
                            working_directory = ?,
                            arguments = ?,
                            description = ?,
                            image_url = ?,
                            min_duration_seconds = ?,
                            max_duration_seconds = ?,
                            is_active = ?,
                            trailer_url = ?
                        WHERE id = ?
                        """,
                        (
                            game.get('title'),
                            game.get('executable_path'),
                            game.get('working_directory'),
                            game.get('arguments'),
                            game.get('description'),
                            game.get('image_url'),
                            game.get('min_duration_seconds', 300),
                            game.get('max_duration_seconds', 1800),
                            1,  # Active by default
                            game.get('trailer_url'),
                            game['id']
                        )
                    )
                    logger.info(f"Updated existing game: {game['title']}")
                else:
                    # Insert new game
                    cursor.execute(
                        """
                        INSERT INTO games (
                            id, title, executable_path, working_directory, arguments,
                            description, image_url, min_duration_seconds, max_duration_seconds,
                            trailer_url
                        )
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                        """,
                        (
                            game['id'],
                            game.get('title'),
                            game.get('executable_path'),
                            game.get('working_directory'),
                            game.get('arguments'),
                            game.get('description'),
                            game.get('image_url'),
                            game.get('min_duration_seconds', 300),
                            game.get('max_duration_seconds', 1800),
                            game.get('trailer_url')
                        )
                    )
                    logger.info(f"Imported new game: {game['title']}")
            
            conn.commit()
            conn.close()
            
            logger.info(f"Successfully imported {len(games)} games from {json_file}")
            return True
            
        except Exception as e:
            logger.exception(f"Error importing games: {e}")
            return False
    
    def export_games_to_json(self, output_file):
        """Export games from the database to a JSON file"""
        try:
            conn = sqlite3.connect(self.db_path)
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()
            
            cursor.execute("""
                SELECT * FROM games
                WHERE is_active = 1
            """)
            
            games = []
            for row in cursor.fetchall():
                game = dict(row)
                # Convert datetime objects to strings
                for key, value in game.items():
                    if isinstance(value, datetime.datetime):
                        game[key] = value.isoformat()
                games.append(game)
                
            output = {"games": games}
            
            with open(output_file, 'w') as f:
                json.dump(output, f, indent=2)
                
            conn.close()
            logger.info(f"Successfully exported {len(games)} games to {output_file}")
            return True
            
        except Exception as e:
            logger.exception(f"Error exporting games: {e}")
            return False
    
    def register_rfid_card(self, tag_id, name=None):
        """Register a new RFID card"""
        if not tag_id:
            logger.error("RFID tag ID is required")
            return False
            
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        try:
            # Check if card already exists
            cursor.execute("SELECT tag_id FROM rfid_cards WHERE tag_id = ?", (tag_id,))
            if cursor.fetchone():
                logger.error(f"RFID card {tag_id} already exists")
                return False
                
            # Insert new card
            display_name = name or f"Card-{tag_id[-6:]}"
            cursor.execute(
                """
                INSERT INTO rfid_cards (tag_id, name, status)
                VALUES (?, ?, 'active')
                """,
                (tag_id, display_name)
            )
            
            conn.commit()
            logger.info(f"RFID card {tag_id} registered successfully as {display_name}")
            return True
            
        except Exception as e:
            logger.exception(f"Error registering RFID card: {e}")
            return False
        finally:
            conn.close()
    
    def backup_database(self, backup_dir="backups"):
        """Backup the SQLite database"""
        try:
            os.makedirs(backup_dir, exist_ok=True)
            timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
            backup_file = os.path.join(backup_dir, f"vr_kiosk_backup_{timestamp}.db")
            
            # Create a database connection
            conn = sqlite3.connect(self.db_path)
            
            # Create a backup connection and backup the database
            backup_conn = sqlite3.connect(backup_file)
            conn.backup(backup_conn)
            
            # Close connections
            backup_conn.close()
            conn.close()
            
            logger.info(f"Database backup created at {backup_file}")
            return backup_file
            
        except Exception as e:
            logger.exception(f"Error backing up database: {e}")
            return None
    
    def generate_env_file(self):
        """Generate a secure .env file with random secrets"""
        try:
            if os.path.exists(".env") and not self._confirm_overwrite(".env"):
                logger.info("Skipping .env generation to preserve existing file")
                return False
                
            with open(".env.example", "r") as f:
                template = f.read()
                
            # Replace secrets with random values
            template = template.replace("change_this_to_a_secure_random_string", secrets.token_hex(32))
            
            # Write the new .env file
            with open(".env", "w") as f:
                f.write(template)
                
            logger.info("Generated secure .env file")
            return True
            
        except Exception as e:
            logger.exception(f"Error generating .env file: {e}")
            return False
    
    def _confirm_overwrite(self, file_path):
        """Ask user to confirm file overwrite"""
        response = input(f"File {file_path} already exists. Overwrite? (y/N): ").lower()
        return response == 'y' or response == 'yes'
    
    def cleanup_logs(self, max_age_days=30):
        """Clean up old log files"""
        try:
            log_dir = Path("logs")
            if not log_dir.exists():
                return True
                
            cutoff_date = datetime.datetime.now() - datetime.timedelta(days=max_age_days)
            count = 0
            
            for log_file in log_dir.glob("*.log*"):
                # Check file modification time
                if datetime.datetime.fromtimestamp(log_file.stat().st_mtime) < cutoff_date:
                    log_file.unlink()
                    count += 1
                    
            logger.info(f"Cleaned up {count} log files older than {max_age_days} days")
            return True
            
        except Exception as e:
            logger.exception(f"Error cleaning up log files: {e}")
            return False


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='VR Command Center Admin Utility')
    
    parser.add_argument('--init-db', action='store_true', help='Initialize the database')
    parser.add_argument('--create-admin', action='store_true', help='Create an admin user')
    parser.add_argument('--username', help='Admin username')
    parser.add_argument('--password', help='Admin password')
    parser.add_argument('--import-games', help='Import games from JSON file')
    parser.add_argument('--export-games', help='Export games to JSON file')
    parser.add_argument('--register-rfid', help='Register an RFID card')
    parser.add_argument('--card-name', help='Name for the RFID card')
    parser.add_argument('--backup-db', action='store_true', help='Backup the database')
    parser.add_argument('--backup-dir', default='backups', help='Backup directory')
    parser.add_argument('--generate-env', action='store_true', help='Generate secure .env file')
    parser.add_argument('--cleanup-logs', action='store_true', help='Clean up old log files')
    parser.add_argument('--log-age', type=int, default=30, help='Max log age in days')
    
    args = parser.parse_args()
    admin = AdminUtility()
    
    if args.init_db:
        admin.initialize_database()
        
    if args.create_admin:
        username = args.username or input("Enter admin username: ")
        password = args.password or input("Enter admin password: ")
        admin.create_admin_user(username, password)
        
    if args.import_games:
        admin.import_games_from_json(args.import_games)
        
    if args.export_games:
        admin.export_games_to_json(args.export_games)
        
    if args.register_rfid:
        admin.register_rfid_card(args.register_rfid, args.card_name)
        
    if args.backup_db:
        admin.backup_database(args.backup_dir)
        
    if args.generate_env:
        admin.generate_env_file()
        
    if args.cleanup_logs:
        admin.cleanup_logs(args.log_age)
