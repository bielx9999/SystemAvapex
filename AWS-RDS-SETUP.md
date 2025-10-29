# 🚀 Configuração do AWS RDS para Sistema de Logística

## Passo 1: Criar RDS Instance no AWS Console

### 1.1. Acessar RDS
1. Entre no [AWS Console](https://console.aws.amazon.com)
2. Vá em **Services → RDS**
3. Clique em **Create database**

### 1.2. Configuração Básica

**Standard create** (para mais controle)

- **Engine type**: MySQL
- **Version**: MySQL 8.0.35 ou superior
- **Template**: 
  - Dev/Test (para desenvolvimento)
  - Production (para produção)

### 1.3. Settings

- **DB instance identifier**: `sistema-logistica-db`
- **Master username**: `admin` (ou seu preferido)
- **Master password**: Escolha uma senha forte
  - ⚠️ **Salve esta senha!** Você precisará dela no `.env`

### 1.4. Instance Configuration

**Para Desenvolvimento/Testes:**
- **DB instance class**: db.t3.micro (Free tier elegível)
- **Storage type**: General Purpose SSD (gp3)
- **Allocated storage**: 20 GB

**Para Produção:**
- **DB instance class**: db.t3.small ou superior
- **Storage type**: General Purpose SSD (gp3)
- **Allocated storage**: 50 GB ou mais
- **Enable storage autoscaling**: ✅

### 1.5. Connectivity

**Importante para acesso:**

- **VPC**: Selecione sua VPC
- **Public access**: 
  - ✅ **Yes** (se vai conectar de fora da AWS)
  - ❌ **No** (se apenas EC2 vai acessar)
- **VPC security group**: Criar novo ou usar existente
  - Nome: `sistema-logistica-sg`

### 1.6. Database Authentication

- **Password authentication** ✅

### 1.7. Additional Configuration

- **Initial database name**: `sistema_logistica`
- **Backup retention period**: 7 days (recomendado)
- **Enable automatic backups**: ✅
- **Enable encryption**: ✅ (recomendado)
- **Enable Performance Insights**: ✅ (opcional, útil)

### 1.8. Criar Database

Clique em **Create database**

⏱️ Aguarde 5-10 minutos para o RDS ficar disponível

---

## Passo 2: Configurar Security Group

### 2.1. Editar Security Group

1. Vá em **EC2 → Security Groups**
2. Encontre o Security Group criado (ex: `sistema-logistica-sg`)
3. Clique em **Edit inbound rules**

### 2.2. Adicionar Regra MySQL

**Inbound Rule:**

| Type | Protocol | Port | Source | Description |
|------|----------|------|--------|-------------|
| MySQL/Aurora | TCP | 3306 | Seu IP/32 | Desenvolvimento local |
| MySQL/Aurora | TCP | 3306 | Security Group do EC2 | Produção (se usar EC2) |

**Para desenvolvimento local:**
- Source: `Meu IP` ou seu IP público com `/32`
- Exemplo: `200.150.100.50/32`

**Para produção com EC2:**
- Source: Security Group do seu EC2
- Exemplo: `sg-xxxxxxxxxx`

⚠️ **Segurança**: Nunca use `0.0.0.0/0` (todos os IPs) em produção!

---

## Passo 3: Obter Endpoint do RDS

1. Vá em **RDS → Databases**
2. Clique na sua database (`sistema-logistica-db`)
3. Na aba **Connectivity & security**
4. Copie o **Endpoint**

Exemplo: `sistema-logistica-db.abc123xyz.us-east-1.rds.amazonaws.com`

---

## Passo 4: Configurar `.env` do Backend

Crie/edite o arquivo `backend/.env`:

```env
# AWS RDS MySQL
DB_HOST=sistema-logistica-db.abc123xyz.us-east-1.rds.amazonaws.com
DB_PORT=3306
DB_NAME=sistema_logistica
DB_USER=admin
DB_PASS=sua_senha_rds_aqui

# Resto da configuração
NODE_ENV=development
PORT=5000
JWT_SECRET=sua_chave_secreta_min_32_caracteres
JWT_EXPIRES_IN=7d
MAX_FILE_SIZE=5242880
UPLOAD_PATH=./uploads
FRONTEND_URL=http://localhost:3000
```

---

## Passo 5: Inicializar o Banco de Dados

No terminal, dentro da pasta `backend`:

```bash
# Instalar dependências (se ainda não instalou)
npm install

# Inicializar RDS (criar tabelas e dados iniciais)
npm run init-rds
```

**Saída esperada:**

```
🔄 Conectando ao AWS RDS...
✅ Conexão estabelecida com sucesso!
🔄 Criando banco de dados...
✅ Banco 'sistema_logistica' criado/verificado
🔄 Executando schema SQL...
✅ Schema executado com sucesso
📊 Verificando tabelas...
✅ 8 tabelas criadas:
   - usuarios
   - veiculos
   - manutencoes
   - ctes
   ...
👥 Verificando usuários...
✅ 3 usuários encontrados
✅ BANCO DE DADOS RDS INICIALIZADO COM SUCESSO!
```

---

## Passo 6: Testar Conexão

```bash
# Testar conexão com RDS
npm run test-connection
```

Se funcionar, você verá:
```
✅ Conectado ao AWS RDS: seu-endpoint.rds.amazonaws.com
```

---

## Passo 7: Iniciar o Backend

```bash
npm run dev
```

Deve aparecer:
```
✅ Conexão com MySQL estabelecida com sucesso
🚀 Servidor rodando na porta 5000
```

---

## 🔧 Troubleshooting

### Erro: "Can't connect to MySQL server"

**Causas comuns:**

1. **Security Group não permite sua IP**
   - Solução: Adicionar sua IP nas inbound rules

2. **RDS não é publicly accessible**
   - Solução: Modificar RDS → Connectivity → Publicly accessible → Yes

3. **Endpoint errado no .env**
   - Solução: Verificar endpoint no AWS Console

4. **Senha incorreta**
   - Solução: Verificar senha no AWS Console ou resetar

### Erro: "Access denied for user"

- Verifique username e senha no `.env`
- Certifique-se que o usuário tem permissões

### Erro: "Unknown database"

- O banco `sistema_logistica` não foi criado
- Execute `npm run init-rds` novamente

### Testar conexão manualmente

```bash
# No terminal
mysql -h seu-endpoint.rds.amazonaws.com -u admin -p
# Digite a senha quando solicitado

# Dentro do MySQL
SHOW DATABASES;
USE sistema_logistica;
SHOW TABLES;
```

---

## 💰 Custos Estimados (AWS Free Tier)

**Free Tier (12 meses):**
- 750 horas/mês de db.t2.micro ou db.t3.micro
- 20 GB de storage
- 20 GB de backup

**Após Free Tier (estimativa mensal):**
- db.t3.micro: ~$15/mês
- db.t3.small: ~$30/mês
- Storage (20GB): ~$2.30/mês
- Backups: grátis (igual ao storage)

💡 **Dica**: Use RDS apenas em horário de trabalho no desenvolvimento (pode parar/iniciar)

---

## 🔒 Melhores Práticas de Segurança

### 1. Senha Forte
```
✅ Mínimo 16 caracteres
✅ Letras maiúsculas e minúsculas
✅ Números e símbolos
❌ Não use senhas óbvias
```

### 2. Security Groups Restritos
```
✅ Apenas IPs necessários
✅ Use VPN para acesso remoto
❌ Nunca 0.0.0.0/0 em produção
```

### 3. SSL/TLS
```javascript
// Em produção, ative SSL no dialectOptions
ssl: {
  rejectUnauthorized: true,
  ca: fs.readFileSync('./rds-ca-bundle.pem')
}
```

### 4. Backups Automáticos
```
✅ Retention period: 7-30 dias
✅ Teste restauração periodicamente
✅ Enable automated backups
```

### 5. Monitoring
```
✅ CloudWatch alarms
✅ Performance Insights
✅ Enhanced Monitoring
```

---

## 📊 Monitoramento

### CloudWatch Metrics

1. **CPU Utilization**: < 80%
2. **Database Connections**: Monitor número de conexões
3. **Free Storage Space**: Manter acima de 20%
4. **Read/Write IOPS**: Verificar se está dentro do limite

### Performance Insights

Ative para ver:
- Top SQL queries
- Database load
- Wait events

---

## 🔄 Backup e Restore

### Criar Snapshot Manual

1. RDS → Databases
2. Selecione sua database
3. Actions → Take snapshot
4. Nome: `sistema-logistica-backup-YYYY-MM-DD`

### Restaurar de Snapshot

1. RDS → Snapshots
2. Selecione o snapshot
3. Actions → Restore snapshot
4. Configure novo endpoint

---

## 🚀 Migration para Produção

### Checklist Pré-Produção

- [ ] Alterar senhas padrão dos usuários de teste
- [ ] Configurar backups automáticos
- [ ] Ativar encryption
- [ ] Configurar Multi-AZ (alta disponibilidade)
- [ ] Ativar Performance Insights
- [ ] Configurar CloudWatch alarms
- [ ] Documentar endpoint e credenciais
- [ ] Testar restore de backup
- [ ] Configurar SSL/TLS

---

## 📚 Recursos Adicionais

- [AWS RDS Documentation](https://docs.aws.amazon.com/rds/)
- [MySQL on RDS Best Practices](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/CHAP_BestPractices.html)
- [RDS Security](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/UsingWithRDS.html)

---

**Última atualização:** 2025-10-29  
**Versão:** 1.0.0


npm run init-rds

# 4. Testar conexão
npm run test-connection

# 5. Iniciar backend
npm run dev