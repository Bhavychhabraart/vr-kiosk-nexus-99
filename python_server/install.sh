
#!/bin/bash
# Enhanced installation script for the VR Command Center server

# Exit on error
set -e

echo "============================================"
echo "VR Command Center Server Installation"
echo "============================================"
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

# Create necessary directories
echo "Creating necessary directories..."
mkdir -p logs data certificates

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
    echo "** IMPORTANT **"
    echo "Please update .env with secure values for VR_API_KEY and RFID_JWT_SECRET"
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
      "executable_path": "/opt/vrgames/sample1/game",
      "working_directory": "/opt/vrgames/sample1",
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

# Initialize database
echo "Initializing database..."
python3 admin_utility.py --init-db

# Generate self-signed certificates for TLS support
echo "Do you want to generate self-signed TLS certificates? (Y/N)"
read -r generate_certs
if [[ "$generate_certs" =~ ^[Yy]$ ]]; then
    echo "Generating self-signed certificates..."
    pushd certificates > /dev/null
    openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365 -nodes -subj "/CN=localhost"
    popd > /dev/null
    echo "Certificates generated in the certificates directory"
    echo "Update .env and set VR_ENABLE_TLS=true to use them"
fi

# Update service file permissions
chmod 644 vr-server.service

echo ""
echo "============================================"
echo "Installation complete!"
echo "============================================"
echo ""
echo "To start the server manually:"
echo "  source venv/bin/activate"
echo "  python3 server.py"
echo ""
echo "To install as a system service:"
echo "  sudo cp vr-server.service /etc/systemd/system/"
echo "  sudo systemctl daemon-reload"
echo "  sudo systemctl enable vr-server"
echo "  sudo systemctl start vr-server"
echo ""
echo "Don't forget to:"
echo "  1. Update games.json with your actual VR game installations"
echo "  2. Configure security settings in .env (especially API keys)"
echo "  3. Set up database backup procedures"
echo ""
