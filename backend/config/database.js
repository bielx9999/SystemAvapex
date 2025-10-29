const { Sequelize } = require('sequelize');

// Configuração da conexão com MySQL
const sequelize = new Sequelize(
  process.env.DB_NAME || 'sistema_logistica',
  process.env.DB_USER || 'root',
  process.env.DB_PASS || '',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    
    // Pool de conexões
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000
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
      max: 3
    }
  }
);

// Testar conexão
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    return true;
  } catch (error) {
    console.error('Erro ao conectar no banco de dados:', error);
    return false;
  }
};

module.exports = sequelize;