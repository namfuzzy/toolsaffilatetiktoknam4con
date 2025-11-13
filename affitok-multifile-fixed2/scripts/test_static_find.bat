@echo off
set FILE=prompt-studio.html
if not exist %FILE% ( echo Note: %FILE% not found in current folder. & exit /b 0 )
findstr /C:"assets/js/core/env.js" %FILE%
findstr /C:"assets/js/services/gemini.js" %FILE%
findstr /C:"assets/js/pages/prompt-studio.js" %FILE%
