@echo off
setlocal
echo Starting CopilotKit Agno Daily Automation...
cd /d "%~dp0"
node ci/automate.mjs %*
pause
