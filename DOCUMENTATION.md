# Deere Inspect Pro — Documentação Completa

Este documento descreve a estrutura do projeto, o propósito de cada pasta e arquivo importante, instruções de execução, endpoints da API, e notas de desenvolvimento. É feito para ser copiado/colado diretamente em um editor como Word.

---

## Visão geral do projeto

- Nome: Deere Inspect Pro
- Objetivo: Aplicação PWA de inspeção técnica para equipamentos (criação/edição de inspeções, administração e geração de PDFs). 
- Stack: Frontend React + TypeScript + Vite + TailwindCSS (shadcn/ui style), Backend FastAPI (Python) + SQLAlchemy, PostgreSQL. Deploy local com Docker Compose e NGINX.

---

## Como executar (rápido)

1. Build e subir containers (recomendada):

```bash
docker compose -f deployment/docker-compose.yml up -d --build
```

2. Logs:

```bash
docker compose -f deployment/docker-compose.yml logs -f web
docker compose -f deployment/docker-compose.yml logs -f backend
```

3. Frontend: http://localhost:8080
4. Backend API: http://localhost:8000

Para desenvolvimento frontend (modo dev):

```bash
npm install
npm run dev
```

Para build manual (produção local):

```bash
npx vite build --config config/vite.config.ts
```

Para rodar somente o backend (desenvolvimento):

