require('dotenv').config();
const { User } = require('./models');

async function checkUsers() {
  try {
    console.log('🔍 Verificando usuários no banco...');
    
    const users = await User.findAll({
      attributes: ['id', 'nome', 'matricula', 'perfil', 'ativo']
    });
    
    console.log('Usuários encontrados:');
    users.forEach(user => {
      console.log(`- ID: ${user.id}, Nome: ${user.nome}, Matrícula: ${user.matricula}, Perfil: ${user.perfil}, Ativo: ${user.ativo}`);
    });
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
  
  process.exit(0);
}

checkUsers();