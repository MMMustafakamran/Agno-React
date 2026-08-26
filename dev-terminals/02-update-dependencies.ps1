# [Step 2] Update Dependencies (Backend & Frontend)
$host.UI.RawUI.WindowTitle = "[Step 2] Update Dependencies (Backend & Frontend)"
$RootDir = Split-Path -Parent $PSScriptRoot

Write-Host "================================================================" -ForegroundColor Cyan
Write-Host " [Step 2] Updating Dependencies" -ForegroundColor Cyan
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "1) Backend:      uv sync --prerelease=allow (in backend/)"
Write-Host "2) Frontend:     npm install (in frontend/ - peer dependencies safe)"
Write-Host "3) Autorecorder: npm install (in autorecorder/)"
Write-Host ""

# 1. Backend (Python / uv)
Write-Host "----------------------------------------------------------------" -ForegroundColor Yellow
Write-Host "[Backend] Syncing Python dependencies in backend/..." -ForegroundColor Yellow
Write-Host "----------------------------------------------------------------" -ForegroundColor Yellow
Set-Location "$RootDir\backend"
if (Test-Path "pyproject.toml") {
    uv sync --prerelease=allow
    if ($LASTEXITCODE -ne 0) {
        Write-Host "[WARNING] Backend uv sync returned code $LASTEXITCODE." -ForegroundColor Yellow
    } else {
        Write-Host "[Backend] Dependencies synced successfully." -ForegroundColor Green
    }
} else {
    Write-Host "[ERROR] backend\pyproject.toml not found." -ForegroundColor Red
}
Write-Host ""

# 2. Frontend (Node / npm)
Write-Host "----------------------------------------------------------------" -ForegroundColor Yellow
Write-Host "[Frontend] Installing frontend packages in frontend/..." -ForegroundColor Yellow
Write-Host "----------------------------------------------------------------" -ForegroundColor Yellow
Set-Location "$RootDir\frontend"
if (Test-Path "package.json") {
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "[WARNING] Frontend npm install returned code $LASTEXITCODE." -ForegroundColor Yellow
    } else {
        Write-Host "[Frontend] Packages installed successfully." -ForegroundColor Green
    }
} else {
    Write-Host "[ERROR] frontend\package.json not found." -ForegroundColor Red
}
Write-Host ""

# 3. Autorecorder (Node / npm)
Write-Host "----------------------------------------------------------------" -ForegroundColor Yellow
Write-Host "[Autorecorder] Installing autorecorder packages in autorecorder/..." -ForegroundColor Yellow
Write-Host "----------------------------------------------------------------" -ForegroundColor Yellow
Set-Location "$RootDir\autorecorder"
if (Test-Path "package.json") {
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "[WARNING] Autorecorder npm install returned code $LASTEXITCODE." -ForegroundColor Yellow
    } else {
        Write-Host "[Autorecorder] Packages installed successfully." -ForegroundColor Green
    }
} else {
    Write-Host "[ERROR] autorecorder\package.json not found." -ForegroundColor Red
}
Write-Host ""

Write-Host "================================================================" -ForegroundColor Cyan
Write-Host " [Step 2 Complete] Dependency update finished!" -ForegroundColor Cyan
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host ""
Read-Host "Press ENTER to continue"

