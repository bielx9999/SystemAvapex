@echo off
echo ========================================
echo REINICIANDO SISTEMA DE LOGISTICA
echo ========================================

echo.
echo [1/4] Parando processos existentes...
taskkill /f /im node.exe >nul 2>&1
timeout /t 2 >nul

echo [2/4] Iniciando Backend...
cd backend
start "Backend" cmd /k "npm run dev"
timeout /t 5

echo [3/4] Iniciando Frontend...
cd ..\sistema-logistica
start "Frontend" cmd /k "npm start"

echo [4/4] Aguardando inicialização...
timeout /t 10

echo.
echo ========================================
echo SISTEMA INICIADO COM SUCESSO!
echo ========================================
echo Backend: http://192.168.2.81:3002
echo Frontend: http://192.168.2.81:3000
echo Health Check: http://192.168.2.81:3002/health
echo ========================================

pause