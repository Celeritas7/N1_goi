@echo off
cd /d "%~dp0"

if not exist ".git" (
  echo ERROR: Not a git repository
  pause
  exit /b
)

REM --- Stage ALL changes including deletions
git add -A

REM --- Commit only if something changed
git diff --cached --quiet
if errorlevel 1 (
  git commit -m "Auto sync: update files (add/modify/delete)"
  git push origin main
) else (
  echo No changes to commit.
)

pause