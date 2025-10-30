const axios = require('axios');

const testLogin = async () => {
  try {
    console.log('🔍 Testando login com matricula...');
    
    const response = await axios.post('http://localhost:3001/api/auth/login', {
      matricula: '001',
      senha: '123'
    });
    
    console.log('✅ Login OK:', response.data);
    
  } catch (error) {
    console.error('❌ Erro:', error.response?.data || error.message);
  }
};

testLogin();