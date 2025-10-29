require('dotenv').config();

console.log('🔍 Testando npm run dev...\n');

try {
  console.log('Iniciando servidor...');
  require('./server.js');
} catch (error) {
  console.error('❌ ERRO CAPTURADO:');
  console.error('Tipo:', error.name);
  console.error('Mensagem:', error.message);
  console.error('Stack completo:');
  console.error(error.stack);
  
  if (error.code) {
    console.error('Código do erro:', error.code);
  }
  
  process.exit(1);
}