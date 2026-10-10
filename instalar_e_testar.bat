@echo off
chcp 65001 >nul
title Rota Fantasma - instalar e testar
cd /d "%~dp0"

echo ============================================
echo   ROTA FANTASMA - instalacao e teste
echo ============================================
echo.

REM 1. Procura o Python (py launcher primeiro, depois python)
set PY=
where py >nul 2>nul && set PY=py
if not defined PY (
    where python >nul 2>nul && set PY=python
)
if not defined PY (
    echo [ERRO] Python nao encontrado.
    echo Instale em https://www.python.org/downloads/
    echo e marque a opcao "Add python.exe to PATH" na instalacao.
    echo Depois rode este arquivo de novo.
    pause
    exit /b 1
)
echo Python encontrado:
%PY% --version
echo.

REM 2. Cria um ambiente separado so pro projeto (nao mexe no resto do PC)
if not exist ".venv" (
    echo [1/4] Criando ambiente do projeto...
    %PY% -m venv .venv
    if errorlevel 1 (
        echo [ERRO] Nao consegui criar o ambiente.
        pause
        exit /b 1
    )
) else (
    echo [1/4] Ambiente do projeto ja existe.
)
call .venv\Scripts\activate.bat

REM 3. Instala as bibliotecas
echo.
echo [2/4] Instalando Qiskit, NumPy, Matplotlib e Pytest (pode levar alguns minutos)...
python -m pip install --upgrade pip -q
python -m pip install -r requirements.txt -q
if errorlevel 1 (
    echo [ERRO] A instalacao falhou. Me manda print desta tela.
    pause
    exit /b 1
)

REM 4. Roda o sensor
echo.
echo [3/4] Rodando o sensor quantico...
echo --------------------------------------------
python sensor.py
echo --------------------------------------------

REM 5. Roda os testes
echo.
echo [4/4] Rodando os testes (o certo e aparecer "14 passed")...
echo --------------------------------------------
python -m pytest -q
echo --------------------------------------------

REM Bonus: gera o grafico
echo.
echo Gerando o grafico das franjas...
python grafico_franjas.py
if exist franjas.png start "" franjas.png

echo.
echo ============================================
echo   PRONTO! Pode fechar esta janela.
echo ============================================
pause
