require('dotenv').config();
const { User } = require('./models');

const removeUser = async () => {
  try {
    const user = await User.findOne({ where: { matricula: '999' } });
    if (user) {
      await user.destroy();
      console.log('✅ Usuário 999 removido');
    } else {
      console.log('ℹ️ Usuário 999 não encontrado');
    }
  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
  process.exit(0);
};

removeUser();