# [Step 1b] Sync Doc Snapshot Markdown Files
$host.UI.RawUI.WindowTitle = "[Step 1b] Sync Doc Snapshot Markdown Files"
$RootDir = Split-Path -Parent $PSScriptRoot

Write-Host "================================================================" -ForegroundColor Cyan
Write-Host " [Step 1b] Updating Doc Snapshot Markdown Files from Live Docs" -ForegroundColor Cyan
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host ""
Set-Location $RootDir

node scripts\check-doc-drift.mjs --update

Write-Host ""
Read-Host "Press ENTER to continue"

