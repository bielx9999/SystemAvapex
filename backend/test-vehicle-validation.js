const { Vehicle } = require('./models');

async function testVehicleCreation() {
  try {
    console.log('Testando criação de veículo...');
    
    const testData = {
      tipo: 'Truck',
      frota: 'S-999',
      placa: 'TEST-123',
      modelo: 'Teste Model',
      ano: 2020,
      km_atual: 50000
    };
    
    console.log('Dados de teste:', testData);
    
    const vehicle = await Vehicle.create(testData);
    console.log('Veículo criado com sucesso:', vehicle.toJSON());
    
    // Limpar teste
    await vehicle.destroy();
    console.log('Teste concluído e dados limpos');
    
  } catch (error) {
    console.error('Erro no teste:', error);
    console.error('Nome do erro:', error.name);
    console.error('Mensagem:', error.message);
    if (error.errors) {
      console.error('Erros de validação:', error.errors);
    }
  }
  
  process.exit(0);
}

testVehicleCreation();