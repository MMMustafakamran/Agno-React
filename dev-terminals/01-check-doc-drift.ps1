# [Step 1] Documentation Drift & Markdown Snapshot Sync
$host.UI.RawUI.WindowTitle = "[Step 1] Doc Drift Check & Sync"
$RootDir = Split-Path -Parent $PSScriptRoot

Write-Host "================================================================" -ForegroundColor Cyan
Write-Host " [Step 1] Documentation Drift & Markdown Snapshot Sync" -ForegroundColor Cyan
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host " Working Directory: $RootDir"
Write-Host " Target: Live docs.copilotkit.ai vs doc-snapshot/"
Write-Host "================================================================"
Write-Host ""

Set-Location $RootDir

if (-not (Test-Path "scripts\check-doc-drift.mjs")) {
    Write-Host "[ERROR] Cannot find scripts\check-doc-drift.mjs!" -ForegroundColor Red
    Read-Host "Press ENTER to exit"
    exit 1
}

if ($args.Count -gt 0) {
    node scripts\check-doc-drift.mjs $args
    Write-Host ""
    Read-Host "Press ENTER to continue"
    exit $LASTEXITCODE
}

Write-Host "Choose execution mode:"
Write-Host "  [1] Check drift only (Report differences)"
Write-Host "  [2] Sync & update markdown files automatically (Apply changes to doc-snapshot/)"
Write-Host ""
$mode = Read-Host "Enter choice [1-2] (default=1)"

if ($mode -eq "2") {
    Write-Host "`nRunning doc drift with automatic markdown update..." -ForegroundColor Yellow
    node scripts\check-doc-drift.mjs --update
} else {
    Write-Host "`nRunning doc drift check..." -ForegroundColor Yellow
    node scripts\check-doc-drift.mjs
}

Write-Host ""
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host " Doc drift process completed." -ForegroundColor Cyan
Write-Host "================================================================" -ForegroundColor Cyan
Read-Host "Press ENTER to exit"

