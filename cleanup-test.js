const axios = require('axios');

const cleanup = async () => {
  try {
    console.log('🧹 Limpando usuário de teste...');
    
    // Primeiro fazer login como gerente para obter token
    const loginResponse = await axios.post('http://192.168.2.81:3002/api/auth/login', {
      matricula: 'gerente',
      senha: '123'
    });

    const token = loginResponse.data.data.token;
    console.log('✅ Login realizado');

    // Listar usuários para encontrar o de teste
    const usersResponse = await axios.get('http://192.168.2.81:3002/api/users', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const testUser = usersResponse.data.data.find(u => u.matricula === 'TEST001');
    
    if (testUser) {
      // Deletar usuário de teste
      await axios.delete(`http://192.168.2.81:3002/api/users/${testUser.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      console.log('✅ Usuário de teste removido');
    } else {
      console.log('ℹ️ Usuário de teste não encontrado');
    }

  } catch (error) {
    console.error('❌ Erro:', error.response?.data || error.message);
  }
};

cleanup();