@echo off
setlocal enabledelayedexpansion

REM Chạy patch bằng PowerShell
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0patch-affitok.ps1" "."
echo.
echo Done. Xem "==== PATCH REPORT ====" ở trên để biết file nào đã được cập nhật.
echo.
pause
