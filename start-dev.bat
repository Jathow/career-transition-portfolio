@echo off
echo 🚀 Starting Career Portfolio Development Environment...
echo.

echo 🔧 Cleaning up existing processes...
echo Stopping processes on port 5001...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5001') do (
    taskkill /F /PID %%a >nul 2>&1
)

echo Stopping processes on port 3000...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3000') do (
    taskkill /F /PID %%a >nul 2>&1
)

echo ✅ Ports cleared!
echo.

echo 🎯 Starting development servers...
echo Backend: http://localhost:5001
echo Frontend: http://localhost:3000
echo.

npm run dev 