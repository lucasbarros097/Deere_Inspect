@echo off
echo ========================================
echo BUILD FRONTEND - DEERE INSPECT
echo ========================================
echo.

cd ..\frontend
call npm run build

if %errorlevel% neq 0 (
    echo ERRO: Falha no build do frontend
    pause
    exit /b 1
)

echo.
echo ========================================
echo FRONTEND BUILDADO COM SUCESSO!
echo ========================================
echo.
echo Arquivos gerados em: ..\frontend\dist\
echo.
echo Para testar o build:
echo cd ..\frontend && npm run preview
echo.
pause