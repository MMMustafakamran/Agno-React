# Root PowerShell shortcut to dev-terminals orchestrator
$RootDir = $PSScriptRoot
Set-Location $RootDir
& "$RootDir\dev-terminals\run-all-step-by-step.ps1" $args

