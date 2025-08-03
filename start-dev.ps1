Write-Host "🚀 Starting Career Portfolio Development Environment..." -ForegroundColor Green
Write-Host ""

Write-Host "🔧 Cleaning up existing processes..." -ForegroundColor Yellow

# Kill all Node.js processes (more aggressive approach)
Write-Host "Stopping all Node.js processes..." -ForegroundColor Cyan
Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue

# Kill processes on port 5001
Write-Host "Stopping processes on port 5001..." -ForegroundColor Cyan
$processes5001 = Get-NetTCPConnection -LocalPort 5001 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess
foreach ($processId in $processes5001) {
    Stop-Process -Id $processId -Force -ErrorAction SilentlyContinue
}

# Kill processes on port 3000
Write-Host "Stopping processes on port 3000..." -ForegroundColor Cyan
$processes3000 = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess
foreach ($processId in $processes3000) {
    Stop-Process -Id $processId -Force -ErrorAction SilentlyContinue
}

# Wait a moment for processes to fully terminate
Start-Sleep -Seconds 2

Write-Host "✅ Ports cleared!" -ForegroundColor Green
Write-Host ""

Write-Host "🎯 Starting development servers..." -ForegroundColor Green
Write-Host "Backend: http://localhost:5001" -ForegroundColor Cyan
Write-Host "Frontend: http://localhost:3000" -ForegroundColor Cyan
Write-Host ""

npm run dev 