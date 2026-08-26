# Start dev servers in separate terminal windows
$rootDir = $PSScriptRoot

Write-Host "===================================================" -ForegroundColor Cyan
Write-Host " Starting dev servers in separate terminals...    " -ForegroundColor Cyan
Write-Host "===================================================" -ForegroundColor Cyan

# npm
if (Test-Path "$rootDir\npm\app") {
    Write-Host "[npm]  Launching npm dev server in separate terminal..." -ForegroundColor Green
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$rootDir\npm\app'; Write-Host '=== Starting npm run dev ===' -ForegroundColor Cyan; npm run dev"
}

# pnpm
if (Test-Path "$rootDir\pnpm\app") {
    Write-Host "[pnpm] Launching pnpm dev server in separate terminal..." -ForegroundColor Green
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$rootDir\pnpm\app'; Write-Host '=== Starting pnpm run dev ===' -ForegroundColor Cyan; pnpm run dev"
}

# bun
if (Test-Path "$rootDir\bun\app") {
    Write-Host "[bun]  Launching bun dev server in separate terminal..." -ForegroundColor Green
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$rootDir\bun\app'; Write-Host '=== Starting bun run dev ===' -ForegroundColor Cyan; bun run dev"
}

# yarn
if (Test-Path "$rootDir\yarn\app") {
    Write-Host "[yarn] Launching yarn dev server in separate terminal..." -ForegroundColor Green
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$rootDir\yarn\app'; Write-Host '=== Starting yarn run dev ===' -ForegroundColor Cyan; yarn run dev"
}

Write-Host ""
Write-Host "All dev server terminals have been opened." -ForegroundColor Cyan

