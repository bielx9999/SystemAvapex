require('dotenv').config();
const { User } = require('./models');

const createTestUsers = async () => {
  try {
    await User.create({
      nome: 'Motorista Teste',
      matricula: '001',
      senha: '123',
      perfil: 'Motorista',
      telefone: '31999999999'
    });
    
    await User.create({
      nome: 'Assistente Teste',
      matricula: '002',
      senha: '123',
      perfil: 'Assistente',
      telefone: '31888888888'
    });
    
    await User.create({
      nome: 'Gerente Teste',
      matricula: '003',
      senha: '123',
      perfil: 'Gerente',
      telefone: '31777777777'
    });
    
    console.log('✅ Usuários criados!');
    console.log('Login: 001, 002, 003 / Senha: 123');
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
  
  process.exit(0);
};

createTestUsers();