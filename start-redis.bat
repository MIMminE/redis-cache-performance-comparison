@echo off
echo Starting Redis Server...
echo.

echo Checking if Docker is available...
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Docker is not installed or not in PATH.
    echo Please install Docker Desktop or start Redis manually.
    echo.
    echo To start Redis manually:
    echo 1. Download Redis from https://redis.io/download
    echo 2. Run: redis-server
    echo.
    pause
    exit /b 1
)

echo Starting Redis using Docker...
docker run -d -p 6379:6379 --name redis-cache-performance redis:latest

echo.
echo Redis is now running on localhost:6379
echo You can stop it later with: docker stop redis-cache-performance
echo.
pause
