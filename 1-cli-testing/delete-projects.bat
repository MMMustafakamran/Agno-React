@echo off
setlocal enabledelayedexpansion

set "ROOT_DIR=%~dp0"

echo ===================================================
echo  Deleting all generated projects in test folders...
echo ===================================================
echo.

set "FOLDERS=bun npm pnpm yarn"

for %%F in (%FOLDERS%) do (
    set "TARGET_DIR=%ROOT_DIR%%%F"
    if exist "!TARGET_DIR!" (
        echo Cleaning folder: %%F...
        
        :: Delete all subdirectories inside folder
        for /d %%D in ("!TARGET_DIR!\*") do (
            echo   Deleting directory: %%D
            rd /s /q "%%D" 2>nul
        )
        
        :: Delete all files inside folder except README.md
        for %%I in ("!TARGET_DIR!\*") do (
            if /i not "%%~nxI"=="README.md" (
                echo   Deleting file: %%I
                del /f /q "%%I" 2>nul
            )
        )
        echo   [OK] Cleaned %%F
    )
)

echo.
echo All generated project files have been deleted.
pause

