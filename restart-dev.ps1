# Script to restart Vite dev server with proper cache clearing
Write-Host "🛑 Stopping all Node processes..." -ForegroundColor Yellow

# Stop all Node processes
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2

Write-Host "🧹 Clearing Vite cache..." -ForegroundColor Yellow

# Remove Vite cache
if (Test-Path "node_modules\.vite") {
    Remove-Item -Recurse -Force "node_modules\.vite" -ErrorAction SilentlyContinue
    Write-Host "✅ Vite cache cleared" -ForegroundColor Green
} else {
    Write-Host "ℹ️  No Vite cache found" -ForegroundColor Cyan
}

Write-Host "📋 Checking .env file..." -ForegroundColor Yellow
if (Test-Path ".env") {
    Write-Host "✅ .env file exists" -ForegroundColor Green
    Write-Host "📄 Contents:" -ForegroundColor Cyan
    Get-Content .env | ForEach-Object { Write-Host "   $_" -ForegroundColor Gray }
} else {
    Write-Host "❌ .env file not found!" -ForegroundColor Red
    exit 1
}

Write-Host "`n🚀 Starting Vite dev server..." -ForegroundColor Green
Write-Host "   Please wait for the server to start..." -ForegroundColor Cyan
Write-Host "   Then open http://localhost:8080 in your browser`n" -ForegroundColor Cyan

# Start dev server
npm run dev

