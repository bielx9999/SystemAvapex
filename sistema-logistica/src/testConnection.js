import axios from 'axios';

// Teste de conectividade
const testConnection = async () => {
  try {
    console.log('Testando conexão com backend...');
    
    // Teste 1: Health check
    const healthResponse = await axios.get('http://localhost:3001/health');
    console.log('✅ Health check OK:', healthResponse.data);
    
    // Teste 2: Login
    const loginResponse = await axios.post('http://localhost:3001/api/auth/login', {
      usuario: 'motorista',
      senha: '123'
    });
    console.log('✅ Login OK:', loginResponse.data);
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
    console.error('Response:', error.response?.data);
  }
};

// Executar teste quando a página carregar
window.testConnection = testConnection;

export default testConnection;