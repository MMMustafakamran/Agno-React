# [Step 3] Agno Backend Agent Server (:8000)
$host.UI.RawUI.WindowTitle = "[Step 3] Agno Backend Agent Server (:8000)"
$RootDir = Split-Path -Parent $PSScriptRoot

Write-Host "================================================================" -ForegroundColor Cyan
Write-Host " [Step 3] Starting Agno Backend Agent Server" -ForegroundColor Cyan
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host " Location:     $RootDir\backend"
Write-Host " Server URL:   http://127.0.0.1:8000"
Write-Host " AG-UI Path:   http://127.0.0.1:8000/agui"
Write-Host " Health Check: http://127.0.0.1:8000/health"
Write-Host " API Docs:     http://127.0.0.1:8000/docs"
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host ""

Set-Location "$RootDir\backend"

if (-not (Test-Path "main.py")) {
    Write-Host "[ERROR] Cannot find backend\main.py!" -ForegroundColor Red
    Read-Host "Press ENTER to exit"
    exit 1
}

Write-Host "Starting FastAPI Agent server with uv run..." -ForegroundColor Yellow
Write-Host ""
uv run --prerelease=allow main.py

Write-Host ""
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host " Backend server process stopped." -ForegroundColor Cyan
Write-Host "================================================================" -ForegroundColor Cyan
Read-Host "Press ENTER to continue"

