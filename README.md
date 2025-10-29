# Sistema de Logística

Sistema completo para gestão de frota, manutenções e documentação de transporte.

## 🚀 Tecnologias

### Backend
- **Node.js** + **Express.js**
- **MySQL** com **Sequelize ORM**
- **JWT** para autenticação
- **Multer** para upload de arquivos
- **Helmet** para segurança

### Frontend
- **React.js** com **Hooks**
- **Axios** para requisições HTTP
- **Lucide React** para ícones
- **CSS3** responsivo

## 📋 Funcionalidades

### 👥 Gestão de Usuários
- Login com diferentes perfis (Motorista, Assistente, Gerente)
- Cadastro de motoristas
- Controle de acesso por perfil

### 🚛 Gestão de Veículos
- Cadastro de veículos (Caminhão, Carreta, Van, Utilitário)
- Controle de quilometragem
- Status em tempo real

### 🔧 Manutenções
- Registro de manutenções (Preventiva, Corretiva, Preditiva)
- Níveis de gravidade (Baixa, Média, Alta, Crítica)
- Histórico completo

### 📄 CT-e (Conhecimento de Transporte Eletrônico)
- Upload de documentos PDF
- Controle de numeração
- Histórico de documentos

### 📊 Dashboard
- Estatísticas em tempo real
- Manutenções urgentes
- Visão geral da frota

## 🛠️ Instalação

### Método Rápido (Windows)
```bash
# Execute o script de setup
setup.bat

# Inicie o sistema
start.bat
```

### Instalação Manual

#### 1. Backend
```bash
cd backend
npm install
cp .env.example .env
# Configure o .env com suas credenciais do MySQL
npm run dev
```

#### 2. Frontend
```bash
cd sistema-logistica
npm install
npm start
```

## ⚙️ Configuração

### Backend (.env)
```env
NODE_ENV=development
PORT=5000

# MySQL
DB_HOST=localhost
DB_PORT=3306
DB_NAME=sistema_logistica
DB_USER=root
DB_PASS=sua_senha

# JWT
JWT_SECRET=sua_chave_secreta_super_segura
JWT_EXPIRES_IN=7d

# Frontend URL
FRONTEND_URL=http://localhost:3000
```

### Frontend (.env)
```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_ENV=development
REACT_APP_MAX_FILE_SIZE=5242880
REACT_APP_API_TIMEOUT=30000
```

## 🗄️ Banco de Dados

### Inicialização
```bash
cd backend
npm run init-rds
```

### Usuários de Teste
- **Motorista**: `motorista` / `123`
- **Assistente**: `assistente` / `123`
- **Gerente**: `gerente` / `123`

## 📡 API Endpoints

### Autenticação
- `POST /api/auth/login` - Login
- `POST /api/auth/register` - Registro

### Veículos
- `GET /api/vehicles` - Listar veículos
- `POST /api/vehicles` - Criar veículo
- `PUT /api/vehicles/:id` - Atualizar veículo
- `DELETE /api/vehicles/:id` - Deletar veículo

### Usuários
- `GET /api/users` - Listar usuários
- `GET /api/users/:id` - Buscar usuário
- `PUT /api/users/:id` - Atualizar usuário

### Manutenções
- `GET /api/maintenances` - Listar manutenções
- `POST /api/maintenances` - Criar manutenção
- `PUT /api/maintenances/:id` - Atualizar manutenção

### CT-e
- `GET /api/ctes` - Listar CT-e
- `POST /api/ctes` - Upload CT-e
- `GET /api/ctes/download/:id` - Download arquivo

### Dashboard
- `GET /api/dashboard/stats` - Estatísticas

## 🔐 Segurança

- **Helmet.js** para headers de segurança
- **CORS** configurado
- **JWT** para autenticação
- **Validação** de dados de entrada
- **Rate limiting** (em desenvolvimento)

## 📱 Responsividade

Interface totalmente responsiva, funcionando em:
- 💻 Desktop
- 📱 Mobile
- 📟 Tablet

## 🚀 Deploy

### Backend (Produção)
```bash
npm run start
```

### Frontend (Build)
```bash
npm run build
```

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT.

## 📞 Suporte

Para suporte, entre em contato através do email ou abra uma issue no repositório.

---

**Desenvolvido com ❤️ para otimizar a gestão logística**