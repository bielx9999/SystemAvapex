require('dotenv').config();
const { User } = require('./models');

const createTestUsers = async () => {
  try {
    // Verificar se já existem usuários
    const userCount = await User.count();
    console.log(`Usuários existentes: ${userCount}`);
    
    if (userCount === 0) {
      console.log('Criando usuários de teste...');
      
      await User.create({
        nome: 'Motorista Teste',
        usuario: 'motorista',
        senha: '123',
        perfil: 'Motorista',
        telefone: '31999999999',
        cnh: '12345678901'
      });
      
      await User.create({
        nome: 'Assistente Teste',
        usuario: 'assistente',
        senha: '123',
        perfil: 'Assistente',
        telefone: '31888888888'
      });
      
      await User.create({
        nome: 'Gerente Teste',
        usuario: 'gerente',
        senha: '123',
        perfil: 'Gerente',
        telefone: '31777777777'
      });
      
      console.log('✅ Usuários de teste criados!');
    } else {
      console.log('✅ Usuários já existem');
    }
    
    // Listar usuários
    const users = await User.findAll({ attributes: ['id', 'nome', 'usuario', 'perfil'] });
    console.log('\nUsuários disponíveis:');
    users.forEach(user => {
      console.log(`- ${user.usuario} (${user.perfil})`);
    });
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
  
  process.exit(0);
};

createTestUsers();