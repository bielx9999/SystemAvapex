@echo off
echo ========================================
echo  SISTEMA DE LOGISTICA - SETUP
echo ========================================
echo.

echo [1/4] Instalando dependencias do backend...
cd backend
call npm install
if %errorlevel% neq 0 (
    echo Erro ao instalar dependencias do backend
    pause
    exit /b 1
)

echo.
echo [2/4] Instalando dependencias do frontend...
cd ..\sistema-logistica
call npm install
if %errorlevel% neq 0 (
    echo Erro ao instalar dependencias do frontend
    pause
    exit /b 1
)

echo.
echo [3/4] Verificando arquivo .env do backend...
cd ..\backend
if not exist .env (
    echo Copiando .env.example para .env...
    copy .env.example .env
    echo IMPORTANTE: Configure o arquivo .env com suas credenciais do banco!
)

echo.
echo [4/4] Setup concluido!
echo.
echo Para iniciar o sistema:
echo 1. Backend: cd backend && npm run dev
echo 2. Frontend: cd sistema-logistica && npm start
echo.
echo Acesse: http://localhost:3000
echo API: http://localhost:5000
echo.
pause