require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const path = require('path');
const db = require('./config/database');

// Importar rotas
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const vehicleRoutes = require('./routes/vehicle.routes');
const maintenanceRoutes = require('./routes/maintenance.routes');
const maintenanceHistoryRoutes = require('./routes/maintenanceHistory');
const cteRoutes = require('./routes/ctes.routes');
const dashboardRoutes = require('./routes/dashboard.routes');
const mensagemRoutes = require('./routes/mensagem.routes');

// Middleware de erro
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 3002;

// ============================================
// MIDDLEWARES GLOBAIS
// ============================================

// Segurança
app.use(helmet());

// CORS
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:3000', 
    'http://localhost:3000',
    'http://192.168.2.60:3000'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Compressão de respostas
app.use(compression());

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logger HTTP (apenas em desenvolvimento)
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Servir arquivos estáticos (uploads)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ============================================
// HEALTH CHECK
// ============================================

app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV
  });
});

// ============================================
// ROTAS DA API
// ============================================

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/maintenances', maintenanceRoutes);
app.use('/api/maintenance-history', maintenanceHistoryRoutes);
app.use('/api/ctes', cteRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/mensagens', mensagemRoutes);

// Rota 404
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Rota não encontrada'
  });
});

// ============================================
// MIDDLEWARE DE ERRO (deve ser o último)
// ============================================

app.use(errorHandler);

// ============================================
// CONEXÃO COM BANCO E INICIALIZAÇÃO
// ============================================

const startServer = async () => {
  try {
    // Testar conexão com banco
    await db.authenticate();
    console.log('✅ Conexão com MySQL estabelecida com sucesso');

    // Sincronizar models (apenas em desenvolvimento)
    if (process.env.NODE_ENV === 'development') {
      await db.sync({ alter: false });
      console.log('✅ Models sincronizados com o banco de dados');
    }

    // Criar pasta de uploads se não existir
    const fs = require('fs');
    const uploadsDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
      console.log('✅ Pasta de uploads criada');
    }

    // Iniciar servidor
    app.listen(PORT, '0.0.0.0', () => {
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(`🚀 Servidor rodando na porta ${PORT}`);
      console.log(`📍 Ambiente: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🌐 URL Local: http://localhost:${PORT}`);
      console.log(`🌐 URL Rede: http://192.168.2.60:${PORT}`);
      console.log(`🏥 Health Check: http://192.168.2.60:${PORT}/health`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    });

  } catch (error) {
    console.error('❌ Erro ao iniciar servidor:', error);
    process.exit(1);
  }
};

// Tratamento de erros não capturados
process.on('unhandledRejection', (err) => {
  console.error('❌ Erro não tratado:', err);
  process.exit(1);
});

process.on('uncaughtException', (err) => {
  console.error('❌ Exceção não capturada:', err);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('🛑 SIGTERM recebido. Fechando servidor...');
  await db.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('🛑 SIGINT recebido. Fechando servidor...');
  await db.close();
  process.exit(0);
});

// Iniciar servidor
startServer();