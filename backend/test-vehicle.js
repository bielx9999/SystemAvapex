require('dotenv').config();
const { Vehicle } = require('./models');

async function testVehicle() {
  try {
    console.log('🧪 Testando criação de veículo...');
    
    // Dados de teste
    const vehicleData = {
      tipo: 'Truck',
      frota: 'S-001',
      placa: 'ABC-1234',
      modelo: 'Volvo FH',
      ano: 2020,
      km_atual: 50000
    };
    
    console.log('Dados do veículo:', vehicleData);
    
    // Criar veículo de teste
    const veiculo = await Vehicle.create(vehicleData);
    
    console.log('✅ Veículo criado com sucesso!');
    console.log('ID:', veiculo.id);
    console.log('Tipo:', veiculo.tipo);
    console.log('Frota:', veiculo.frota);
    
    // Limpar teste
    await veiculo.destroy();
    console.log('🧹 Veículo de teste removido');
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
    console.error('Stack:', error.stack);
  }
  
  process.exit(0);
}

testVehicle();