@echo off
echo Starting Redis Cache Performance Backend...
echo.

echo Checking if Redis is running...
redis-cli ping >nul 2>&1
if %errorlevel% neq 0 (
    echo Redis is not running. Please start Redis first.
    echo You can start Redis using: docker run -d -p 6379:6379 redis:latest
    echo Or install Redis locally and run: redis-server
    pause
    exit /b 1
)

echo Redis is running. Starting Spring Boot application...
echo.
mvn spring-boot:run
