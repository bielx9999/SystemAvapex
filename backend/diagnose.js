require('dotenv').config();

console.log('🔍 Diagnóstico completo do backend...\n');

// 1. Verificar variáveis de ambiente
console.log('1. Verificando variáveis de ambiente:');
console.log(`   NODE_ENV: ${process.env.NODE_ENV}`);
console.log(`   PORT: ${process.env.PORT}`);
console.log(`   DB_HOST: ${process.env.DB_HOST}`);
console.log(`   DB_NAME: ${process.env.DB_NAME}`);
console.log(`   JWT_SECRET: ${process.env.JWT_SECRET ? 'Definido' : 'NÃO DEFINIDO'}`);

// 2. Testar conexão com banco
console.log('\n2. Testando conexão com banco...');
const db = require('./config/database');

db.authenticate()
  .then(() => {
    console.log('✅ Conexão com banco OK');
    
    // 3. Testar models
    console.log('\n3. Testando models...');
    try {
      const { User } = require('./models');
      console.log('✅ Models carregados');
      
      // 4. Testar servidor básico
      console.log('\n4. Testando servidor básico...');
      const express = require('express');
      const app = express();
      
      app.get('/test', (req, res) => {
        res.json({ status: 'OK' });
      });
      
      const server = app.listen(5001, () => {
        console.log('✅ Servidor básico funcionando na porta 5001');
        server.close();
        
        // 5. Testar servidor completo
        console.log('\n5. Iniciando servidor completo...');
        try {
          require('./server.js');
        } catch (error) {
          console.error('❌ Erro no servidor completo:', error.message);
          console.error('Stack:', error.stack);
        }
      });
      
    } catch (error) {
      console.error('❌ Erro nos models:', error.message);
    }
    
  })
  .catch(error => {
    console.error('❌ Erro na conexão com banco:', error.message);
  });