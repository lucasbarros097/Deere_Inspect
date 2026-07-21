# 🚜 Deere Inspect

**Sistema completo para registro, gerenciamento de inspeções técnicas (TA) de equipamentos de construção John Deere. Desenvolvido com React + Vite + Tailwind CSS (frontend) e Python FastAPI (backend).**

---

## 📋 Visão Geral

O Deere Inspect é uma aplicação web progressiva (PWA) offline-first que permite técnicos realizar inspeções detalhadas de equipamentos de construção da linha amarela John Deere. O sistema suporta múltiplos tipos de equipamentos com checklists específicos, geração de relatórios PDF, assinatura digital, e colaboração entre técnicos através de compartilhamento e reciclagem de inspeções.

### Funcionalidades Principais

- **Análise Técnica (TA):** Inspeção detalhada de equipamentos com checklist dinâmico por tipo de máquina
- **Checklist por equipamento:** Cada tipo de equipamento possui seções e itens específicos
- **Assinatura digital:** Finalização da inspeção com assinatura do técnico
- **Kanban:** Avaliação visual dos sistemas do equipamento (aprovado/ressalvas/reprovado)
- **Reciclagem:** Reaproveite dados de inspeções anteriores para novas inspeções
- **Histórico de edições:** Rastreabilidade completa de todas as alterações com motivos
- **Relatórios PDF:** Geração automática de relatórios profissionais com jsPDF
- **Fotos:** Captura e anexo de até 30 fotos por inspeção com compressão automática
- **PWA:** Instalável como aplicativo no celular (offline-first)
- **Tema escuro/claro:** Alternância entre temas com next-themes
- **Controle de acesso:** Perfis Administrador e Técnico com permissões diferenciadas

---

## 🏗️ Arquitetura do Sistema

### Estrutura de Diretórios

