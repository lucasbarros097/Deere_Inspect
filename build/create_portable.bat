@echo off
echo ========================================
echo CRIANDO PACOTE PORTATIL - DEERE INSPECT
echo ========================================
echo.

echo [1/5] Verificando se o build existe...
if not exist ..\dist\deere_inspect_api.exe (
    echo O executavel do backend nao existe. Executando build...
    call build_backend.bat
    if %errorlevel% neq 0 (
        echo ERRO: Falha no build do backend
        pause
        exit /b 1
    )
)

if not exist ..\frontend\dist\index.html (
    echo O build do frontend nao existe. Executando build...
    call build_frontend.bat
    if %errorlevel% neq 0 (
        echo ERRO: Falha no build do frontend
        pause
        exit /b 1
    )
)

echo [2/5] Criando estrutura de diretorios...
if exist ..\Deere_Inspect_Portable rmdir /s /q ..\Deere_Inspect_Portable
mkdir ..\Deere_Inspect_Portable
mkdir ..\Deere_Inspect_Portable\frontend

echo [3/5] Copiando arquivos...
copy ..\dist\deere_inspect_api.exe ..\Deere_Inspect_Portable\
xcopy ..\frontend\dist ..\Deere_Inspect_Portable\frontend\dist /E /I /Y
copy ..\.env ..\Deere_Inspect_Portable\

echo [4/5] Criando arquivo README para distribuicao...
echo # Deere Inspect - Versao Portatil > ..\Deere_Inspect_Portable\README.txt
echo. >> ..\Deere_Inspect_Portable\README.txt
echo ## Como Instalar e Rodar >> ..\Deere_Inspect_Portable\README.txt
echo. >> ..\Deere_Inspect_Portable\README.txt
echo 1. Edite o arquivo .env com suas configuracoes >> ..\Deere_Inspect_Portable\README.txt
echo 2. Execute deere_inspect_api.exe para iniciar o backend >> ..\Deere_Inspect_Portable\README.txt
echo 3. Para servir o frontend, escolha uma opcao: >> ..\Deere_Inspect_Portable\README.txt
echo    - Opcao A: Instale Node.js e execute: cd frontend\dist && npx serve . -p 8080 >> ..\Deere_Inspect_Portable\README.txt
echo    - Opcao B: Use Python (se instalado): cd frontend\dist && python -m http.server 8080 >> ..\Deere_Inspect_Portable\README.txt
echo    - Opcao C: Configure IIS ou nginx para servir a pasta frontend\dist >> ..\Deere_Inspect_Portable\README.txt
echo. >> ..\Deere_Inspect_Portable\README.txt
echo 4. Acesse http://localhost:8080 no navegador >> ..\Deere_Inspect_Portable\README.txt
echo. >> ..\Deere_Inspect_Portable\README.txt
echo ## Login Padrao >> ..\Deere_Inspect_Portable\README.txt
echo Usuario: admin >> ..\Deere_Inspect_Portable\README.txt
echo Senha: admin123 >> ..\Deere_Inspect_Portable\README.txt
echo. >> ..\Deere_Inspect_Portable\README.txt
echo ## Suporte >> ..\Deere_Inspect_Portable\README.txt
echo Para mais informacoes, consulte a documentacao original do projeto. >> ..\Deere_Inspect_Portable\README.txt

echo [5/5] Criando script de inicio...
echo @echo off > ..\Deere_Inspect_Portable\start.bat
echo echo Iniciando Backend... >> ..\Deere_Inspect_Portable\start.bat
echo start deere_inspect_api.exe >> ..\Deere_Inspect_Portable\start.bat
echo echo Backend iniciado! Pressione qualquer tecla para iniciar o servidor frontend... >> ..\Deere_Inspect_Portable\start.bat
echo pause >> ..\Deere_Inspect_Portable\start.bat
echo echo Iniciando servidor frontend na porta 8080... >> ..\Deere_Inspect_Portable\start.bat
echo cd frontend\dist >> ..\Deere_Inspect_Portable\start.bat
echo python -m http.server 8080 >> ..\Deere_Inspect_Portable\start.bat

echo.
echo ========================================
echo PACOTE PORTATIL CRIADO COM SUCESSO!
echo ========================================
echo.
echo Pacote criado em: ..\Deere_Inspect_Portable\
echo.
echo Conteudo do pacote:
echo - deere_inspect_api.exe (Backend)
echo - frontend\dist\ (Frontend buildado)
echo - .env (Configuracoes)
echo - README.txt (Instrucoes)
echo - start.bat (Script de inicio)
echo.
echo Para distribuir, compacte a pasta Deere_Inspect_Portable
echo.
pause