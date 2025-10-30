require('dotenv').config();
const { sendMaintenanceEmail } = require('./services/emailService');

// Dados de teste
const manutencaoTeste = {
  tipo: 'Preventiva',
  data_programada: new Date(),
  km_manutencao: 50000,
  descricao: 'Teste de envio de email - Troca de óleo e filtros',
  gravidade: 'Média'
};

const veiculoTeste = {
  frota: 'S-001',
  placa: 'ABC-1234',
  modelo: 'Caminhão Mercedes',
  ano: 2020,
  km_atual: 48500
};

const destinatario = process.env.MAINTENANCE_EMAIL;

console.log('📧 Testando envio de email de manutenção...');
console.log(`Destinatário: ${destinatario}\n`);

sendMaintenanceEmail(manutencaoTeste, veiculoTeste, destinatario)
  .then(result => {
    if (result.success) {
      console.log('✅ Email enviado com sucesso!');
      console.log(`Message ID: ${result.messageId}`);
      console.log('\n🎉 Sistema de email funcionando perfeitamente!');
    } else {
      console.log('❌ Erro ao enviar email:', result.error);
    }
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Erro:', error.message);
    process.exit(1);
  });