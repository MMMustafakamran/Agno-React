# [Master Orchestrator] Step-by-Step Terminal Pipeline (PowerShell)
$host.UI.RawUI.WindowTitle = "[Master Orchestrator] Step-by-Step Terminal Pipeline"
$Dir = $PSScriptRoot
$RootDir = Split-Path -Parent $Dir

function Show-Menu {
    Clear-Host
    Write-Host "================================================================" -ForegroundColor Cyan
    Write-Host "   🚀 COPILOTKIT + AGNO STEP-BY-STEP TERMINAL ORCHESTRATOR" -ForegroundColor Cyan
    Write-Host "================================================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "  This launcher opens separate, dedicated terminal windows for"
    Write-Host "  each step so you can clearly see live output and inputs."
    Write-Host ""
    Write-Host "  STEPS:"
    Write-Host "   [1]  Check Doc Drift            (doc-snapshot/ comparison)"
    Write-Host "   [1B] Sync Doc Snapshot (.md)    (Fetch & overwrite changed .md files)"
    Write-Host "   [2]  Update Dependencies        (backend uv sync + frontend safe install)"
    Write-Host "   [3]  Run Agno Backend Agent     (FastAPI agent on :8000)"
    Write-Host "   [4]  Run Frontend Next.js       (Next.js app on :3000)"
    Write-Host "   [5]  Run Autorecorder           (Playwright video automation)"
    Write-Host ""
    Write-Host "  MODES:"
    Write-Host "   [A]  Guided Step-by-Step (Opens terminals one by one with pauses)"
    Write-Host "   [S]  Start Servers Only  (Opens Backend & Frontend terminals)"
    Write-Host "   [Q]  Quit"
    Write-Host ""
    Write-Host "================================================================" -ForegroundColor Cyan
}

