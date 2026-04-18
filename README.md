# Patrimônio Inteligente

Sistema de Gestão Patrimonial da **Prefeitura Municipal de Oriximiná/PA**.

---

## Tecnologias

| Camada     | Stack                          |
|------------|--------------------------------|
| Front-end  | HTML5 + CSS3 + JavaScript puro |
| Back-end   | Node.js + Express              |
| Banco      | PostgreSQL + Prisma ORM        |

---

## Pré-requisitos

- Node.js >= 18
- PostgreSQL >= 14

---

## Instalação

### 1. Clonar o repositório

```bash
git clone <url-do-repositorio>
cd patrimonio-inteligente
```

### 2. Configurar o back-end

```bash
cd backend
npm install
cp .env.example .env
# Edite .env e preencha DATABASE_URL e JWT_SECRET
```

### 3. Configurar o banco de dados

```bash
# Criar as tabelas
npm run db:migrate

# Criar usuário administrador e dados iniciais
npm run db:seed
```

### 4. Iniciar o servidor

```bash
# Desenvolvimento (com hot reload)
npm run dev

# Produção
npm start
```

O sistema estará disponível em: **http://localhost:3000**

---

## Usuários criados pelo seed

| E-mail                                  | Senha        | Papel   |
|-----------------------------------------|--------------|---------|
| admin@oriximina.pa.gov.br               | Admin@2025!  | ADMIN   |
| gestor.patrimonio@oriximina.pa.gov.br   | Gestor@2025! | GESTOR  |

> ⚠️ Altere as senhas no primeiro acesso.

---

## Estrutura do projeto

```
patrimonio-inteligente/
├── frontend/public/        # Arquivos estáticos servidos pelo Express
│   ├── pages/              # Páginas HTML
│   ├── styles/             # CSS global e de componentes
│   ├── scripts/            # JavaScript modular
│   └── assets/             # Imagens e ícones
│
└── backend/
    ├── src/
    │   ├── config/         # Configurações (DB, JWT, CORS)
    │   ├── routes/         # Mapeamento de rotas
    │   ├── controllers/    # Entrada/saída HTTP
    │   ├── services/       # Lógica de negócio
    │   ├── middlewares/    # Auth, RBAC, validação, erros
    │   └── utils/          # Helpers (response, pagination, logger)
    └── prisma/             # Schema e migrations
```

---

## Scripts disponíveis

```bash
npm run dev          # Inicia em modo desenvolvimento
npm run db:migrate   # Executa migrações pendentes
npm run db:seed      # Popula dados iniciais
npm run db:studio    # Abre o Prisma Studio (interface visual do banco)
npm run db:reset     # Reseta o banco (⚠️ apaga todos os dados)
```

---

## Papéis de acesso

| Papel        | Permissões                                     |
|--------------|------------------------------------------------|
| ADMIN        | Acesso total ao sistema                        |
| GESTOR       | Gerencia patrimônio e aprova transferências    |
| OPERADOR     | Cadastra e edita bens                          |
| VISUALIZADOR | Somente leitura                                |

---

## Roadmap — Fases futuras

- **Fase 2:** Banco de permutas, relatórios PDF, transparência pública
- **Fase 3:** Análise preditiva, manutenção preventiva, módulo IA
