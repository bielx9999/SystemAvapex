require('dotenv').config();
const { User } = require('./models');

const activateGerente = async () => {
  try {
    console.log('🔧 Ativando usuário gerente...');
    
    const gerente = await User.findOne({ where: { matricula: '003' } });
    
    if (gerente) {
      await gerente.update({ ativo: true });
      console.log('✅ Usuário gerente ativado!');
      console.log(`Nome: ${gerente.nome}`);
      console.log(`Matrícula: ${gerente.matricula}`);
      console.log(`Perfil: ${gerente.perfil}`);
    } else {
      console.log('❌ Usuário gerente não encontrado');
    }
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
  
  process.exit(0);
};

activateGerente();