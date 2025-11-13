@echo off
setlocal enabledelayedexpansion

echo [TEST] Quet tat ca *.html trong thu muc hien tai...
set FAIL=0

for %%F in (*.html) do (
  set FILE=%%F
  set NAME=%%~nF
  set PAGE=!NAME!
  if /I "!PAGE!"=="index" set PAGE=dashboard

  findstr /r /c:"window.__PAGE_ID__ = '!PAGE!';" "%%F" >nul
  if errorlevel 1 (
     echo FAIL [PAGE_ID] %%F
     set FAIL=1
  ) else (
     echo OK   [PAGE_ID] %%F
  )

  for %%S in (
    "./assets/js/core/i18n.js"
    "./assets/js/core/theme.js"
    "./assets/js/core/nav.js"
    "./assets/js/core/mock-actions.js"
  ) do (
     findstr /c:"<script src=""%%~S""></script>" "%%F" >nul
     if errorlevel 1 (
        echo FAIL [SCRIPT] %%F missing %%~S
        set FAIL=1
     ) else (
        echo OK   [SCRIPT] %%F has %%~S
     )
  )
)

echo.
if %FAIL%==0 (
  echo ALL CHECKS PASSED.
) else (
  echo SOME CHECKS FAILED.
)
echo.
pause
