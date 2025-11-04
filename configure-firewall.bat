@echo off
echo ========================================
echo CONFIGURANDO FIREWALL PARA SISTEMA
echo ========================================

echo Adicionando regra para porta 3002 (Backend)...
netsh advfirewall firewall add rule name="Sistema Logistica Backend" dir=in action=allow protocol=TCP localport=3002

echo Adicionando regra para porta 3000 (Frontend)...
netsh advfirewall firewall add rule name="Sistema Logistica Frontend" dir=in action=allow protocol=TCP localport=3000

echo.
echo ========================================
echo FIREWALL CONFIGURADO COM SUCESSO!
echo ========================================

pause