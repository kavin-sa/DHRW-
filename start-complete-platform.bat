@echo off
echo ===============================================
echo    DHRW Complete Medical Platform
echo ===============================================
echo.
echo Starting all services...
echo.

echo [1/4] Installing Node.js dependencies...
call npm install

if %errorlevel% neq 0 (
    echo Error: Failed to install dependencies
    pause
    exit /b 1
)

echo.
echo [2/4] Starting AI Analysis Backend (Port 3001)...
start "AI Backend" cmd /k "node ai-analysis-backend.js"

echo.
echo [3/4] Starting Doctor Backend API (Port 3002)...
start "Doctor Backend" cmd /k "node doctor-backend.js"

echo.
echo [4/4] Starting Frontend Server (Port 8000)...
start "Frontend" cmd /k "python -m http.server 8000"

echo.
echo Waiting for all services to start...
timeout /t 5 /nobreak > nul

echo.
echo ===============================================
echo    All Services Started Successfully!
echo ===============================================
echo.
echo 🌐 Frontend:        http://localhost:8000
echo 🤖 AI Backend:      http://localhost:3001
echo 👨‍⚕️ Doctor Backend:  http://localhost:3002
echo.
echo ✨ FEATURES AVAILABLE:
echo.
echo 👤 PATIENT PORTAL:
echo    • Medical records management
echo    • AI-powered report analysis
echo    • Access control for doctors
echo    • Audit logs and history
echo    • Shardeum blockchain payments
echo.
echo 👨‍⚕️ DOCTOR PORTAL:
echo    • Patient access requests
echo    • Medical records viewing
echo    • Consultation scheduling
echo    • Dashboard analytics
echo    • Professional verification
echo.
echo Press any key to open the application...
pause > nul

start http://localhost:8000

echo.
echo All servers are running. Close individual server windows to stop services.
echo Press any key to exit this launcher...
pause