```
deere-inspect/
├── backend/                    # API Python FastAPI
│   ├── app/
│   │   ├── main.py            # Rotas e lógica da API
│   │   ├── auth.py            # Autenticação JWT e criptografia
│   │   ├── config.py          # Configurações (Pydantic Settings)
│   │   ├── crud.py            # Operações CRUD no banco de dados
│   │   ├── database.py        # Conexão e inicialização do banco
│   │   ├── models.py          # Modelos SQLAlchemy
│   │   └── schemas.py         # Schemas Pydantic para validação
│   ├── Dockerfile
│   └── requirements.txt
│
├── frontend/                   # App React + Vite
│   ├── src/
│   │   ├── components/        # Componentes reutilizáveis
│   │   │   ├── inspection/    # Componentes específicos de inspeção
│   │   │   └── ui/            # Componentes shadcn/ui
│   │   ├── pages/             # Páginas da aplicação
│   │   ├── store/             # Contextos (Auth, Inspeções)
│   │   ├── hooks/             # Hooks customizados
│   │   ├── lib/               # Utilitários (PDF, API)
│   │   ├── types/             # Tipos TypeScript
│   │   └── data/              # Dados de checklist (seções por equipamento)
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

### Arquitetura Técnica

**Backend (FastAPI):**
- API RESTful com documentação automática (Swagger/OpenAPI)
- Autenticação JWT com tokens de 7 dias
- ORM SQLAlchemy com suporte a PostgreSQL e SQLite
- Validação de dados com Pydantic
- Middleware CORS para comunicação com frontend
- Bloqueio de conta após 5 tentativas falhas de login
- Expiração de senha a cada 90 dias (técnicos)

**Frontend (React):**
- Single Page Application com React Router
- Gerenciamento de estado com Context API
- TanStack React Query para cache e sincronização de dados
- shadcn/ui + Radix UI para componentes acessíveis
- Tailwind CSS para estilização
- PWA com workbox para offline-first
- Armazenamento local (localStorage) para dados offline
- Sincronização automática quando online

**Banco de Dados:**
- PostgreSQL em produção (Docker)
- SQLite para desenvolvimento local
- Modelos relacionais com campos JSON para dados flexíveis

---

## 📊 Modelos de Dados

### Backend (SQLAlchemy Models)

**Inspection** - Representa uma inspeção técnica completa:
- `id`: String (UUID) - Identificador único
- `created_by`: String - Username do criador
- `created_at/updated_at`: DateTime - Timestamps
- `status`: String - "em-andamento" ou "finalizada"
- `header`: JSON - Dados do cabeçalho (cliente, equipamento, etc.)
- `analysis_request`: JSON - Solicitação de análise (falha, garantia, etc.)
- `operating_conditions`: JSON - Condições de operação
- `diagnostico`: JSON - Diagnóstico eletrônico
- `checklist_data`: JSON - Checklist organizado por seções
- `kanban`: JSON - Avaliação dos sistemas
- `fotos`: JSON - Array de fotos
- `assinatura_tecnico`: String - Assinatura digital (base64)
- `shared_with`: JSON - Array de usernames com acesso
- `recycled_from`: String - ID da inspeção original (se reciclada)
- `recycled_by`: String - Username de quem reciclou
- `recycled_at`: BigInteger - Timestamp da reciclagem

**InspectionEdit** - Histórico de edições:
- `id`: String (UUID)
- `inspection_id`: String - Referência para a inspeção
- `edited_by`: String - Username do editor
- `edited_at`: BigInteger - Timestamp Unix
- `field_changed`: String - Campo modificado
- `old_value/new_value`: Text - Valores em JSON
- `edit_reason`: String - Motivo da edição

**Notification** - Sistema de notificações:
- `id`: String (UUID)
- `user_id`: String - UID do destinatário
- `type`: String - Tipo (inspection_shared, inspection_recycled, etc.)
- `title/message`: String - Conteúdo
- `related_inspection_id`: String - Referência opcional
- `related_user`: String - Usuário relacionado
- `read`: Boolean - Status de leitura
- `created_at`: BigInteger - Timestamp Unix

**User** - Usuários do sistema:
- `uid`: String (UUID) - Identificador único
- `username`: String - Username único
- `role`: String - "admin" ou "user"
- `ativo`: Boolean - Status da conta
- `criado_em`: BigInteger - Timestamp de criação
- `password_hash`: String - Hash bcrypt
- `must_change_password`: Boolean - Forçar troca no primeiro login
- `password_changed_at`: BigInteger - Timestamp da última troca
- `failed_attempts`: Integer - Tentativas falhas
- `locked_until`: BigInteger - Timestamp de desbloqueio

**Counter** - Contadores sequenciais:
- `name`: String - Nome do contador (ex: "rastreabilidade")
- `last_value`: BigInteger - Último valor usado

### Frontend (TypeScript Types)

**InspectionHeader** - Dados iniciais da inspeção:
```typescript
{
  cliente: string;
  tipoEquipamento: EquipmentType;  // "pa-carregadeira" | "motoniveladora" | ...
  marcaModelo: string;
  ano: string;
  numeroOs: string;
  rastreabilidade: number;
  numeroSerie: string;
  horimetro: string;
  localInspecao: string;
  aplicacao: string;
  tecnicoResponsavel: string;
  data: string;
  orcamento: "sim" | "nao" | "";
}
```

**AnalysisRequest** - Motivos da análise:
```typescript
{
  falhaFuncional: boolean;
  quebraComponente: boolean;
  analiseGarantia: boolean;
  analisePreventiva: boolean;
  tradeIn: boolean;
  reforma: boolean;
  sinistro: boolean;
  outros: boolean;
  descricaoReclamacao: string;
}
```

**OperatingConditions** - Condições de operação:
```typescript
{
  tipoAplicacao: string[];
  materialManuseado: string;
  condicoesAmbientais: string;
  operadorTreinado: "sim" | "nao" | "";
  planoManutencao: "sim" | "nao" | "";
}
```

**DiagnosticoEletronico** - Diagnóstico:
```typescript
{
  ferramentasUtilizadas: string;
  manualPerformance: string;
  codigosAtivos: "sim" | "nao" | "";
  codigosPresentes: string;
}
```

**ChecklistItem** - Item do checklist:
```typescript
{
  id: string;
  grupo?: string;
  descricao: string;
  medida: string;
  medidaReferencia: string;
  tempo: string;
  observacao: string;
}
```

**KanbanItem** - Avaliação de sistema:
```typescript
{
  sistemaId: string;
  sistemaNome: string;
  avaliacao: "aprovado" | "ressalvas" | "reprovado" | "";
}
```

**InspectionPhoto** - Foto da inspeção:
```typescript
{
  id: string;
  url: string;  // base64
  observacao: string;
  titulo: string;
}
```

---

## 🔌 API Endpoints

### Autenticação

**POST /api/login**
- Descrição: Autentica usuário e retorna token JWT
- Request: `{ username: string, password: string }`
- Response: `{ access_token: string, token_type: string, must_change_password: boolean, username: string }`
- Features: Bloqueio após 5 tentativas, validação de senha forte

**GET /api/me**
- Descrição: Retorna informações do usuário autenticado
- Response: `{ uid: string, username: string, role: string, must_change_password: boolean }`
- Auth: Requer token JWT

**POST /api/change-password**
- Descrição: Altera senha do usuário
- Request: `{ current_password: string, new_password: string }`
- Auth: Requer token JWT
- Validação: Senha deve ter 8+ caracteres, maiúscula, minúscula, número e especial

### Inspeções

**GET /api/inspections**
- Descrição: Retorna inspeções do usuário (criadas + compartilhadas)
- Response: `InspectionResponse[]`
- Auth: Requer token JWT

**GET /api/inspections/all**
- Descrição: Retorna TODAS as inspeções (apenas admin)
- Response: `InspectionResponse[]`
- Auth: Requer token JWT + role admin

**GET /api/inspections/{inspection_id}**
- Descrição: Retorna inspeção específica
- Response: `InspectionResponse`
- Auth: Requer token JWT + permissão (criador, compartilhado ou admin)

**POST /api/inspections**
- Descrição: Cria nova inspeção
- Request: `InspectionCreate`
- Response: `InspectionResponse`
- Auth: Requer token JWT

**PUT /api/inspections/{inspection_id}**
- Descrição: Atualiza inspeção existente
- Request: `InspectionUpdate` (campos opcionais + edit_reason)
- Response: `InspectionResponse`
- Auth: Requer token JWT + permissão
- Restrição: Não pode editar inspeção finalizada se não for o criador

**DELETE /api/inspections/{inspection_id}**
- Descrição: Deleta inspeção
- Auth: Requer token JWT + ser o criador

### Reciclagem

**POST /api/inspections/{inspection_id}/recycle**
- Descrição: Recicla inspeção criando cópia com campos selecionados
- Request: `{ fields_to_keep: string[] }` - ["header", "fotos", "diagnostico", etc.]
- Response: `{ id: string, detail: string }`
- Auth: Requer token JWT + permissão
- Notificação: Cria notificação para o criador original se for compartilhada

### Histórico de Edições

**GET /api/inspections/{inspection_id}/edits**
- Descrição: Retorna histórico de edições da inspeção
- Response: `InspectionEditLog[]`
- Auth: Requer token JWT + permissão

### Notificações

**GET /api/notifications**
- Descrição: Retorna notificações do usuário
- Response: `NotificationResponse[]`
- Auth: Requer token JWT

**PUT /api/notifications/{notification_id}/read**
- Descrição: Marca notificação como lida
- Auth: Requer token JWT + ser o destinatário

### Utilitários

**GET /api/next-rastreabilidade**
- Descrição: Retorna próximo número de rastreabilidade sequencial
- Response: `{ next_rastreabilidade: number }`
- Auth: Requer token JWT

### Administração

**GET /api/users**
- Descrição: Retorna todos os usuários (apenas admin)
- Response: `UserResponse[]`
- Auth: Requer token JWT + role admin

**POST /api/users**
- Descrição: Cria novo usuário (apenas admin)
- Request: `UserCreate`
- Response: `UserResponse`
- Auth: Requer token JWT + role admin

**PUT /api/users/{uid}**
- Descrição: Atualiza usuário (apenas admin)
- Request: `UserUpdate`
- Response: `UserResponse`
- Auth: Requer token JWT + role admin

### Setup Inicial

**GET /api/setup/needs**
- Descrição: Verifica se o sistema precisa de setup inicial (banco vazio)
- Response: `{ needs_setup: boolean }`
- Auth: Não requer autenticação

**POST /api/setup/admin**
- Descrição: Cria primeiro administrador (apenas quando banco vazio)
- Request: `UserCreate`
- Response: `UserResponse`
- Auth: Não requer autenticação
- Restrição: Só funciona quando não há usuários no banco

---

## 🚀 Instalação e Deploy

### Pré-requisitos

- **Docker** e **Docker Compose** instalados (para produção)
- **Node.js 18+** (para desenvolvimento local)
- **Python 3.12+** (para desenvolvimento local)
- Scripts Windows na pasta `build/` (para usuários Windows)

### ⚠️ Segurança e Dados Sensíveis

Antes de fazer o deploy em produção ou ambientes de teste:

1. **NUNCA commitar o arquivo `.env`** - Ele contém credenciais sensíveis
2. **O arquivo `.env.example` deve ser usado como template** para criar o `.env` em cada ambiente
3. **Dados que nunca devem ser commitados:**
   - Banco de dados (pasta `data/`)
   - Arquivos `.env` reais
   - Logs (`*.log`)
   - Backups de banco (`*.sql`, `*.dump`)
   - Arquivos de banco local (`*.db`, `*.sqlite`)

### Configuração Inicial

Ao subir em um servidor ou máquina nova, o sistema funcionará da seguinte forma:

1. **Primeiro acesso (banco zerado):**
   - O sistema detecta que não há usuários no banco
   - Redireciona automaticamente para a tela de configuração inicial (`/setup`)
   - Você cria o primeiro usuário administrador
   - Após criar, é redirecionado para a tela de login

2. **Acessos subsequentes:**
   - Se já existirem usuários no banco, a tela de setup não aparece
   - Faça login com as credenciais existentes
   - O admin pode criar outros usuários técnicos via painel admin

### Instalação com Docker (Produção)

```bash
# Clone o repositório
git clone https://github.com/lucasbarros097/deere_inspect_pro.git
cd deere-inspect-pro

