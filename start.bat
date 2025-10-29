@echo off
echo ========================================
echo  SISTEMA DE LOGISTICA - INICIAR
echo ========================================
echo.

echo Iniciando backend...
start "Backend" cmd /k "cd backend && npm run dev"

timeout /t 3 /nobreak > nul

echo Iniciando frontend...
start "Frontend" cmd /k "cd sistema-logistica && npm start"

echo.
echo Sistema iniciado!
echo Backend: http://localhost:5000
echo Frontend: http://localhost:3000
echo.
echo Pressione qualquer tecla para fechar...
pause > nul