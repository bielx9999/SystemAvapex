require('dotenv').config();
const axios = require('axios');

async function testMaintenanceAPI() {
  try {
    console.log('🧪 Testando API de manutenções...');
    
    // Primeiro fazer login
    console.log('1. Fazendo login...');
    const loginResponse = await axios.post('http://localhost:3002/api/auth/login', {
      matricula: '511',
      senha: '123'
    });
    
    const token = loginResponse.data.data.token;
    console.log('✅ Login realizado com sucesso');
    
    // Buscar veículos disponíveis
    console.log('2. Buscando veículos...');
    const vehiclesResponse = await axios.get('http://localhost:3002/api/vehicles', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const vehicles = vehiclesResponse.data.data;
    if (vehicles.length === 0) {
      console.log('❌ Nenhum veículo encontrado');
      return;
    }
    
    const firstVehicle = vehicles[0];
    console.log('✅ Veículo encontrado:', firstVehicle.placa);
    
    // Dados da manutenção
    const maintenanceData = {
      veiculo_id: firstVehicle.id,
      data_programada: '2025-11-10',
      tipo: 'Preventiva',
      km_manutencao: 50000,
      descricao: 'Teste de manutenção via API',
      gravidade: 'Média',
      em_andamento: false
    };
    
    console.log('3. Criando manutenção...');
    console.log('Dados:', maintenanceData);
    
    // Criar manutenção
    const createResponse = await axios.post('http://localhost:3002/api/maintenances', maintenanceData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Manutenção criada com sucesso!');
    console.log('Resposta:', createResponse.data);
    
    console.log('✅ Teste concluído - manutenção criada com sucesso pelo motorista');
    
  } catch (error) {
    console.error('❌ Erro:', error.response?.data || error.message);
    console.error('Status:', error.response?.status);
    if (error.response?.data?.errors) {
      console.error('Detalhes dos erros:', error.response.data.errors);
    }
  }
}

testMaintenanceAPI();