# Configure as variáveis de ambiente
cp .env.example .env
# Edite .env com suas credenciais

# Suba os containers
docker-compose up -d --build
```

Acesse: **http://localhost:8080**

### Desenvolvimento Local

**Backend:**
```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

O frontend estará em **http://localhost:5173** e o backend em **http://localhost:8000**.

### Windows (Scripts Automatizados)

Para usuários Windows, scripts disponíveis na pasta `build/`:

| Script | Descrição |
|--------|-----------|
| `start_backend.bat` | Inicia o backend em modo desenvolvimento |
| `start_frontend.bat` | Inicia o frontend em modo desenvolvimento |
| `build_frontend.bat` | Faz o build de produção do frontend |
| `build_backend.bat` | Cria executável do backend |
| `build_all.bat` | Faz build completo (frontend + backend) |
| `create_portable.bat` | Cria pacote portátil para distribuição |

**Configuração Windows:** Para desenvolvimento local sem Docker, configure o `.env` para usar SQLite:
```
DATABASE_URL=sqlite:///./deere_inspect.db
```

---

## 🔄 Fluxo de Trabalho das Inspeções

### 1. Criação da Inspeção

O técnico seleciona o tipo de equipamento:
- Pá Carregadeira
- Motoniveladora
- Escavadeira
- Retroescavadeira
- Trator de Esteira

