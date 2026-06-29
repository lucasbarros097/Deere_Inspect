@echo off
echo ========================================
echo BUILD BACKEND - DEERE INSPECT
echo ========================================
echo.

cd ..\backend

if not exist .venv (
    echo Criando ambiente virtual...
    python -m venv .venv
)

echo Ativando ambiente virtual...
call .venv\Scripts\activate

echo Instalando PyInstaller...
pip install pyinstaller

if %errorlevel% neq 0 (
    echo ERRO: Falha ao instalar PyInstaller
    pause
    exit /b 1
)

echo.
echo Criando executavel do Backend...
pyinstaller --onefile app/main.py --name deere_inspect_api --distpath ..\dist

if %errorlevel% neq 0 (
    echo ERRO: Falha ao criar executavel do backend
    pause
    exit /b 1
)

echo.
echo ========================================
echo BACKEND BUILDADO COM SUCESSO!
echo ========================================
echo.
echo Executavel gerado: ..\dist\deere_inspect_api.exe
echo.
echo Para rodar o backend buildado:
echo ..\dist\deere_inspect_api.exe
echo.
pause