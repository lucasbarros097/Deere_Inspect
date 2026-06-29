# 🚜 Deere Inspect

**Sistema completo para registro, gerenciamento e compartilhamento de inspeções técnicas (TA) de equipamentos de construção. Desenvolvido com React + Vite + Tailwind CSS (frontend) e Python FastAPI (backend).**

---

## 📋 Funcionalidades

- **Análise Técnica (TA):** Inspeção detalhada de equipamentos com checklist dinâmico por tipo de máquina
- **Checklist por equipamento:** Cada tipo de equipamento possui seções e itens específicos
- **Assinatura digital:** Finalização da inspeção com assinatura do técnico
- **Kanban:** Avaliação visual dos sistemas do equipamento
- **Reciclagem:** Reaproveite dados de inspeções anteriores
- **Histórico de edições:** Rastreabilidade completa de todas as alterações
- **Notificações:** Sistema de notificações para compartilhamentos e reciclagens
- **Relatórios PDF:** Geração automática de relatórios profissionais
- **Fotos:** Captura e anexo de até 30 fotos por inspeção
- **PWA:** Instalável como aplicativo no celular (offline-first)
- **Tema escuro/claro:** Alternância entre temas
- **Controle de acesso:** Perfis Administrador e Técnico

---

## 🏗️ Estrutura do Projeto

```
deere-inspect-pro/
├── backend/                    # API Python FastAPI
│   ├── app/
│   │   ├── main.py            # Rotas e lógica da API
│   │   ├── auth.py            # Autenticação JWT
│   │   ├── config.py          # Configurações
│   │   ├── crud.py            # Operações no banco
│   │   ├── database.py        # Conexão com banco
│   │   ├── models.py          # Modelos SQLAlchemy
│   │   └── schemas.py         # Schemas Pydantic
│   ├── Dockerfile
│   └── requirements.txt
│
├── frontend/                   # App React + Vite
│   ├── src/
│   │   ├── components/        # Componentes reutilizáveis
│   │   │   ├── inspection/    # Componentes da inspeção
│   │   │   └── ui/            # Componentes shadcn/ui
│   │   ├── pages/             # Páginas da aplicação
│   │   ├── store/             # Contextos (Auth, Inspeções)
│   │   ├── hooks/             # Hooks customizados
│   │   ├── lib/               # Utilitários (PDF, API)
│   │   ├── types/             # Tipos TypeScript
│   │   └── data/              # Dados de checklist
│   ├── public/                # Assets estáticos
│   ├── index.html
│   ├── vite.config.ts
│   ├── tailwind.config.ts
│   └── package.json
│
├── build/                      # Scripts de build e execução Windows
│   ├── start_backend.bat       # Iniciar backend
│   ├── start_frontend.bat      # Iniciar frontend
│   ├── build_frontend.bat     # Build frontend
│   ├── build_backend.bat      # Build backend
│   ├── build_all.bat          # Build completo
│   └── create_portable.bat    # Criar pacote portátil
│
├── data/                      # Volume PostgreSQL (Docker)
├── docker-compose.yml         # Orquestração Docker
├── Dockerfile                 # Docker Nginx frontend
├── nginx.conf                 # Config Nginx
├── .env.example               # Exemplo de variáveis de ambiente
└── README.md
```

---

## 🚀 Como subir o sistema do zero

### ⚠️ Importante: Segurança e Dados Sensíveis

Antes de fazer o deploy em produção ou ambientes de teste:

1. **NUNCA commitar o arquivo `.env`** - Ele contém credenciais sensíveis
2. **O arquivo `.env.example` deve ser usado como template** para criar o `.env` em cada ambiente
3. **Dados que nunca devem ser commitados:**
   - Banco de dados (pasta `data/`)
   - Arquivos `.env` reais
   - Logs (`*.log`)
   - Backups de banco (`*.sql`, `*.dump`)
   - Arquivos de banco local (`*.db`, `*.sqlite`)

