require('dotenv').config();
const { User } = require('./models');

const removeTestUser = async () => {
  try {
    console.log('🗑️ Removendo usuário de teste...');
    
    const testUser = await User.findOne({ where: { matricula: 'TEST001' } });
    
    if (testUser) {
      await testUser.destroy();
      console.log('✅ Usuário de teste removido!');
    } else {
      console.log('ℹ️ Usuário de teste não encontrado');
    }
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
  
  process.exit(0);
};

removeTestUser();