require('dotenv').config();
const { sequelize } = require('./models');

const fixDatabase = async () => {
  try {
    console.log('🔧 Aplicando correções no banco de dados...');
    
    // Sincronizar modelos (vai recriar constraints)
    await sequelize.sync({ alter: true });
    
    console.log('✅ Banco de dados atualizado com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro ao atualizar banco:', error.message);
  }
  
  process.exit(0);
};

fixDatabase();