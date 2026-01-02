@echo off
cd /d "%~dp0"

REM --- Safety check
if not exist ".git" (
  echo ERROR: Not a git repository
  pause
  exit /b
)

REM --- Show current status
echo ===== BEFORE ADD =====
git status
pause

REM --- Add everything
git add .

REM --- Show staged changes
echo ===== AFTER ADD =====
git status
pause

REM --- Commit if something is staged
git diff --cached --quiet
if errorlevel 1 (
  git commit -m "Auto sync: update project files"
  git push origin main
) else (
  echo No changes to commit.
)

pause