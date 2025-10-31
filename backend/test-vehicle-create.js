require('dotenv').config();
const { Vehicle } = require('./models');

async function testVehicleCreate() {
  try {
    console.log('🧪 Testando criação de veículo com novos tipos...');
    
    const testData = {
      tipo: 'TRUCK',
      frota: 'S-999',
      placa: 'TEST-1234',
      modelo: 'Teste Modelo',
      ano: 2023,
      km_atual: 10000
    };
    
    console.log('Dados de teste:', testData);
    
    const veiculo = await Vehicle.create(testData);
    
    console.log('✅ Veículo criado com sucesso!');
    console.log('ID:', veiculo.id);
    console.log('Tipo:', veiculo.tipo);
    
    // Limpar teste
    await veiculo.destroy();
    console.log('🧹 Veículo de teste removido');
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
    console.error('Detalhes:', error);
  }
  
  process.exit(0);
}

testVehicleCreate();