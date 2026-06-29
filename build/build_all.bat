@echo off
echo ========================================
echo BUILD COMPLETO - DEERE INSPECT
echo ========================================
echo.

echo [1/4] Build do Frontend...
cd ..\frontend
call npm run build
if %errorlevel% neq 0 (
    echo ERRO: Falha no build do frontend
    pause
    exit /b 1
)
echo Frontend buildado com sucesso!
echo.

echo [2/4] Verificando ambiente virtual do Backend...
cd ..\backend
if not exist .venv (
    echo Criando ambiente virtual...
    python -m venv .venv
)
echo.

echo [3/4] Instalando PyInstaller (se necessário)...
call .venv\Scripts\activate
pip install pyinstaller
if %errorlevel% neq 0 (
    echo ERRO: Falha ao instalar PyInstaller
    pause
    exit /b 1
)
echo.

echo [4/4] Criando executavel do Backend...
pyinstaller --onefile app/main.py --name deere_inspect_api --distpath ..\dist
if %errorlevel% neq 0 (
    echo ERRO: Falha ao criar executavel do backend
    pause
    exit /b 1
)
echo.

echo ========================================
echo BUILD CONCLUIDO COM SUCESSO!
echo ========================================
echo.
echo Arquivos gerados:
echo - Frontend: ..\frontend\dist\
echo - Backend: ..\dist\deere_inspect_api.exe
echo.
echo Para rodar o projeto buildado:
echo 1. Execute: ..\dist\deere_inspect_api.exe
echo 2. Acesse: cd ..\frontend && npm run preview
echo.
pause