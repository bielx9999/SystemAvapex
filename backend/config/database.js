const { Sequelize } = require('sequelize');

// Configuração da conexão com AWS RDS MySQL
const sequelize = new Sequelize(
  process.env.DB_NAME || 'sistema_logistica',
  process.env.DB_USER || 'admin',
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    
    // Pool de conexões otimizado para RDS
    pool: {
      max: 20,          // Máximo de conexões
      min: 5,           // Mínimo de conexões mantidas
      acquire: 60000,   // Tempo máximo para obter conexão (60s)
      idle: 10000,      // Tempo que conexão pode ficar ociosa
      evict: 10000      // Intervalo de verificação de conexões ociosas
    },
    
    // Configurações para RDS
    dialectOptions: {
      connectTimeout: 60000,
      // SSL para RDS (opcional mas recomendado em produção)
      ssl: process.env.NODE_ENV === 'production' ? {
        rejectUnauthorized: true
      } : false
    },
    
    // Logging
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    
    // Timezone
    timezone: '-03:00', // Brasília
    
    // Configurações adicionais
    define: {
      timestamps: true,
      underscored: false,
      freezeTableName: true,
      charset: 'utf8mb4',
      collate: 'utf8mb4_unicode_ci'
    },
    
    // Retry em caso de erro
    retry: {
      max: 3,
      match: [
        Sequelize.ConnectionError,
        Sequelize.ConnectionTimedOutError,
        Sequelize.TimeoutError
      ]
    },
    
    // Benchmark de queries
    benchmark: process.env.NODE_ENV === 'development'
  }
);

// Testar conexão com retry automático
const testConnection = async (retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      await sequelize.authenticate();
      console.log(`✅ Conectado ao AWS RDS: ${process.env.DB_HOST}`);
      return true;
    } catch (error) {
      console.error(`❌ Tentativa ${i + 1}/${retries} falhou:`, error.message);
      if (i === retries - 1) {
        console.error('Erro ao conectar no banco de dados:', error);
        return false;
      }
      // Aguardar 2s antes de tentar novamente
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
};

module.exports = sequelize;
module.exports.testConnection = testConnection;