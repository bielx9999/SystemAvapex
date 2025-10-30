require('dotenv').config();
const { testEmailConfig } = require('./services/emailService');

console.log('🔧 Configurando Email para Sistema de Logística\n');

console.log('📋 Instruções para configurar Gmail:');
console.log('1. Acesse https://myaccount.google.com/security');
console.log('2. Ative "Verificação em duas etapas"');
console.log('3. Vá em "Senhas de app"');
console.log('4. Selecione "Email" como aplicativo');
console.log('5. Gere uma senha de 16 dígitos');
console.log('6. Use essa senha no .env (não a senha normal)');
console.log('7. Substitua "Biel2004?" pela senha gerada\n');

console.log('📝 Configurações necessárias no .env:');
console.log('EMAIL_HOST=smtp-mail.outlook.com');
console.log('EMAIL_PORT=587');
console.log('EMAIL_USER=seu_email@outlook.com');
console.log('EMAIL_PASS=sua_senha_outlook');
console.log('EMAIL_FROM=Sistema de Logística <seu_email@outlook.com>\n');

console.log('🔍 Testando configuração atual...');

testEmailConfig().then(isValid => {
  if (isValid) {
    console.log('✅ Email configurado corretamente!');
    console.log('Agora você pode enviar manutenções por email.');
  } else {
    console.log('❌ Configuração de email inválida.');
    console.log('Verifique as configurações no arquivo .env');
  }
  process.exit(0);
}).catch(error => {
  console.error('❌ Erro:', error.message);
  process.exit(1);
});