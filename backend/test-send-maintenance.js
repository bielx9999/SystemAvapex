require('dotenv').config();
const { Maintenance, Vehicle, User } = require('./models');

async function testSendMaintenance() {
  try {
    console.log('🧪 Testando envio de manutenção...');
    
    // Buscar primeira manutenção
    const manutencao = await Maintenance.findOne({
      where: { em_andamento: false }
    });
    
    if (!manutencao) {
      console.log('❌ Nenhuma manutenção pendente encontrada');
      return;
    }
    
    console.log('📋 Antes do envio:');
    console.log(`ID: ${manutencao.id}`);
    console.log(`Em andamento: ${manutencao.em_andamento}`);
    
    // Simular envio para manutenção
    await Maintenance.update(
      { em_andamento: true },
      { where: { id: manutencao.id } }
    );
    
    // Verificar se foi atualizado
    const manutencaoAtualizada = await Maintenance.findByPk(manutencao.id);
    
    console.log('📋 Após o envio:');
    console.log(`ID: ${manutencaoAtualizada.id}`);
    console.log(`Em andamento: ${manutencaoAtualizada.em_andamento}`);
    
    if (manutencaoAtualizada.em_andamento) {
      console.log('✅ Campo em_andamento atualizado com sucesso!');
    } else {
      console.log('❌ Campo em_andamento não foi atualizado');
    }
    
    // Reverter para teste
    await Maintenance.update(
      { em_andamento: false },
      { where: { id: manutencao.id } }
    );
    console.log('🔄 Status revertido para teste');
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
  
  process.exit(0);
}

testSendMaintenance();