### 🛡️ Configuração para Ambientes Novos

Ao subir em um servidor ou máquina de teste nova, o sistema funcionará da seguinte forma:

1. **Primeiro acesso (banco zerado):**
   - O sistema detecta que não há usuários no banco
   - Redireciona automaticamente para a tela de configuração inicial (`/setup`)
   - Você cria o primeiro usuário administrador
   - Após criar, é redirecionado para a tela de login

2. **Acessos subsequentes:**
   - Se já existirem usuários no banco, a tela de setup não aparece
   - Faça login com as credenciais existentes
   - O admin pode criar outros usuários técnicos via painel admin

### Setup de Segurança para Produção

Para ambientes de produção, altere estas variáveis no `.env`:

```env
# Use uma senha forte para o banco de dados
POSTGRES_PASSWORD=sua_senha_muito_forte_aqui

# Gere um SECRET_KEY aleatório e longo
SECRET_KEY=use_uma_string_longa_aleatoria_gerada_por_um_password_manager

# Use credenciais fortes para o admin
ADMIN_USERNAME=seu_usuario_admin
ADMIN_PASSWORD=sua_senha_muito_forte_aqui
```

### Pré-requisitos

- **Docker** e **Docker Compose** instalados (para produção)
- **Node.js 18+** (para desenvolvimento local)
- **Python 3.12+** (para desenvolvimento local)
- Scripts Windows na pasta `build/` (para usuários Windows)

### 1. Clone o repositório

```bash
git clone https://github.com/lucasbarros097/deere_inspect_pro.git
cd deere-inspect-pro
```

### 2. Configure as variáveis de ambiente

```bash
cp .env.example .env
```

Edite o arquivo `.env` conforme necessário:

```env
# Banco de Dados
POSTGRES_DB=deere_inspect
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres

# Backend
DATABASE_URL=postgresql+psycopg2://postgres:postgres@db:5432/deere_inspect
SECRET_KEY=seu-segredo-aqui-mude-em-producao
API_PREFIX=/api
APP_NAME=Deere Inspect API
ACCESS_TOKEN_EXPIRE_MINUTES=10080

# Usuário Admin (criado automaticamente na primeira execução)
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123

# Frontend
VITE_API_URL=http://localhost:8000
```

**IMPORTANTE:** Em produção, altere as senhas e o SECRET_KEY para valores seguros.

### 3. Suba com Docker (produção/recomendado)

```bash
docker-compose up -d --build
```

Isso irá:
- Buildar a imagem do frontend (Nginx servindo arquivos estáticos)
- Buildar a imagem do backend (FastAPI + Uvicorn)
- Subir o banco PostgreSQL
- Aplicar migrações automaticamente

Acesse: **http://localhost:8080**

### 4. Configuração Inicial Automática

Na primeira execução (banco de dados vazio), o sistema irá:

1. **Detectar banco vazio** e redirecionar para a tela de configuração inicial
2. **Exibir tela de setup** (`/setup`) para criar o primeiro administrador
3. **Criar usuário admin** com as credenciais definidas no `.env` (`ADMIN_USERNAME` / `ADMIN_PASSWORD`)
4. **Redirecionar para login** após criação bem-sucedida

**Observação:** O sistema também permite criar o admin manualmente através da tela de setup, ignorando as credenciais do `.env`.

> **Nota:** O administrador é criado apenas na primeira execução. Se você usar `docker-compose down` (sem `-v`), os dados são preservados e o admin não será recriado. Use `docker-compose down -v` apenas se quiser resetar completamente o banco de dados.

### 5. Desenvolvimento local

#### Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

#### Frontend

```bash
cd frontend
npm install
npm run dev
```

O frontend estará em **http://localhost:8080** e o backend em **http://localhost:8000**.

#### Windows

