const axios = require('axios');

const testLogin = async () => {
  try {
    console.log('🔍 Testando login...');
    
    const response = await axios.post('http://localhost:3001/api/auth/login', {
      usuario: 'motorista',
      senha: '123'
    });
    
    console.log('✅ Login OK!');
    console.log('Status:', response.status);
    console.log('Data:', response.data);
    
  } catch (error) {
    console.error('❌ Erro no login:');
    console.error('Status:', error.response?.status);
    console.error('Data:', error.response?.data);
    console.error('Message:', error.message);
  }
};

testLogin();