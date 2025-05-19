
@echo off
ECHO Installing VR Command Center Server...

:: Create a virtual environment
ECHO Creating Python virtual environment...
python -m venv venv
call venv\Scripts\activate.bat

:: Install requirements
ECHO Installing dependencies...
pip install -r requirements.txt

:: Create configuration if it doesn't exist
if not exist .env (
    ECHO Creating default configuration...
    copy .env.example .env
)

:: Check if games.json exists
if not exist games.json (
    ECHO WARNING: games.json not found! A default will be created on first run.
    ECHO Please update games.json with your actual game installations.
)

ECHO.
ECHO Installation complete!
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
ECHO Don't forget to update games.json with your actual VR game installations!

pause
