@echo off
echo ===============================================
echo    DHRW AI Medical Analysis Platform
echo ===============================================
echo.

echo Installing Node.js dependencies...
call npm install

if %errorlevel% neq 0 (
    echo Error: Failed to install dependencies
    pause
    exit /b 1
)

echo.
echo Starting AI Analysis Backend Server...
start "AI Backend" cmd /k "node ai-analysis-backend.js"

echo.
echo Waiting for backend to start...
timeout /t 3 /nobreak > nul

echo.
echo Starting Frontend Server...
start "Frontend" cmd /k "python -m http.server 8000"

echo.
echo ===============================================
echo    Servers Started Successfully!
echo ===============================================
echo.
echo Frontend: http://localhost:8000
echo Backend:  http://localhost:3001
echo.
echo Press any key to open the application...
pause > nul

start http://localhost:8000

echo.
echo Both servers are running. Close this window to stop all servers.
echo Press Ctrl+C in the server windows to stop individual servers.
pause