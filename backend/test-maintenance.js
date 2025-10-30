require('dotenv').config();
const { Maintenance, Vehicle, User } = require('./models');

async function testMaintenance() {
  try {
    console.log('🧪 Testando criação de manutenção...');
    
    // Buscar primeiro veículo e usuário
    const veiculo = await Vehicle.findOne();
    const usuario = await User.findOne();
    
    if (!veiculo || !usuario) {
      console.log('❌ Precisa ter pelo menos 1 veículo e 1 usuário cadastrados');
      return;
    }
    
    // Criar manutenção de teste
    const manutencao = await Maintenance.create({
      veiculo_id: veiculo.id,
      responsavel_id: usuario.id,
      tipo: 'Preventiva',
      data_programada: new Date(),
      km_manutencao: 50000,
      descricao: 'Teste de criação de manutenção',
      gravidade: 'Média',
      em_andamento: false
    });
    
    console.log('✅ Manutenção criada com sucesso!');
    console.log('ID:', manutencao.id);
    console.log('Em andamento:', manutencao.em_andamento);
    
    // Limpar teste
    await manutencao.destroy();
    console.log('🧹 Manutenção de teste removida');
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
  
  process.exit(0);
}

testMaintenance();