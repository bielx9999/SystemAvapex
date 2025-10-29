# 🚚 Sistema de Logística - AvaSystem

Sistema completo de gestão logística para controle de frota, motoristas, manutenções e documentos de transporte (CT-e).

## 📋 Índice

- [Características](#características)
- [Tecnologias](#tecnologias)
- [Pré-requisitos](#pré-requisitos)
- [Instalação](#instalação)
- [Configuração](#configuração)
- [Executando o Projeto](#executando-o-projeto)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [API Endpoints](#api-endpoints)
- [Perfis de Usuário](#perfis-de-usuário)
- [Deploy](#deploy)

## ✨ Características

- 🔐 **Autenticação JWT** com múltiplos perfis de acesso
- 🚗 **Gestão de Veículos** - Cadastro e controle de frota
- 👷 **Gestão de Motoristas** - Controle de CNH e dados pessoais
- 🔧 **Manutenções** - Sistema completo de registro e acompanhamento
- 📄 **CT-e** - Upload e gestão de documentos fiscais
- 📊 **Dashboard** - Indicadores e estatísticas em tempo real
- 📱 **Responsivo** - Interface adaptada para mobile (motoristas)
- ⚡ **Performance** - Otimizado com índices de banco e cache

## 🛠 Tecnologias

### Backend
- Node.js 18+
- Express.js
- MySQL 8.0
- Sequelize ORM
- JWT (jsonwebtoken)
- Bcrypt
- Multer (upload de arquivos)

### Frontend
- React 18
- Axios
- React Router
- Context API
- Lucide Icons
- CSS3 (Flexbox/Grid)

## 📦 Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- [Node.js](https://nodejs.org/) (versão 18 ou superior)
- [MySQL](https://www.mysql.com/) (versão 8.0 ou superior)
- [Git](https://git-scm.com/)
- npm ou yarn

## 🚀 Instalação

### 1. Clone o repositório

```bash
git clone https://github.com/seu-usuario/sistema-logistica.git
cd sistema-logistica
```

### 2. Configurar o Banco de Dados

```bash
# Entre no MySQL
mysql -u root -p

# Execute o script SQL
source database-schema.sql

# Ou se preferir:
mysql -u root -p < database-schema.sql
```

O script cria automaticamente:
- Banco de dados `sistema_logistica`
- Todas as tabelas necessárias
- Índices para performance
- Views úteis
- Stored procedures
- Dados iniciais (usuários de teste)

### 3. Instalar Dependências do Backend

```bash
cd backend
npm install
```

### 4. Configurar Variáveis de Ambiente

```bash
# Copiar arquivo de exemplo
cp .env.example .env

# Editar com suas configurações
nano .env
```

Exemplo de `.env`:

```env
NODE_ENV=development
PORT=5000

DB_HOST=localhost
DB_PORT=3306
DB_NAME=sistema_logistica
DB_USER=root
DB_PASS=sua_senha_mysql

JWT_SECRET=chave_super_secreta_min_32_caracteres_aqui
JWT_EXPIRES_IN=7d

MAX_FILE_SIZE=5242880
UPLOAD_PATH=./uploads

FRONTEND_URL=http://localhost:3000
```

### 5. Instalar Dependências do Frontend

```bash
cd ../sistema-logistica
npm install
```

## ⚙️ Configuração

### Usuários Padrão

O sistema vem com 3 usuários pré-cadastrados para teste:

| Usuário | Senha | Perfil |
|---------|-------|--------|
| gerente | 123 | Gerente |
| assistente | 123 | Assistente |
| motorista | 123 | Motorista |

**⚠️ IMPORTANTE:** Altere estas senhas em produção!

### Estrutura de Perfis

- **Gerente**: Acesso total ao sistema
- **Assistente**: Cadastros e visualizações (sem deletar)
- **Motorista**: Visualiza seus próprios dados e registra informações

## 🎯 Executando o Projeto

### Desenvolvimento

#### Terminal 1 - Backend

```bash
cd backend
npm run dev

# Servidor rodará em: http://localhost:5000
```

#### Terminal 2 - Frontend

```bash
cd sistema-logistica
npm start

# Aplicação abrirá em: http://localhost:3000
```

### Produção

#### Backend

```bash
cd backend
npm start
```

#### Frontend

```bash
cd sistema-logistica
npm run build

# Servir com servidor web (nginx, apache, etc)
```

## 📁 Estrutura do Projeto

```
sistema-logistica/
├── backend/
│   ├── config/
│   │   └── database.js           # Configuração MySQL
│   ├── controllers/
│   │   ├── authController.js     # Autenticação
│   │   ├── vehicleController.js  # Veículos
│   │   ├── maintenanceController.js # Manutenções
│   │   ├── cteController.js      # CT-e
│   │   └── dashboardController.js # Dashboard
│   ├── middleware/
│   │   ├── auth.js               # JWT
│   │   ├── upload.js             # Multer
│   │   ├── errorHandler.js       # Erros
│   │   └── validators.js         # Validações
│   ├── models/
│   │   ├── User.js
│   │   ├── Vehicle.js
│   │   ├── Maintenance.js
│   │   ├── Cte.js
│   │   └── index.js
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── user.routes.js
│   │   ├── vehicle.routes.js
│   │   ├── maintenance.routes.js
│   │   ├── cte.routes.js
│   │   └── dashboard.routes.js
│   ├── uploads/                   # Arquivos (gitignored)
│   ├── .env                       # Variáveis (gitignored)
│   ├── .env.example
│   ├── package.json
│   └── server.js
├── sistema-logistica/             # Frontend React
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── services/
│   │   ├── App.js
│   │   └── index.js
│   └── package.json
├── database-schema.sql            # Schema do banco
└── README.md
```

## 🔌 API Endpoints

### Autenticação

```
POST   /api/auth/register          # Registrar usuário
POST   /api/auth/login             # Login
GET    /api/auth/me                # Dados do usuário logado
PUT    /api/auth/change-password   # Alterar senha
POST   /api/auth/logout            # Logout
```

### Usuários

```
GET    /api/users                  # Listar usuários
GET    /api/users/:id              # Obter usuário
PUT    /api/users/:id              # Atualizar usuário
DELETE /api/users/:id              # Desativar usuário
```

### Veículos

```
GET    /api/vehicles               # Listar veículos
GET    /api/vehicles/:id           # Obter veículo
POST   /api/vehicles               # Criar veículo
PUT    /api/vehicles/:id           # Atualizar veículo
PUT    /api/vehicles/:id/km        # Atualizar KM
DELETE /api/vehicles/:id           # Desativar veículo
```

### Manutenções

```
GET    /api/maintenances           # Listar manutenções
GET    /api/maintenances/urgent    # Manutenções urgentes
GET    /api/maintenances/:id       # Obter manutenção
POST   /api/maintenances           # Criar manutenção
PUT    /api/maintenances/:id       # Atualizar manutenção
PUT    /api/maintenances/:id/status # Atualizar status
DELETE /api/maintenances/:id       # Deletar manutenção
```

### CT-e

```
GET    /api/ctes                   # Listar CT-e
GET    /api/ctes/:id               # Obter CT-e
POST   /api/ctes                   # Criar CT-e (multipart/form-data)
PUT    /api/ctes/:id               # Atualizar CT-e
GET    /api/ctes/:id/download      # Download do arquivo
DELETE /api/ctes/:id               # Deletar CT-e
```

### Dashboard

```
GET    /api/dashboard/stats                # Estatísticas gerais
GET    /api/dashboard/urgent-maintenances  # Manutenções urgentes
GET    /api/dashboard/recent-activities    # Atividades recentes
GET    /api/dashboard/maintenances-chart   # Gráfico de manutenções
```

### Autenticação nas Requisições

Incluir header em todas as rotas protegidas:

```
Authorization: Bearer <seu_token_jwt>
```

## 👥 Perfis de Usuário

### Gerente
- ✅ Acesso completo
- ✅ Criar/editar/deletar todos os registros
- ✅ Visualizar todos os dados
- ✅ Gerenciar usuários

### Assistente
- ✅ Criar e editar registros
- ✅ Visualizar todos os dados
- ❌ Não pode deletar
- ❌ Não pode gerenciar usuários

### Motorista
- ✅ Visualizar seus próprios dados
- ✅ Registrar abastecimentos
- ✅ Fazer checklist de veículos
- ❌ Acesso limitado

## 🚀 Deploy

### Backend (Produção)

1. Configure variáveis de ambiente no servidor
2. Instale PM2 para gerenciamento:

```bash
npm install -g pm2
pm2 start server.js --name api-logistica
pm2 save
pm2 startup
```

### Frontend (Produção)

1. Build do projeto:

```bash
npm run build
```

2. Configure nginx:

```nginx
server {
    listen 80;
    server_name seu-dominio.com;
    
    root /caminho/para/build;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 🔒 Segurança

- Senhas hasheadas com bcrypt (salt rounds: 10)
- JWT tokens com expiração configurável
- Validação de inputs com express-validator
- CORS configurado
- Helmet.js para headers de segurança
- Proteção contra SQL injection (Sequelize)
- Upload de arquivos com validação de tipo e tamanho

## 📝 Licença

Este projeto está sob a licença MIT.

## 👨‍💻 Desenvolvido por

[Seu Nome/Empresa]

## 📞 Suporte

Para dúvidas ou problemas, abra uma issue no GitHub ou entre em contato:
- Email: seu-email@exemplo.com
- WhatsApp: (31) 99999-9999

---

**Nota:** Este é um sistema em produção. Sempre faça backup do banco de dados antes de atualizações importantes.