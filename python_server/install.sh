
#!/bin/bash
# Installation script for the VR Command Center server

# Exit on error
set -e

# Create a virtual environment
echo "Creating Python virtual environment..."
python3 -m venv venv
source venv/bin/activate

# Install requirements
echo "Installing dependencies..."
pip install -r requirements.txt

# Create configuration
if [ ! -f .env ]; then
    echo "Creating default configuration..."
    cp .env.example .env
fi

# Check if games.json exists
if [ ! -f games.json ]; then
    echo "WARNING: games.json not found! A default will be created on first run."
    echo "Please update games.json with your actual game installations."
fi

echo "Installation complete!"
echo ""
echo "To start the server manually:"
echo "  source venv/bin/activate"
echo "  python server.py"
echo ""
echo "To install as a system service (requires sudo):"
echo "  sudo cp vr-server.service /etc/systemd/system/"
echo "  sudo systemctl enable vr-server"
echo "  sudo systemctl start vr-server"
echo ""
echo "Don't forget to update games.json with your actual VR game installations!"
