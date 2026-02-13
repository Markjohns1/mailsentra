@echo off
REM Start both FastAPI and React
REM Tries Windows Terminal first, falls back to separate windows

cls
echo.
echo ================================================
echo FastAPI + React Full Stack Server Startup
echo ================================================
echo.

REM Check if Windows Terminal is available
where wt >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo [*] Windows Terminal found - using tabs mode
    call :start_with_wt
) else (
    echo [*] Windows Terminal not found - using separate windows
    call :start_with_separate_windows
)

exit /b

REM ============================================
REM Windows Terminal Tab Mode
REM ============================================
:start_with_wt
echo [1/2] Launching FastAPI in Windows Terminal tab...
timeout /t 1 /nobreak

wt -w 0 -p "PowerShell" -d "%CD%\backend" "python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000; pause"

echo [2/2] Adding React tab to Windows Terminal...
timeout /t 1 /nobreak

wt -w 0 new-tab -p "PowerShell" -d "%CD%\frontend" "npm run dev; pause"

echo.
echo ================================================
echo Both servers are running in Windows Terminal!
echo.
echo Tab 1: FastAPI Backend (port 8000)
echo Tab 2: React Frontend (port 5173)
echo.
echo URLs:
echo - Backend:  http://localhost:8000
echo - Frontend: http://localhost:5173
echo - API Docs: http://localhost:8000/docs
echo ================================================
echo.

timeout /t 2 /nobreak
exit /b

REM ============================================
REM Separate Windows Mode (Fallback)
REM ============================================
:start_with_separate_windows
echo [1/2] Starting FastAPI Backend on port 8000...
timeout /t 1 /nobreak

start "FastAPI Backend" cmd /k "cd backend && python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000"

echo [2/2] Starting React Frontend (Vite) on port 5173...
timeout /t 2 /nobreak

start "React Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo ================================================
echo Both servers are running in separate windows!
echo.
echo Window 1: FastAPI Backend (port 8000)
echo Window 2: React Frontend (Vite) (port 5173)
echo.
echo URLs:
echo - Backend:  http://localhost:8000
echo - Frontend: http://localhost:5173
echo - API Docs: http://localhost:8000/docs
echo ================================================
echo.

timeout /t 2 /nobreak
exit /b