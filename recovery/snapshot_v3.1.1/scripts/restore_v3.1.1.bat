@echo off
chcp 65001 > nul
echo ========================================================
echo  Finanças Pediatria - Restauração Rápida v3.1.1
echo  Criado por: FChNeto
echo ========================================================
echo.
echo ATENÇÃO: Esta ação restaurará todos os arquivos a partir do snapshot oficial v3.1.1.
set /p confirm="Deseja continuar? (S/N): "
if /i not "%confirm%"=="S" (
    echo Operação cancelada pelo usuário.
    pause
    exit /b
)

echo.
node scripts\restore_v3.1.1.js
echo.
pause