Para usuários Windows, o projeto inclui scripts automatizados na pasta `build/` para facilitar todas as operações:

| Script | Descrição |
|--------|-----------|
| `build/start_backend.bat` | Inicia o backend em modo desenvolvimento |
| `build/start_frontend.bat` | Inicia o frontend em modo desenvolvimento |
| `build/start_frontend_preview.bat` | Inicia o frontend buildado (preview) |
| `build/build_frontend.bat` | Faz o build de produção do frontend |
| `build/build_backend.bat` | Cria executável do backend |
| `build/build_all.bat` | Faz build completo (frontend + backend) |
| `build/create_portable.bat` | Cria pacote portátil para distribuição |

##### Como Rodar no Windows

**Iniciar Backend:**
```cmd
cd build
start_backend.bat
```

**Iniciar Frontend:**
```cmd
cd build
start_frontend.bat
```

**Build Completo:**
```cmd
cd build
build_all.bat
```

**Criar Pacote Portátil:**
```cmd
cd build
create_portable.bat
```

##### Configuração Windows

Para desenvolvimento local no Windows sem Docker, você pode configurar o `.env` para usar SQLite (mais simples que PostgreSQL):

```
DATABASE_URL=sqlite:///./deere_inspect.db
```

Para produção ou ambiente Docker, mantenha a configuração PostgreSQL padrão no `.env`.

##### Build e Distribuição

**Build do Frontend:**
```cmd
cd build
build_frontend.bat
```

**Build do Backend (executável):**
```cmd
cd build
build_backend.bat
```

**Build Completo:**
```cmd
cd build
build_all.bat
```

**Distribuição:**
```cmd
cd build
create_portable.bat
```

Isso cria uma pasta `Deere_Inspect_Portable/` com tudo pronto para distribuição, incluindo:
- Executável do backend
- Frontend buildado
- Arquivo de configuração
- Instruções para usuário final
- Script de início automático

##### Solução de Problemas Windows

- **Permissões:** Execute o terminal como Administrador se tiver problemas
- **Venv:** Se o ambiente virtual não funcionar, recrie com `python -m venv .venv` na pasta backend
- **Portas:** Altere as portas se 8000 ou 8080 estiverem em uso
- **Dependências:** Limpe `node_modules` e reinstale se tiver problemas no frontend

---

## 🔧 Manutenção e Migração

### Backup do banco de dados

```bash
docker exec -t deere-inspect-pro-db-1 pg_dump -U postgres deere_inspect > backup_$(date +%Y%m%d).sql
```

### Restore do banco

```bash
cat backup.sql | docker exec -i deere-inspect-pro-db-1 psql -U postgres deere_inspect
```

### Migração para novo servidor

1. Faça backup do banco (passo acima)
2. Copie a pasta `data/` se houver dados locais
3. No novo servidor, clone o repositório
4. Configure `.env` com as mesmas credenciais
5. Execute `docker-compose up -d --build`
6. Restaure o banco

### Atualização do sistema

```bash
git pull origin main
docker-compose down
docker-compose up -d --build
```

---

## 📸 Limitações de Imagens

O sistema possui as seguintes limitações para upload de imagens no registro fotográfico:

| Item | Limite |
|------|--------|
| **Quantidade máxima** | 10 fotos por inspeção |
| **Tamanho máximo por imagem** | 10 MB |
| **Dimensão máxima** | 1920px (redimensionamento automático) |
| **Qualidade de compressão** | 80% (JPEG) |
| **Formatos aceitos** | JPEG, PNG, WebP, HEIC |

As imagens são automaticamente redimensionadas e comprimidas para otimizar o armazenamento e garantir performance. A imagem original é preservada para download.

---

## 👥 Perfis de Acesso

| Perfil | Acesso |
|--------|--------|
| **Administrador** | Acesso total: criar/gerenciar usuários, ver todas as inspeções de todos os técnicos, painel admin |
| **Técnico** | Criar e gerenciar próprias inspeções, reciclar |

