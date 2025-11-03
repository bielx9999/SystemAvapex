require('dotenv').config();
const axios = require('axios');

async function testVehicleAPI() {
  try {
    console.log('🧪 Testando API de veículos...');
    
    // Primeiro fazer login para obter token
    console.log('1. Fazendo login...');
    const loginResponse = await axios.post('http://localhost:3002/api/auth/login', {
      matricula: '512',
      senha: '123'
    });
    
    const token = loginResponse.data.data.token;
    console.log('✅ Login realizado com sucesso');
    
    // Dados do veículo
    const vehicleData = {
      tipo: 'Truck',
      frota: 'S-999',
      placa: 'TEST-1234',
      modelo: 'Teste API',
      ano: 2023,
      km_atual: 10000
    };
    
    console.log('2. Criando veículo via API...');
    console.log('Dados:', vehicleData);
    
    // Criar veículo
    const createResponse = await axios.post('http://localhost:3002/api/vehicles', vehicleData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Veículo criado com sucesso!');
    console.log('Resposta:', createResponse.data);
    
    // Limpar teste
    const vehicleId = createResponse.data.data.id;
    await axios.delete(`http://localhost:3002/api/vehicles/${vehicleId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('🧹 Veículo de teste removido');
    
  } catch (error) {
    console.error('❌ Erro:', error.response?.data || error.message);
    console.error('Status:', error.response?.status);
    console.error('Headers:', error.response?.headers);
  }
}

testVehicleAPI();