O sistema gera automaticamente:
- Novo ID de inspeção
- Número de rastreabilidade sequencial
- Checklist específico para o tipo de equipamento
- Estrutura de Kanban para avaliação dos sistemas
- 30 slots para fotos

### 2. Preenchimento dos Dados

**Header:**
- Cliente, O.S., equipamento, marca/modelo, ano
- Número de série, horímetro, local da inspeção
- Técnico responsável, data, orçamento

**Solicitação de Análise:**
- Seleção de motivos (falha funcional, garantia, preventiva, etc.)
- Descrição da reclamação

**Condições de Operação:**
- Tipo de aplicação, material manuseado
- Condições ambientais, operador treinado
- Plano de manutenção

**Diagnóstico Eletrônico:**
- Ferramentas utilizadas (SERVICE ADVISOR)
- Manual de performance
- Códigos ativos e presentes

### 3. Checklist por Sistema

Cada equipamento possui seções específicas (ex: motor, transmissão, hidráulica). Para cada item:
- Descrição do componente
- Medida atual
- Medida de referência
- Tempo de verificação
- Observações

### 4. Avaliação Kanban

Para cada sistema do equipamento:
- **Aprovado:** Sistema em conformidade
- **Aprovado com Ressalvas:** Sistema funcional com observações
- **Reprovado:** Sistema necessita reparo