- Administradores **não** são forçados a trocar senha no primeiro login
- Técnicos são forçados a trocar senha no primeiro login (segurança)

---

## 🧪 Testes

```bash
cd frontend
npm test
```

---

## 🛠️ Stack Tecnológica

### Frontend
- **React 18** + TypeScript
- **Vite 5** (bundler)
- **Tailwind CSS 3** + shadcn/ui
- **React Router DOM 6**
- **TanStack React Query 5**
- **Lucide React** (ícones)
- **jsPDF** (geração de relatórios)
- **PWA** (instalável offline)

### Backend
- **Python 3.12** + FastAPI
- **SQLAlchemy** (ORM)
- **PostgreSQL** (banco de dados)
- **JWT** (autenticação)
- **Uvicorn** (servidor ASGI)

### Infraestrutura
- **Docker** + Docker Compose
- **Nginx** (servidor web)
- **PWA** (Service Worker + Workbox)

---

## 🚀 Guia de Deploy e Segurança

### ⚠️ Checklist de Segurança para Deploy

#### Antes de fazer deploy em produção ou ambientes de teste:

1. **NUNCA commitar o arquivo `.env`**
   - O `.env` contém credenciais sensíveis
   - Use `.env.example` como template
   - Cada ambiente deve ter seu próprio `.env`

2. **Dados que NUNCA devem ser commitados:**
   - ✅ `.env` (já está no .gitignore)
   - ✅ `data/` (banco de dados local)
   - ✅ `*.log` (arquivos de log)
   - ✅ `*.sql`, `*.dump` (backups de banco)
   - ✅ `*.db`, `*.sqlite` (arquivos de banco local)
   - ✅ `build/` (artefatos de build)

3. **Configurações obrigatórias para produção:**
   - Alterar `POSTGRES_PASSWORD` para senha forte
   - Alterar `SECRET_KEY` para string longa e aleatória
   - Alterar `ADMIN_USERNAME` e `ADMIN_PASSWORD` para credenciais fortes
   - Alterar `VITE_API_URL` para o domínio correto do servidor

### 🛡️ Configuração de Ambiente

#### 1. Ambiente de Desenvolvimento

Use as configurações padrão do `.env.example`:
```env
POSTGRES_PASSWORD=postgres
SECRET_KEY=chave_de_desenvolvimento_nao_usar_em_producao
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
```

#### 2. Ambiente de Teste

Use credenciais diferentes de desenvolvimento:
```env
POSTGRES_PASSWORD=test_senha_forte_aqui
SECRET_KEY=gerar_uma_chave_aleatoria_longa_aqui
ADMIN_USERNAME=test_admin
ADMIN_PASSWORD=test_senha_muito_forte_aqui
```

#### 3. Ambiente de Produção

Use credenciais fortes e únicas:
```env
POSTGRES_PASSWORD=<senha_gerada_por_password_manager>
SECRET_KEY=<string_aleatoria_64_caracteres_ou_mais>
ADMIN_USERNAME=<usuario_admin_real>
ADMIN_PASSWORD=<senha_gerada_por_password_manager>
```

### 🌐 Primeiro Acesso em Ambiente Novo

#### Fluxo Automático de Configuração

Ao subir o sistema em um servidor ou máquina nova:

1. **Início:** Sistema detecta banco vazio
2. **Redirecionamento:** Usuário é redirecionado para `/setup`
3. **Tela de Setup:** Interface para criar primeiro admin
4. **Criação de Admin:** Sistema cria usuário administrador
5. **Login:** Usuário é redirecionado para tela de login
6. **Funcionamento Normal:** Sistema opera normalmente

#### Opções de Criação do Admin

**Opção 1: Criação Automática (via .env)**
- Defina `ADMIN_USERNAME` e `ADMIN_PASSWORD` no `.env`
- Sistema cria automaticamente no primeiro startup
- Recomendado para automação de deploy

