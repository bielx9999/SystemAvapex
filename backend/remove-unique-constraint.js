require('dotenv').config();
const { sequelize } = require('./models');

const removeConstraint = async () => {
  try {
    console.log('🔧 Removendo constraint unique da matrícula...');
    
    // Verificar constraints existentes
    const [results] = await sequelize.query(`
      SELECT CONSTRAINT_NAME 
      FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
      WHERE TABLE_NAME = 'User' 
      AND COLUMN_NAME = 'matricula' 
      AND TABLE_SCHEMA = 'sistema_logistica'
      AND CONSTRAINT_NAME != 'PRIMARY'
    `);
    
    console.log('Constraints encontradas:', results);
    
    // Remover constraint unique se existir
    for (const constraint of results) {
      try {
        await sequelize.query(`ALTER TABLE User DROP INDEX \`${constraint.CONSTRAINT_NAME}\``);
        console.log(`✅ Constraint ${constraint.CONSTRAINT_NAME} removida`);
      } catch (err) {
        console.log(`⚠️ Erro ao remover ${constraint.CONSTRAINT_NAME}:`, err.message);
      }
    }
    
    console.log('✅ Processo concluído!');
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
  
  process.exit(0);
};

removeConstraint();