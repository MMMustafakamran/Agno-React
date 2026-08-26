# Script to delete all generated projects and files inside bun, npm, pnpm, and yarn directories
$rootDir = $PSScriptRoot
$targetDirs = @("bun", "npm", "pnpm", "yarn")

Write-Host "===================================================" -ForegroundColor Red
Write-Host " Cleaning generated projects in test directories   " -ForegroundColor Red
Write-Host "===================================================" -ForegroundColor Red

foreach ($dir in $targetDirs) {
    $dirPath = Join-Path $rootDir $dir
    if (Test-Path $dirPath) {
        Write-Host "Cleaning directory: $dir..." -ForegroundColor Yellow
        
        Get-ChildItem -Path $dirPath -Force | Where-Object { $_.Name -ne "README.md" } | ForEach-Object {
            try {
                Write-Host "  Removing: $($_.FullName)" -ForegroundColor DarkGray
                Remove-Item -Path $_.FullName -Recurse -Force -ErrorAction Stop
            } catch {
                Write-Warning "  Failed to remove $($_.FullName): $_"
            }
        }
        Write-Host "  [OK] Cleaned $dir" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "All generated projects and test files deleted." -ForegroundColor Green

