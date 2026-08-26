# [Step 4] Frontend Next.js App (:3000)
$host.UI.RawUI.WindowTitle = "[Step 4] Frontend Next.js App (:3000)"
$RootDir = Split-Path -Parent $PSScriptRoot

Write-Host "================================================================" -ForegroundColor Cyan
Write-Host " [Step 4] Starting Frontend Next.js Server" -ForegroundColor Cyan
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host " Location:     $RootDir\frontend"
Write-Host " App URL:      http://localhost:3000"
Write-Host " Doc-Sync UI:  http://localhost:3000/doc-sync"
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host ""

Set-Location "$RootDir\frontend"

if (-not (Test-Path "package.json")) {
    Write-Host "[ERROR] Cannot find frontend\package.json!" -ForegroundColor Red
    Read-Host "Press ENTER to exit"
    exit 1
}

Write-Host "Starting Next.js development server with npm run dev..." -ForegroundColor Yellow
Write-Host ""
npm run dev

Write-Host ""
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host " Frontend server process stopped." -ForegroundColor Cyan
Write-Host "================================================================" -ForegroundColor Cyan
Read-Host "Press ENTER to continue"

