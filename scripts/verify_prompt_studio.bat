@echo off
setlocal enabledelayedexpansion
set ERR=0
for %%F in ("assets\js\services\gemini.js" "assets\js\pages\prompt-studio.js" "assets\js\core\env.js" "assets\mock\affiliate-knowledge.json") do (
  if exist %%F (echo OK  %%F) else (echo MISSING %%F & set ERR=1)
)
findstr /C:"GOOGLE_API_KEY" assets\js\core\env.js >nul || (echo Missing GOOGLE_API_KEY & set ERR=1)
findstr /C:"GEMINI_MODEL"  assets\js\core\env.js >nul || (echo Missing GEMINI_MODEL  & set ERR=1)
findstr /C:"generateContent" assets\js\services\gemini.js >nul || (echo Service may be wrong & set ERR=1)
findstr /C:"initPromptStudio" assets\js\pages\prompt-studio.js >nul || (echo Page glue missing & set ERR=1)
if %ERR%==0 ( echo [PASS] All files present. ) else ( echo [FAIL] Some checks failed. )
exit /b %ERR%