```bash
cd backend
python -m pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

---

## Dependências e requisitos de sistema

Antes de rodar o projeto, certifique-se de ter as dependências corretas instaladas.

### Requisitos globais

- **Node.js** (v16+) — necessário para compilar o frontend. Instale de https://nodejs.org ou via package manager:
  ```bash
  # macOS (Homebrew)
  brew install node

  # Ubuntu/Debian
  sudo apt-get install nodejs npm
  ```

- **npm** ou **bun** — gerenciador de pacotes JavaScript. Vem com Node.js. Se preferir Bun (mais rápido):
  ```bash
  curl -fsSL https://bun.sh/install | bash
  ```

- **Python 3.9+** — necessário para rodar o backend localmente. Instale de https://www.python.org ou via package manager:
  ```bash
  # macOS (Homebrew)
  brew install python3

  # Ubuntu/Debian
  sudo apt-get install python3 python3-pip
  ```

- **Docker & Docker Compose** — recomendado para rodar os containers. Instale de https://docs.docker.com/get-docker ou via package manager:
  ```bash
  # macOS (Homebrew)
  brew install docker

  # Ubuntu/Debian
  sudo apt-get install docker.io docker-compose
  ```

### Dependências do Frontend

Instaladas via `npm install`, incluem:

- **React 18** — framework de UI.
- **TypeScript** — tipagem estática para JavaScript.
- **Vite** — bundler e dev server.
- **TailwindCSS** — framework de CSS utilitário.
- **Radix UI** — componentes acessíveis sem estilo.
- **shadcn/ui** — componentes de UI pré-estilizados baseados em Radix.
- **React Router v6** — roteamento de página.
- **TanStack Query v5** — gerenciamento de estado e cache de dados.
- **next-themes** — alternador de tema (dark/light).
- **sonner** — notificações toast.
- **jspdf** e **jspdf-autotable** — geração de PDFs.
- **lucide-react** — ícones SVG.
- **vite-plugin-pwa** — suporte a PWA.

Instale com:

```bash
npm install
```

Ou se usar Bun:

```bash
bun install
```

### Dependências do Backend

Instaladas via `pip install -r requirements.txt`, incluem:

- **FastAPI** — framework web assíncrono.
- **Uvicorn** — servidor ASGI para FastAPI.
- **SQLAlchemy** — ORM e construção de queries SQL.
- **psycopg2** — driver PostgreSQL para Python.
- **pydantic** e **pydantic-settings** — validação de dados e variáveis de ambiente.
- **python-cors** — middleware CORS para APIs.

Instale com:

```bash
cd backend
pip install -r requirements.txt
```

### Verificação de instalação

Verifique se tudo está instalado:

```bash
node --version      # v16+
npm --version       # npm 8+
python3 --version   # 3.9+
docker --version    # Docker 20+
docker-compose --version  # docker-compose 1.29+
```

---

## Estrutura do repositório (nível superior)

- `deployment/` — arquivos Docker e NGINX usados para empacotar e servir o frontend e orquestrar serviços com `docker-compose`.
  - `docker-compose.yml` — define serviços `web`, `backend`, `db`.
  - `Dockerfile` — multi-stage build do frontend (node build -> nginx).
  - `nginx.conf` — configuração do servidor nginx para SPA.
  - `data/postgres/` — volume local para persistência do Postgres.

- `backend/` — aplicação FastAPI e dependências Python.
  - `Dockerfile` — instrui como construir a imagem backend.
  - `requirements.txt` — dependências Python.
  - `app/` — código do backend (descrição abaixo).

- `config/` — arquivos de configuração para desenvolvimento (Vite, TypeScript, Vitest, ESLint).

- `src/` — código-fonte do frontend (React + TypeScript + Tailwind). (descrito em detalhe mais abaixo)

- `public/` — recursos estáticos (manifest, ícones PWA, robots.txt, etc.).

- `dist/` — saída do build (gerada por Vite/`npm run build`).

- `package.json` e `package-lock.json` — dependências e scripts do frontend.

- `postcss.config.js`, `tailwind.config.ts`, `vite.config.ts` — configurações de build e CSS.

---

## Detalhamento por pasta e arquivo

### `backend/`

Descrição: aplicação backend que fornece uma API REST simples para gerenciar inspeções e usuários.

- `backend/Dockerfile` — constrói a imagem do backend; instala dependências e expõe a aplicação.
- `backend/requirements.txt` — dependências do Python (FastAPI, SQLAlchemy, psycopg2, pydantic-settings, uvicorn etc.).

Pasta `backend/app`:
- `__init__.py` — torna o diretório um package Python.
- `config.py` — `Settings` via `pydantic-settings` com variáveis: `database_url`, `app_name`, `api_prefix`.
- `database.py` — configura SQLAlchemy: `engine`, `SessionLocal`, `Base`; função `init_db()` que cria as tabelas.
- `models.py` — modelos SQLAlchemy:
  - `Inspection` — tabela `inspections` com campos: `id`, `created_by`, `created_at`, `updated_at`, `status`, `header` (JSONB), `analysis_request` (JSONB), `operating_conditions` (JSONB), `diagnostico` (JSONB), `checklist_data` (JSONB), `kanban` (JSONB), `fotos` (JSONB), `assinatura_tecnico`.
  - `User` — tabela `users` com `uid`, `email`, `role`, `ativo`, `criado_em`.
  - `Counter` — tabela `counters` para valores sequenciais (ex.: `rastreabilidade`).
- `schemas.py` — Pydantic models para validação e serialização das APIs: `InspectionCreate`, `InspectionUpdate`, `InspectionResponse`, `UserCreate`, `UserUpdate`, `UserResponse`, `NextRastreabilidadeResponse`.
- `crud.py` — funções de CRUD que interagem com o DB: `get_inspection`, `get_inspections`, `create_inspection`, `update_inspection`, `delete_inspection`, `get_next_rastreabilidade`, `get_users`, `create_user`, `update_user`.
- `main.py` — aplicação FastAPI: define rotas, middleware CORS, rotas de CRUD e `on_startup` que chama `init_db()`.

API endpoints expostos (resumo):
- `GET /health` — checa saúde do serviço.
- `GET /api/inspections` — lista inspeções.
- `GET /api/inspections/{id}` — busca inspeção.
- `POST /api/inspections` — cria inspeção.
- `PUT /api/inspections/{id}` — atualiza inspeção.
- `DELETE /api/inspections/{id}` — deleta inspeção.
- `GET /api/next-rastreabilidade` — retorna contador sequencial.
- `GET/POST/PUT /api/users` — operações com usuários.

### `deployment/`

- `docker-compose.yml` — define os serviços e vínculos: `web` (nginx serve `dist`), `backend` (FastAPI), `db` (Postgres). Contém variáveis de ambiente para `VITE_API_URL` e `DATABASE_URL`.
- `Dockerfile` — (já descrito) constrói frontend e serve via nginx.
- `nginx.conf` — serve SPA e adiciona cache headers para recursos estáticos.

### `config/`

- `vite.config.ts` — configuração Vite usada pelo projeto (dev server host/port, PWA plugin, alias `@` para `src`, dedupe).
- `tsconfig.app.json` — TypeScript config principal para o app (inclui `baseUrl` para `../src`). Observação: adicionada a opção `ignoreDeprecations` para suprimir aviso de `baseUrl` em TS 6.
- `tsconfig.node.json` — config para arquivos node (ex.: `vite.config.ts`).
- `vitest.config.ts` — configuração para testes com Vitest.
- `eslint.config.js` — regras ESLint (TypeScript + React hooks).

### `public/`

- Arquivos estáticos do PWA: `manifest.json`, `pwa-192x192.png`, `pwa-512x512.png`, `robots.txt`.

### `src/` (frontend)

Visão geral: app React com padrões shadcn/ui e tokens Tailwind CSS definidos em `src/index.css`. Estrutura modular com `pages`, `components`, `lib`, `store`, `types`.

- `src/main.tsx` — ponto de entrada: importa `index.css`, monta aplicação React, registra/limpa service workers em hosts de preview para evitar interferência.
- `src/App.tsx` — compõe providers (`QueryClientProvider`, `ThemeProvider`, `TooltipProvider`), rotas React (`BrowserRouter`), e inclui `NetworkStatusBar` e `SplashScreen`.
- `src/index.css` — tokens CSS (HSL variáveis), temas (`:root` e `.dark`), utilitários customizados (ex.: `.industrial-header`, `.touch-target`) e regra para ocultar overlays da Lovable preview. Essencial para aparência do projeto.
- `src/App.css` — estilos adicionais (no projeto atual contém um comentário; a maioria do estilo está em `index.css` e Tailwind).

Páginas:
- `src/pages/Index.tsx` — landing / dashboard principal. Contém header (branding), botão `Nova Inspeção` com grid de equipamentos, lista de inspeções recentes (com item arrastável para excluir), e prompt de instalação PWA.
- `src/pages/InspectionPage.tsx` — página de criação/edição de inspeção com seções: header, checklist, fotos, assinatura, kanban, diagnóstico.
- `src/pages/Admin.tsx` — painel administrativo para visualizar todas as inspeções/usuários.
- `src/pages/NotFound.tsx` — página 404.

Componentes principais (`src/components`):
- `ThemeToggle.tsx` — alternador de tema (dark/light) usando `next-themes`.
- `NetworkStatusBar.tsx` — exibe offline/online topo-bar.
- `SplashScreen.tsx` — splash inicial.
- `AdminGate.tsx` — wrapper que protege rotas administrativas.
- `NavLink.tsx` — componente de navegação estilizado.

Seções da inspeção (`src/components/inspection/*`) — componentes que representam cada seção do formulário de inspeção, por exemplo:
- `InspectionHeader.tsx` — cabeçalho da inspeção (cliente, equipamento, número de série).
- `ChecklistSectionView.tsx` — exibição/edição do checklist.
- `PhotosSection.tsx` — upload e preview de fotos; integra com armazenamento local e sincronização.

Biblioteca UI (`src/components/ui/*`) — wrappers reutilizáveis (botões, cartões, inputs, dialogs, toasts, tabelas) que implementam estilo consistente via tokens Tailwind. Muitos desses componentes são adaptações/encapsulamentos de Radix UI + Tailwind.

Utilitários e armazenamento:
- `src/lib/inspectionsApi.ts` — camada HTTP para chamadas ao backend. Usa `VITE_API_URL` e exporta funções como `syncInspectionToCloud`, `fetchAllInspectionsGlobal`, `getNextRastreabilidade`.
- `src/lib/generatePdf.ts` — gera PDFs usando `jspdf` e `jspdf-autotable`.
- `src/lib/utils.ts` — funções utilitárias (formatters, helpers).
- `src/store/inspectionStore.ts` — armazenamento local (localStorage) com funções `createNewInspection`, `saveInspection`, `getAllInspections`, `deleteInspection`. Usado para funcionamento offline-first.
- `src/types/inspection.ts` — tipos TypeScript que descrevem a shape de uma `Inspection` e enums como `EquipmentType`.

### `src/test/`

- `example.test.ts` e `setup.ts` — configuração básica de testes com Vitest e jsdom.

---

## Arquivos de configuração importantes (explicados)

- `package.json` — scripts principais:
  - `dev`: `vite --config config/vite.config.ts`
  - `build`: `vite build --config config/vite.config.ts`
  - `preview`: `vite preview --config config/vite.config.ts`
  - `test`: `vitest -c config/vitest.config.ts run`

- `vite.config.ts` (restaurado) — contém aliases e plugin `VitePWA`. Importante: a imagem Docker que serve o frontend executa `npm run build` e depende desta configuração para gerar o CSS correto e o `manifest.webmanifest`.

- `tailwind.config.ts` — define tokens (cores, radios, keyframes, animações) que o `src/index.css` consome via `var(--...)`. Sem este arquivo e `postcss.config.js`, o Tailwind não gera os utils estendidos do projeto.

- `postcss.config.js` — configura plugin `tailwindcss` e `autoprefixer`.

- `tsconfig.json` e `config/tsconfig.*` — configuração de build TypeScript. `config/tsconfig.app.json` é usado para o app e contém `baseUrl` apontando para `../src` para que import alias `@` funcione.

---

## Notas sobre problemas já resolvidos

- Problema de estilo: alguns arquivos de configuração (ex.: `tailwind.config.ts`, `postcss.config.js`, `vite.config.ts`) foram removidos ou estavam em locais diferentes, o que resultou em CSS gerado sem os tokens personalizados. Restaurei esses arquivos e reconstruí a imagem `web` para restaurar o estilo.
- `config/tsconfig.app.json` emitia aviso de depreciação do `baseUrl`; adicionei `"ignoreDeprecations": "6.0"` para suprimir o aviso e manter compatibilidade de desenvolvimento.

---

## Checklist recomendado para manutenção / PRs

1. Sempre rode `npm run build` local antes de atualizar a imagem Docker `web` para garantir que `dist/` contenha os assets corretos.
2. Ao alterar tokens de tema (cores, variáveis), atualize `tailwind.config.ts` e `src/index.css` em conjunto.
3. Ao modificar endpoints do backend, incremente a versão da API ou documente breaking changes no README.
4. Adicione testes Vitest para componentes críticos e configure CI para rodar `npm run test` e checar `docker compose build`.

---

## Variáveis de ambiente e arquivos não versionados

O projeto usa um `.env` local para segredos e configuração de banco de dados; esse arquivo NÃO deve ser comitado.

- O repositório contém `.env.example` como modelo de referência.
- O arquivo real `.env` está listado em `.gitignore` para não ser enviado ao Git.
- O banco de dados local do Postgres também é persistido em `deployment/data/postgres` e não deve ser versionado.

### Sobre `.env.example`

O arquivo `.env.example` é um template público que mostra quais variáveis são necessárias para o projeto funcionar. Ele não deve conter dados secretos reais. Use-o apenas como base para criar seu `.env` local.

### Como criar o `.env`

Copie o arquivo de exemplo e preencha seus valores locais:

```bash
cp .env.example .env
```

Em seguida, edite `.env` para conter os valores corretos do seu ambiente.

### O que cada variável significa

- `POSTGRES_DB` — nome do banco de dados PostgreSQL usado pelo backend.
- `POSTGRES_USER` — usuário do banco de dados. No container Postgres padrão, geralmente é `postgres`.
- `POSTGRES_PASSWORD` — senha do usuário do banco. Deve ser uma senha forte e única.
- `DATABASE_URL` — URL de conexão do SQLAlchemy/PSYCOPG2 ao Postgres. O formato usado aqui é:
  `postgresql+psycopg2://<POSTGRES_USER>:<POSTGRES_PASSWORD>@db:5432/<POSTGRES_DB>`
  Onde `db` é o nome do serviço Postgres do `docker-compose`.
- `VITE_API_URL` — URL base do backend que o frontend usa para fazer chamadas API.
  - No ambiente local de containers, o padrão é `http://localhost:8000`.
- `API_PREFIX` — prefixo de rota da API no backend. No projeto atual, é `/api`.
- `APP_NAME` — nome do aplicativo usado pelo backend e, se necessário, em logs/metadata.
- `SECRET_KEY` — chave secreta do aplicativo usada para criptografia/segurança.
  - Mesmo que o backend atual não use autenticação avançada, a chave é útil para futuras dependências ou lógica de sessão.

### Exemplo de `.env`

```env
POSTGRES_DB=deere_inspect
POSTGRES_USER=postgres
POSTGRES_PASSWORD=uma_senha_forte_aqui
DATABASE_URL=postgresql+psycopg2://postgres:uma_senha_forte_aqui@db:5432/deere_inspect
VITE_API_URL=http://localhost:8000
API_PREFIX=/api
APP_NAME=Deere Inspect API
SECRET_KEY=uma_chave_secreta_aqui
```

### Como gerar valores seguros

Use comandos como estes para gerar segredos fortes:

```bash
openssl rand -base64 24  # senha do Postgres
openssl rand -base64 32  # secret key do app
```

### Reiniciando os containers após criar o `.env`

```bash
docker compose -f deployment/docker-compose.yml down
docker compose -f deployment/docker-compose.yml up -d --build
```