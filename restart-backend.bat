@echo off
echo ========================================
echo REINICIANDO BACKEND
echo ========================================

echo [1/3] Parando processos Node.js...
taskkill /f /im node.exe >nul 2>&1
timeout /t 3 >nul

echo [2/3] Iniciando Backend...
cd backend
start "Backend" cmd /k "npm run dev"

echo [3/3] Aguardando inicialização...
timeout /t 5

echo.
echo ========================================
echo BACKEND REINICIADO!
echo ========================================
echo URL: http://192.168.2.81:3002
echo Health: http://192.168.2.81:3002/health
echo ========================================

pause