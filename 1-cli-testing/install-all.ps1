# Install all package managers in separate terminal windows
$rootDir = $PSScriptRoot

Write-Host "===================================================" -ForegroundColor Cyan
Write-Host " Installing dependencies in separate terminals... " -ForegroundColor Cyan
Write-Host "===================================================" -ForegroundColor Cyan

# npm
if (Test-Path "$rootDir\npm\app") {
    Write-Host "[npm]  Launching npm install in separate terminal..." -ForegroundColor Green
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$rootDir\npm\app'; Write-Host '=== Running npm install ===' -ForegroundColor Cyan; npm install"
}

# pnpm
if (Test-Path "$rootDir\pnpm\app") {
    Write-Host "[pnpm] Launching pnpm install in separate terminal..." -ForegroundColor Green
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$rootDir\pnpm\app'; Write-Host '=== Running pnpm install ===' -ForegroundColor Cyan; pnpm install"
}

# bun
if (Test-Path "$rootDir\bun\app") {
    Write-Host "[bun]  Launching bun install in separate terminal..." -ForegroundColor Green
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$rootDir\bun\app'; Write-Host '=== Running bun install ===' -ForegroundColor Cyan; bun install"
}

# yarn
if (Test-Path "$rootDir\yarn\app") {
    Write-Host "[yarn] Launching yarn install in separate terminal..." -ForegroundColor Green
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$rootDir\yarn\app'; Write-Host '=== Running yarn install ===' -ForegroundColor Cyan; yarn install"
}

Write-Host ""
Write-Host "All installer terminals have been opened." -ForegroundColor Cyan