**Opção 2: Criação Manual (via Interface)**
- Acesse a tela `/setup` no primeiro acesso
- Insira as credenciais desejadas
- Sistema cria admin manualmente
- Recomendado para setups manuais

### 🔄 Procedimento de Deploy

#### Deploy em Servidor Novo

1. **Clone o repositório:**
   ```bash
   git clone <seu-repositorio>
   cd deere_inspect
   ```

2. **Crie o arquivo .env:**
   ```bash
   cp .env.example .env
   # Edite .env com as credenciais apropriadas
   ```

3. **Suba os containers:**
   ```bash
   docker-compose up -d --build
   ```

4. **Acesse o sistema:**
   - Abra `http://seu-servidor:8080`
   - Será redirecionado para `/setup` automaticamente
   - Crie o primeiro administrador
   - Faça login e configure os usuários técnicos

#### Atualização de Sistema Existente

1. **Atualize o código:**
   ```bash
   git pull origin main
   ```

2. **Rebuild os containers:**
   ```bash
   docker-compose down
   docker-compose up -d --build
   ```

3. **Verifique funcionamento:**
   - Acesse o sistema
   - Verifique se as funcionalidades estão operacionais

### 🗄️ Backup e Restore

#### Backup do Banco de Dados

```bash
docker exec -t deere_inspect-db-1 pg_dump -U postgres deere_inspect > backup_$(date +%Y%m%d).sql
```

#### Restore do Banco de Dados

```bash
cat backup.sql | docker exec -i deere_inspect-db-1 psql -U postgres deere_inspect
```

### 🔒 Reset Completo do Sistema

Para resetar completamente o sistema (incluindo banco de dados):

```bash
docker-compose down -v
# Remove a pasta data/ local se existir
rm -rf data/
# Suba novamente
docker-compose up -d --build
```

**⚠️ ATENÇÃO:** Isso apagará todos os dados permanentemente!

### 📊 Monitoramento e Logs

#### Verificar status dos containers:
```bash
docker-compose ps
```

#### Verificar logs do backend:
```bash
docker-compose logs backend
```

#### Verificar logs do banco:
```bash
docker-compose logs db
```

#### Verificar logs do frontend:
```bash
docker-compose logs web
```

### 🚨 Solução de Problemas

#### Sistema não inicia: Banco não conecta

**Solução:** O backend agora tem retry automático (30 tentativas). Se ainda falhar:
1. Verifique se o container do banco está rodando: `docker-compose ps`
2. Verifique logs do banco: `docker-compose logs db`
3. Limpe dados antigos: `docker-compose down -v && rm -rf data/`

#### Tela de setup não aparece

**Causa:** O banco já possui usuários
**Solução:** 
1. Use `docker-compose down -v && rm -rf data/` para limpar o banco
2. Suba novamente: `docker-compose up -d --build`
3. A tela de setup aparecerá

#### Erro de conexão do frontend

**Causa:** `VITE_API_URL` incorreto no `.env`
**Solução:**
1. Verifique se `VITE_API_URL` está correto no `.env`
2. Rebuild o container web: `docker-compose up -d --build web`

### 📝 Checklist Final de Deploy

- [ ] `.env` criado com credenciais fortes
- [ ] `.env` NÃO está no git
- [ ] `data/` está no .gitignore
- [ ] Credenciais de produção diferentes de desenvolvimento
- [ ] `SECRET_KEY` foi alterado para valor aleatório
- [ ] Senhas do banco de dados foram alteradas
- [ ] Backup do banco de dados foi configurado
- [ ] Monitoramento foi configurado
- [ ] Primeiro acesso foi testado (tela de setup)
- [ ] Funcionalidades básicas foram testadas

---

## 📄 Licença

Uso exclusivo para técnicos autorizados. Projeto interno do Grupo Ellos.