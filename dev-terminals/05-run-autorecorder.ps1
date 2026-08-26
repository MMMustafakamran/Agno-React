# [Step 5] Playwright Autorecorder
$host.UI.RawUI.WindowTitle = "[Step 5] Autorecorder"
$RootDir = Split-Path -Parent $PSScriptRoot

Write-Host "================================================================" -ForegroundColor Cyan
Write-Host " [Step 5] Playwright Autorecorder" -ForegroundColor Cyan
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host " Location:   $RootDir\autorecorder"
Write-Host " Videos Dir: $RootDir\autorecorder\videos"
Write-Host ""
Write-Host " NOTE: Make sure Backend (:8000) and Frontend (:3000) are running!" -ForegroundColor Yellow
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host ""

Set-Location "$RootDir\autorecorder"

if (-not (Test-Path "package.json")) {
    Write-Host "[ERROR] Cannot find autorecorder\package.json!" -ForegroundColor Red
    Read-Host "Press ENTER to exit"
    exit 1
}

if ($args.Count -gt 0) {
    Write-Host "Running with arguments: $args"
    npm run record -- $args
    Write-Host ""
    Read-Host "Press ENTER to continue"
    exit $LASTEXITCODE
}

Write-Host "Select an option:"
Write-Host "  [1] Run all recordings (default)"
Write-Host "  [2] List available demo recordings"
Write-Host "  [3] Run doctor / environment diagnostic"
Write-Host "  [4] Run doctor with online connectivity check"
Write-Host ""
$choice = Read-Host "Enter choice [1-4] (default=1)"

if ($choice -eq "2") {
    npm run record:list
} elseif ($choice -eq "3") {
    npm run doctor
} elseif ($choice -eq "4") {
    npm run doctor:online
} else {
    Write-Host "Running all recordings..." -ForegroundColor Yellow
    npm run record
}

Write-Host ""
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host " Autorecorder run finished." -ForegroundColor Cyan
Write-Host "================================================================" -ForegroundColor Cyan
Read-Host "Press ENTER to continue"

