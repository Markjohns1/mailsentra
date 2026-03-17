@echo off
echo ================================================
echo MailSentra - Project Cleanup and Push
echo ================================================
echo.

echo [*] Cleaning redundant files...
if exist "ml_models" (
    echo [!] Removing redundant root ml_models folder...
    rmdir /s /q "ml_models"
)

if exist "backend\dataset\temp_extract" (
    echo [!] Cleaning temp extraction data...
    rmdir /s /q "backend\dataset\temp_extract"
)

if exist "backend\dataset\extracted" (
    echo [!] Cleaning extracted archives...
    rmdir /s /q "backend\dataset\extracted"
)

if exist "THE_MAILSENTRA_SYSTEM.md" (
    echo [!] Removing redundant old documentation...
    del /f /q "THE_MAILSENTRA_SYSTEM.md"
)

echo.
echo [*] Staging changes for Git...
git add .

echo [*] Committing...
git commit -m "Production: System-wide UI polish, Model v2.9 accuracy tuning, and threshold improvements"

echo [*] Pushing to remote...
git push

echo.
echo ================================================
echo Done! Project is clean and pushed.
echo ================================================
pause
