const axios = require('axios');

const testRegister = async () => {
  try {
    console.log('🧪 Testando cadastro de funcionário...');
    
    const data = {
      nome: 'Teste Funcionario',
      matricula: 'TEST001',
      perfil: 'Motorista',
      senha: '123456',
      telefone: '31999999999'
    };

    console.log('📤 Enviando dados:', data);

    const response = await axios.post('http://192.168.2.81:3002/api/auth/register', data, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Sucesso:', response.data);

  } catch (error) {
    console.error('❌ Erro:', error.response?.data || error.message);
    console.error('Status:', error.response?.status);
    console.error('Headers:', error.response?.headers);
  }
};

testRegister();