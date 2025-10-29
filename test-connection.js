const axios = require('axios');

const testConnection = async () => {
  console.log('🔍 Testando conexão entre Frontend e Backend...\n');

  try {
    // Testar health check do backend
    console.log('1. Testando Backend Health Check...');
    const healthResponse = await axios.get('http://localhost:5000/health', {
      timeout: 5000
    });
    
    if (healthResponse.status === 200) {
      console.log('✅ Backend está rodando');
      console.log(`   Status: ${healthResponse.data.status}`);
      console.log(`   Ambiente: ${healthResponse.data.environment}`);
    }

    // Testar rota da API
    console.log('\n2. Testando API Routes...');
    
    // Testar rota de veículos (deve retornar 401 sem token)
    try {
      await axios.get('http://localhost:5000/api/vehicles');
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Rota /api/vehicles está protegida (401 - esperado)');
      } else {
        console.log(`❌ Erro inesperado na rota vehicles: ${error.message}`);
      }
    }

    // Testar rota de login
    try {
      const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
        usuario: 'teste',
        senha: 'teste'
      });
    } catch (error) {
      if (error.response?.status === 400 || error.response?.status === 401) {
        console.log('✅ Rota /api/auth/login está funcionando (erro de credenciais - esperado)');
      } else {
        console.log(`❌ Erro inesperado na rota login: ${error.message}`);
      }
    }

    console.log('\n🎉 Teste de conexão concluído!');
    console.log('\n📋 Próximos passos:');
    console.log('1. Certifique-se que o MySQL está rodando');
    console.log('2. Execute: cd backend && npm run init-rds');
    console.log('3. Inicie o frontend: cd sistema-logistica && npm start');

  } catch (error) {
    console.log('❌ Erro ao conectar com o backend:');
    console.log(`   ${error.message}`);
    console.log('\n🔧 Soluções:');
    console.log('1. Verifique se o backend está rodando na porta 5000');
    console.log('2. Execute: cd backend && npm run dev');
    console.log('3. Verifique o arquivo .env do backend');
  }
};

// Executar teste se chamado diretamente
if (require.main === module) {
  testConnection();
}

module.exports = testConnection;