### 5. Registro Fotográfico

- Até 30 fotos por inspeção
- Compressão automática (JPEG, 80% qualidade)
- Redimensionamento (máx 1920px)
- Título e observação para cada foto

### 6. Assinatura Digital

- Assinatura do técnico em canvas digital
- Convertida para base64 e armazenada
- Obrigatória para finalização

### 7. Finalização e PDF

- Status muda para "finalizada"
- Geração automática de relatório PDF
- PDF inclui todos os dados, checklist, kanban, fotos e assinatura
- Nome do arquivo: `Inspecao_{cliente}_T{rastreabilidade}_OS-{os}_{data}.pdf`

### 8. Reciclagem (Opcional)

Permite criar nova inspeção baseada em uma existente:
- Selecionar campos a manter (header, fotos, diagnóstico, etc.)
- Rastreabilidade é resetada
- Assinatura é removida
- Notificação enviada ao criador original (se compartilhada)

---

## 🔐 Segurança e Permissões

### Perfis de Usuário

**Administrador:**
- Acesso total ao sistema
- Pode criar/editar/deletar usuários
- Visualiza todas as inspeções de todos os técnicos
- Acesso ao painel administrativo
- Não é forçado a trocar senha no primeiro login

**Técnico:**
- Cria e gerencia próprias inspeções
- Pode reciclar inspeções compartilhadas
- Forçado a trocar senha no primeiro login
- Senha expira a cada 90 dias
- Apenas visualiza suas inspeções

### Política de Senhas

**Requisitos:**
- Mínimo 8 caracteres
- Pelo menos uma letra maiúscula
- Pelo menos uma letra minúscula
- Pelo menos um número
- Pelo menos um caractere especial (!@#$%...)

**Segurança:**
- Hash com bcrypt
- Bloqueio após 5 tentativas falhas (15 minutos)
- Expiração a cada 90 dias (técnicos)
- Token JWT válido por 7 dias

### Controle de Acesso

**Inspeções:**
- Técnicos só veem suas próprias inspeções
- Admins veem todas as inspeções
- Edição permitida apenas para criador
- Inspeções finalizadas não podem ser editadas (exceto pelo criador)

**Endpoints:**
- Todos os endpoints protegidos com JWT (exceto setup)
- Verificação de role para endpoints admin
- Validação de propriedade para operações em inspeções

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

## 📸 Limitações de Imagens

O sistema possui as seguintes limitações para upload de imagens no registro fotográfico:

| Item | Limite |
|------|--------|
| **Quantidade máxima** | 30 fotos por inspeção |
| **Tamanho máximo por imagem** | 10 MB |
| **Dimensão máxima** | 1920px (redimensionamento automático) |
| **Qualidade de compressão** | 80% (JPEG) |
| **Formatos aceitos** | JPEG, PNG, WebP, HEIC |

As imagens são automaticamente redimensionadas e comprimidas para otimizar o armazenamento e garantir performance. A imagem original é preservada para download.

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

## 🧪 Testes

```bash
cd frontend
npm test
```

---

## 📄 Licença

Uso exclusivo para técnicos autorizados. Projeto interno do Grupo Ellos.
