# Finanças Pediatria - Script PowerShell de Restauração v2.5.0
# Criado por: FChNeto

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
$rootDir = Split-Path -Parent $scriptDir
$snapshotDir = Join-Path $rootDir "recovery\snapshot_v2.5.0"

Write-Host "======================================================================" -ForegroundColor Magenta
Write-Host "      🌸 Finanças Pediatria - Restauração para a Versão v2.5.0" -ForegroundColor Cyan
Write-Host "      Criado por: FChNeto" -ForegroundColor DarkGray
Write-Host "======================================================================" -ForegroundColor Magenta

if (-not (Test-Path $snapshotDir)) {
    Write-Host "❌ Erro: Snapshot v2.5.0 não encontrado em $snapshotDir" -ForegroundColor Red
    exit 1
}

Write-Host "
[1/3] Restaurando arquivos do snapshot..." -ForegroundColor Yellow
Copy-Item -Path "$snapshotDir\*" -Destination $rootDir -Recurse -Force

Write-Host "[2/3] Reconstruindo bundle unificado..." -ForegroundColor Yellow
& node (Join-Path $rootDir "scripts\build_bundle.js")

Write-Host "[3/3] Validando com suíte de 59 testes..." -ForegroundColor Yellow
& node --test (Get-ChildItem (Join-Path $rootDir "tests\*.test.js") | Select-Object -ExpandProperty FullName)

Write-Host "
✅ Concluído com sucesso! Versão v2.5.0 restaurada e validada." -ForegroundColor Green
