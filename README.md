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
├── data/                      # Volume PostgreSQL (Docker)
├── docker-compose.yml         # Orquestração Docker
├── Dockerfile                 # Docker Nginx frontend
├── nginx.conf                 # Config Nginx
├── .env.example               # Exemplo de variáveis de ambiente
└── README.md
```

---

## 🚀 Como subir o sistema do zero

### Pré-requisitos

- **Docker** e **Docker Compose** instalados
- **Node.js 18+** (para desenvolvimento local)
- **Python 3.12+** (para desenvolvimento local)

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

# Frontend
VITE_API_URL=http://localhost:8000
```

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

### 4. Configuração inicial

Na primeira execução (banco de dados vazio), o sistema cria automaticamente o usuário administrador definido no `.env` (`ADMIN_USERNAME` / `ADMIN_PASSWORD`).

1. Acesse **http://localhost:8080**
2. Faça login com o administrador criado automaticamente
3. Acesse **Ferramentas > Admin** para cadastrar técnicos

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

## 📄 Licença

Uso exclusivo para técnicos autorizados. Projeto interno do Grupo Ellos.