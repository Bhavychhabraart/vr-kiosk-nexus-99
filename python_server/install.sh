
#!/bin/bash
# Installation script for the VR Command Center server

# Exit on error
set -e

echo "=== VR Command Center Server Installation ==="
echo ""

# Check Python version
if command -v python3 &>/dev/null; then
    PYTHON_VERSION=$(python3 --version)
    echo "Found $PYTHON_VERSION"
    
    # Check Python version is at least 3.8
    if [[ $(python3 -c 'import sys; print(sys.version_info >= (3, 8))') == "False" ]]; then
        echo "Error: Python 3.8 or higher is required."
        exit 1
    fi
else
    echo "Error: Python 3 not found. Please install Python 3.8 or higher."
    exit 1
fi

# Create a virtual environment
echo "Creating Python virtual environment..."
python3 -m venv venv
source venv/bin/activate

# Install requirements
echo "Installing dependencies..."
pip install --upgrade pip
pip install -r requirements.txt

# Create configuration
if [ ! -f .env ]; then
    echo "Creating default configuration..."
    cp .env.example .env
    echo "Please update .env with your specific settings."
else
    echo ".env configuration already exists."
fi

# Check if games.json exists
if [ ! -f games.json ]; then
    echo "Creating sample games.json..."
    cat > games.json <<EOL
{
  "games": [
    {
      "id": "sample1",
      "title": "Sample VR Game 1",
      "executable_path": "/path/to/sample1.exe",
      "working_directory": "/path/to",
      "arguments": "",
      "description": "A sample VR game for testing",
      "image_url": "/images/sample1.jpg",
      "min_duration_seconds": 300,
      "max_duration_seconds": 1800
    }
  ]
}
EOL
    echo "WARNING: A sample games.json has been created."
    echo "Please update games.json with your actual game installations."
fi

# Create logs directory
mkdir -p logs

echo ""
echo "=== Installation complete! ==="
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
echo ""
