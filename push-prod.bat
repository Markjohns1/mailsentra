@echo off
set "ROOT=c:\Users\User\Desktop\mailsentra"
echo ================================================
echo MailSentra - Hard Cleanup and Production Push
echo ================================================
echo.

echo [*] Cleaning root clutters...
powershell -Command "Remove-Item -Path '%ROOT%\clean_docs.py', '%ROOT%\THE_MAILSENTRA_SYSTEM.md' -ErrorAction SilentlyContinue"

echo [*] Cleaning Backend Models (Keeping only v2.9)...
powershell -Command "Get-ChildItem -Path '%ROOT%\backend\ml_models\spam_model_v*' | Where-Object { $_.Name -notlike '*v2.9*' } | Remove-Item -Force"

echo [*] Cleaning Dataset shrapnel...
powershell -Command "Remove-Item -Path '%ROOT%\backend\dataset\temp_extract', '%ROOT%\backend\dataset\extracted' -Recurse -Force -ErrorAction SilentlyContinue"

echo.
echo [*] Committing and Pushing to Git...
cd /d "%ROOT%"
git add .
git commit -m "Production: Cleaned repository, Model v2.9, and UI polish"
git push

echo.
echo ================================================
echo DONE! Check your folder - clean_docs and old models are GONE.
echo ================================================
pause
