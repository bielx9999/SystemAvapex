require('dotenv').config();
const { sequelize } = require('./models');

async function updateDatabase() {
  try {
    console.log('🔄 Atualizando estrutura do banco de dados...');
    
    // Sincronizar modelos com alter: true para adicionar novos campos
    await sequelize.sync({ alter: true });
    
    console.log('✅ Banco de dados atualizado com sucesso!');
    console.log('📋 Novo campo "em_andamento" adicionado à tabela Maintenance');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro ao atualizar banco:', error);
    process.exit(1);
  }
}

updateDatabase();