while ($true) {
    Show-Menu
    $opt = Read-Host "Choose an option [A, S, 1-5, 1B, Q] (default=A)"
    if ([string]::IsNullOrWhiteSpace($opt)) { $opt = "A" }

    if ($opt -ieq "Q") {
        Write-Host "Exiting orchestrator."
        break
    }

    if ($opt -ieq "1") {
        Write-Host "Opening Step 1 in a new terminal..." -ForegroundColor Yellow
        Start-Process powershell -ArgumentList "-NoExit", "-ExecutionPolicy", "Bypass", "-File", "$Dir\01-check-doc-drift.ps1"
    }
    elseif ($opt -ieq "1B") {
        Write-Host "Opening Step 1B in a new terminal..." -ForegroundColor Yellow
        Start-Process powershell -ArgumentList "-NoExit", "-ExecutionPolicy", "Bypass", "-File", "$Dir\01b-sync-doc-snapshot.ps1"
    }
    elseif ($opt -ieq "2") {
        Write-Host "Opening Step 2 in a new terminal..." -ForegroundColor Yellow
        Start-Process powershell -ArgumentList "-NoExit", "-ExecutionPolicy", "Bypass", "-File", "$Dir\02-update-dependencies.ps1"
    }
    elseif ($opt -ieq "3") {
        Write-Host "Opening Step 3 in a new terminal..." -ForegroundColor Yellow
        Start-Process powershell -ArgumentList "-NoExit", "-ExecutionPolicy", "Bypass", "-File", "$Dir\03-run-backend.ps1"
    }
    elseif ($opt -ieq "4") {
        Write-Host "Opening Step 4 in a new terminal..." -ForegroundColor Yellow
        Start-Process powershell -ArgumentList "-NoExit", "-ExecutionPolicy", "Bypass", "-File", "$Dir\04-run-frontend.ps1"
    }
    elseif ($opt -ieq "5") {
        Write-Host "Opening Step 5 in a new terminal..." -ForegroundColor Yellow
        Start-Process powershell -ArgumentList "-NoExit", "-ExecutionPolicy", "Bypass", "-File", "$Dir\05-run-autorecorder.ps1"
    }
    elseif ($opt -ieq "S") {
        Write-Host ""
        Write-Host "================================================================" -ForegroundColor Cyan
        Write-Host "  Launching Dev Servers in separate terminals..." -ForegroundColor Cyan
        Write-Host "================================================================" -ForegroundColor Cyan
        Write-Host "Opening Backend server terminal (:8000)..." -ForegroundColor Yellow
        Start-Process powershell -ArgumentList "-NoExit", "-ExecutionPolicy", "Bypass", "-File", "$Dir\03-run-backend.ps1"
        Start-Sleep -Seconds 2
        Write-Host "Opening Frontend server terminal (:3000)..." -ForegroundColor Yellow
        Start-Process powershell -ArgumentList "-NoExit", "-ExecutionPolicy", "Bypass", "-File", "$Dir\04-run-frontend.ps1"
        Write-Host ""
        Write-Host "Both server terminals have been launched!" -ForegroundColor Green
    }
    elseif ($opt -ieq "A") {
        Clear-Host
        Write-Host "================================================================" -ForegroundColor Cyan
        Write-Host "   [MODE A] GUIDED STEP-BY-STEP TERMINAL LAUNCHER" -ForegroundColor Cyan
        Write-Host "================================================================" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "Step 1 of 5: Doc Drift Check & Sync"
        Write-Host "This will open a new terminal to check live documentation against doc-snapshot/"
        Write-Host "and let you sync/update local .md files."
        Write-Host ""
        $c1 = Read-Host "Press ENTER to launch Step 1 terminal (or type 's' to skip)"
        if ($c1 -ine "s") {
            Start-Process powershell -ArgumentList "-NoExit", "-ExecutionPolicy", "Bypass", "-File", "$Dir\01-check-doc-drift.ps1"
        }

        Write-Host ""
        Write-Host "----------------------------------------------------------------" -ForegroundColor Yellow
        Write-Host "Step 2 of 5: Update Dependencies"
        Write-Host "This will open a new terminal to sync backend Python and install frontend packages."
        Write-Host ""
        $c2 = Read-Host "Press ENTER to launch Step 2 terminal (or type 's' to skip)"
        if ($c2 -ine "s") {
            Start-Process powershell -ArgumentList "-NoExit", "-ExecutionPolicy", "Bypass", "-File", "$Dir\02-update-dependencies.ps1"
        }

        Write-Host ""
        Write-Host "----------------------------------------------------------------" -ForegroundColor Yellow
        Write-Host "Step 3 of 5: Run Agno Backend Agent Server (:8000)"
        Write-Host "This will open a new terminal running the FastAPI Python server."
        Write-Host ""
        $c3 = Read-Host "Press ENTER to launch Step 3 (Backend) terminal (or type 's' to skip)"
        if ($c3 -ine "s") {
            Start-Process powershell -ArgumentList "-NoExit", "-ExecutionPolicy", "Bypass", "-File", "$Dir\03-run-backend.ps1"
        }

        Write-Host ""
        Write-Host "----------------------------------------------------------------" -ForegroundColor Yellow
        Write-Host "Step 4 of 5: Run Frontend Next.js Server (:3000)"
        Write-Host "This will open a new terminal running Next.js."
        Write-Host ""
        $c4 = Read-Host "Press ENTER to launch Step 4 (Frontend) terminal (or type 's' to skip)"
        if ($c4 -ine "s") {
            Start-Process powershell -ArgumentList "-NoExit", "-ExecutionPolicy", "Bypass", "-File", "$Dir\04-run-frontend.ps1"
        }

        Write-Host ""
        Write-Host "----------------------------------------------------------------" -ForegroundColor Yellow
        Write-Host "Step 5 of 5: Run Autorecorder"
        Write-Host "Ensure Backend (:8000) and Frontend (:3000) have finished starting up"
        Write-Host "before launching the recorder."
        Write-Host ""
        $c5 = Read-Host "Press ENTER to launch Step 5 (Autorecorder) terminal (or type 's' to skip)"
        if ($c5 -ine "s") {
            Start-Process powershell -ArgumentList "-NoExit", "-ExecutionPolicy", "Bypass", "-File", "$Dir\05-run-autorecorder.ps1"
        }

        Write-Host ""
        Write-Host "================================================================" -ForegroundColor Cyan
        Write-Host "  All selected terminal steps have been launched!" -ForegroundColor Green
        Write-Host "================================================================" -ForegroundColor Cyan
    }

    Write-Host ""
    Write-Host "----------------------------------------------------------------"
    $m = Read-Host "Return to menu? (y/n, default=y)"
    if ([string]::IsNullOrWhiteSpace($m) -or $m -ieq "y") {
        continue
    } else {
        break
    }
}

