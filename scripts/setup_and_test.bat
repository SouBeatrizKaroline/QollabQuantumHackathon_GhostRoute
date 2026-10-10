@echo off
setlocal EnableExtensions
chcp 65001 >nul
title Ghost Route - instalar e testar
cd /d "%~dp0.."
if errorlevel 1 exit /b 1

echo Ghost Route - instalacao e teste
echo.

REM Procura Python 3.10 ou mais recente sem alterar outros ambientes.
set "GHOST_ROUTE_PY="
where py >nul 2>nul
if not errorlevel 1 (
    py -3 --version >nul 2>nul
    if not errorlevel 1 set "GHOST_ROUTE_PY=py -3"
)
if not defined GHOST_ROUTE_PY (
    where python >nul 2>nul
    if not errorlevel 1 set "GHOST_ROUTE_PY=python"
)
if not defined GHOST_ROUTE_PY (
    echo [ERRO] Instale o Python em https://www.python.org/downloads/
    exit /b 1
)
%GHOST_ROUTE_PY% -c "import sys; sys.exit(0 if sys.version_info >= (3, 10) else 1)"
if errorlevel 1 (
    echo [ERRO] E necessario Python 3.10 ou mais recente.
    exit /b 1
)

if not exist ".venv\Scripts\python.exe" (
    echo Criando o ambiente local .venv...
    %GHOST_ROUTE_PY% -m venv ".venv"
    if errorlevel 1 goto :failed
)
set "GHOST_ROUTE_ENV_PY=%CD%\.venv\Scripts\python.exe"

echo Instalando dependencias...
"%GHOST_ROUTE_ENV_PY%" -m pip install --upgrade pip
if errorlevel 1 goto :failed
"%GHOST_ROUTE_ENV_PY%" -m pip install -r requirements.txt
if errorlevel 1 goto :failed

echo Executando o sensor Qiskit local...
"%GHOST_ROUTE_ENV_PY%" sensor.py
if errorlevel 1 goto :failed

echo Executando os testes Python...
"%GHOST_ROUTE_ENV_PY%" -m pytest tests -q
if errorlevel 1 goto :failed

where node >nul 2>nul
if errorlevel 1 (
    echo [AVISO] Node.js nao encontrado. Os testes do navegador foram ignorados.
    echo Instale Node.js e execute os arquivos .cjs em tests para valida-los.
) else (
    echo Executando os testes do jogo web...
    for %%T in (game-core.cjs estimator.cjs localization.cjs ui-state.cjs campaign.cjs ship-rendering.cjs map-layout.cjs) do (
        node "tests\%%T"
        if errorlevel 1 goto :failed
    )
)

echo Gerando o grafico das franjas...
"%GHOST_ROUTE_ENV_PY%" scripts\plot_fringes.py
if errorlevel 1 goto :failed
echo Grafico: docs\assets\ramsey-fringes.png
echo Validacao concluida. Consulte os resultados de cada teste acima.
if /I "%~1"=="--no-pause" exit /b 0
pause
exit /b 0

:failed
echo.
echo [ERRO] A etapa anterior falhou. A validacao foi interrompida.
exit /b 1
