
@echo off
ECHO ============================================
ECHO Installing VR Command Center Server
ECHO ============================================

:: Create directories
ECHO Creating necessary directories...
mkdir logs 2>NUL
mkdir data 2>NUL
mkdir certificates 2>NUL

:: Create a virtual environment
ECHO Creating Python virtual environment...
python -m venv venv
call venv\Scripts\activate.bat

:: Install requirements
ECHO Installing dependencies...
pip install --upgrade pip
pip install -r requirements.txt

:: Create configuration if it doesn't exist
if not exist .env (
    ECHO Creating default configuration...
    copy .env.example .env
    ECHO ** IMPORTANT ** 
    ECHO Please update .env with secure values for VR_API_KEY and RFID_JWT_SECRET
)

:: Check if games.json exists
if not exist games.json (
    ECHO Creating sample games.json...
    echo { > games.json
    echo   "games": [ >> games.json
    echo     { >> games.json
    echo       "id": "sample1", >> games.json
    echo       "title": "Sample VR Game 1", >> games.json
    echo       "executable_path": "C:/VRGames/sample1/game.exe", >> games.json
    echo       "working_directory": "C:/VRGames/sample1", >> games.json
    echo       "arguments": "", >> games.json
    echo       "description": "A sample VR game for testing", >> games.json
    echo       "image_url": "/images/sample1.jpg", >> games.json
    echo       "min_duration_seconds": 300, >> games.json
    echo       "max_duration_seconds": 1800 >> games.json
    echo     } >> games.json
    echo   ] >> games.json
    echo } >> games.json
    ECHO WARNING: A sample games.json has been created.
    ECHO Please update games.json with your actual game installations.
)

:: Initialize database
ECHO Initializing database...
python admin_utility.py --init-db

:: Generate self-signed certificates for TLS support
ECHO Do you want to generate self-signed TLS certificates? (Y/N)
set /p generate_certs=
if /i "%generate_certs%"=="Y" (
    ECHO Generating self-signed certificates...
    pushd certificates
    openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365 -nodes -subj "/CN=localhost"
    popd
    ECHO Certificates generated in the certificates directory
    ECHO Update .env and set VR_ENABLE_TLS=true to use them
)

ECHO.
ECHO ============================================
ECHO Installation complete!
ECHO ============================================
ECHO.
ECHO To start the server manually:
ECHO   venv\Scripts\activate
ECHO   python server.py
ECHO.
ECHO To install as a Windows service using NSSM:
ECHO   1. Download NSSM from https://nssm.cc/download
ECHO   2. Run the following commands:
ECHO      nssm install VRCommandCenter "%CD%\venv\Scripts\python.exe" "%CD%\server.py"
ECHO      nssm set VRCommandCenter AppDirectory "%CD%"
ECHO      nssm start VRCommandCenter
ECHO.
ECHO Don't forget to:
ECHO   1. Update games.json with your actual VR game installations
ECHO   2. Configure security settings in .env (especially API keys)
ECHO   3. Set up database backup procedures
ECHO.

pause
