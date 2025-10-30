require('dotenv').config();
const nodemailer = require('nodemailer');

console.log('🔍 Teste Detalhado de Email\n');

console.log('📋 Configurações atuais:');
console.log(`Host: ${process.env.EMAIL_HOST}`);
console.log(`Port: ${process.env.EMAIL_PORT}`);
console.log(`User: ${process.env.EMAIL_USER}`);
console.log(`Pass: ${process.env.EMAIL_PASS ? '***' : 'NÃO DEFINIDA'}`);
console.log(`From: ${process.env.EMAIL_FROM}\n`);

const testConfigs = [
  {
    name: 'Configuração Atual',
    config: {
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      },
      tls: {
        rejectUnauthorized: false
      }
    }
  },
  {
    name: 'Sem TLS',
    config: {
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    }
  },
  {
    name: 'Porta 587',
    config: {
      host: process.env.EMAIL_HOST,
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      },
      tls: {
        rejectUnauthorized: false
      }
    }
  }
];

async function testConfig(name, config) {
  console.log(`🧪 Testando: ${name}`);
  try {
    const transporter = nodemailer.createTransport(config);
    await transporter.verify();
    console.log(`✅ ${name}: SUCESSO!\n`);
    return true;
  } catch (error) {
    console.log(`❌ ${name}: ${error.message}\n`);
    return false;
  }
}

async function runTests() {
  for (const test of testConfigs) {
    const success = await testConfig(test.name, test.config);
    if (success) {
      console.log('🎉 Configuração funcionando encontrada!');
      process.exit(0);
    }
  }
  
  console.log('❌ Nenhuma configuração funcionou.');
  console.log('💡 Verifique:');
  console.log('- Credenciais corretas');
  console.log('- Servidor SMTP ativo');
  console.log('- Firewall/antivírus');
  process.exit(1);
}

runTests();