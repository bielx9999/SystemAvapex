const axios = require('axios');

const testFuncionario = async () => {
  try {
    // Login como gerente
    console.log('🔐 Fazendo login...');
    const loginResponse = await axios.post('http://192.168.2.81:3002/api/auth/login', {
      matricula: '003',
      senha: '123'
    });

    const token = loginResponse.data.data.token;
    console.log('✅ Login realizado');

    // Testar cadastro
    console.log('👤 Testando cadastro de funcionário...');
    const funcionarioData = {
      nome: 'Teste Novo',
      matricula: '999',
      perfil: 'Motorista',
      senha: '123456',
      telefone: '31999999999'
    };

    console.log('📤 Dados:', funcionarioData);

    const response = await axios.post('http://192.168.2.81:3002/api/auth/register', funcionarioData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Funcionário cadastrado:', response.data);

  } catch (error) {
    console.error('❌ Erro detalhado:');
    console.error('Status:', error.response?.status);
    console.error('Data:', error.response?.data);
    console.error('Headers:', error.response?.headers);
  }
};

testFuncionario();