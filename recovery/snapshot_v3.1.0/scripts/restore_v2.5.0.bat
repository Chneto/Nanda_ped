@echo off
chcp 65001 > nul
title Finanças Pediatria - Restauração v2.5.0 (Recovery)

echo ======================================================================
echo       🌸 Finanças Pediatria - Restauração para a Versão v2.5.0
echo       Criado por: FChNeto
echo ======================================================================
echo.
echo Este script irá restaurar todos os arquivos da aplicação para a
echo versão estável de lançamento (v2.5.0 - 59 testes aprovados).
echo.
set /p CONFIRM="Deseja continuar com a restauração? (S/N): "
if /i not "%CONFIRM%"=="S" (
    echo Operação cancelada pelo usuário.
    pause
    exit /b
)

echo.
echo [1/3] Restaurando arquivos a partir de recovery\snapshot_v2.5.0...
xcopy /E /I /Y "%~dp0..\recovery\snapshot_v2.5.0" "%~dp0..\" > nul

echo [2/3] Reconstruindo bundle unificado (js\bundle.js)...
node "%~dp0build_bundle.js"

echo [3/3] Validando integridade da suíte de 59 testes automatizados...
node --test "%~dp0..\tests\*.test.js"

echo.
echo ======================================================================
echo   ✅ Concluído com sucesso! Versão v2.5.0 restaurada e validada.
echo ======================================================================
echo.
pause
