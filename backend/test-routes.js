require('dotenv').config();
const { User } = require('./models');

const testRoutes = async () => {
  try {
    console.log('🔍 Testando rotas protegidas...');
    
    // 1. Fazer login para obter token
    const axios = require('axios');
    const loginResponse = await axios.post('http://localhost:3001/api/auth/login', {
      usuario: 'motorista',
      senha: '123'
    });
    
    const token = loginResponse.data.data.token;
    console.log('✅ Token obtido');
    
    // 2. Testar criação de veículo
    try {
      const vehicleResponse = await axios.post('http://localhost:3001/api/vehicles', {
        tipo: 'Caminhão',
        placa: 'ABC-1234',
        modelo: 'Volvo FH',
        ano: 2020,
        km_atual: 50000
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('✅ Criação de veículo OK');
    } catch (error) {
      console.error('❌ Erro ao criar veículo:', error.response?.data || error.message);
    }
    
    // 3. Testar criação de usuário
    try {
      const userResponse = await axios.post('http://localhost:3001/api/auth/register', {
        nome: 'Teste Motorista',
        usuario: 'teste123',
        senha: '123',
        perfil: 'Motorista',
        telefone: '31999999999',
        cnh: '12345678902'
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('✅ Criação de usuário OK');
    } catch (error) {
      console.error('❌ Erro ao criar usuário:', error.response?.data || error.message);
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  }
};

testRoutes();