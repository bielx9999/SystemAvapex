@echo off
echo ========================================
echo  TESTE DO SISTEMA - PASSO A PASSO
echo ========================================
echo.

echo [1] Testando conexao com banco...
cd backend
node -e "require('dotenv').config(); require('./config/database').authenticate().then(() => console.log('✅ Banco OK')).catch(e => console.log('❌ Erro:', e.message))"

echo.
echo [2] Testando imports...
node test-imports.js

echo.
echo [3] Iniciando servidor...
echo Pressione Ctrl+C para parar o servidor
node server.js