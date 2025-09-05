@echo off
echo ========================================
echo Redis Cache Performance System
echo ========================================
echo.

echo Starting all services...
echo.

echo 1. Starting Redis Server...
start "Redis Server" cmd /k "start-redis.bat"

echo Waiting for Redis to start...
timeout /t 3 /nobreak >nul

echo.
echo 2. Starting Backend (Spring Boot)...
start "Backend Server" cmd /k "start-backend.bat"

echo Waiting for backend to start...
timeout /t 10 /nobreak >nul

echo.
echo 3. Starting Frontend (React)...
start "Frontend Server" cmd /k "start-frontend.bat"

echo.
echo ========================================
echo All services are starting...
echo ========================================
echo.
echo Backend:  http://localhost:8080
echo Frontend: http://localhost:3000
echo Redis:    localhost:6379
echo.
echo Press any key to exit this window...
pause >nul
