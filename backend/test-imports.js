require('dotenv').config();

console.log('🔍 Testando inicialização do servidor...\n');

try {
  // Testar imports
  console.log('1. Testando imports...');
  const express = require('express');
  const db = require('./config/database');
  console.log('✅ Express e Database importados');

  // Testar rotas
  console.log('2. Testando imports das rotas...');
  const authRoutes = require('./routes/auth.routes');
  const userRoutes = require('./routes/user.routes');
  const vehicleRoutes = require('./routes/vehicle.routes');
  const maintenanceRoutes = require('./routes/maintenance.routes');
  const cteRoutes = require('./routes/ctes.routes');
  const dashboardRoutes = require('./routes/dashboard.routes');
  console.log('✅ Todas as rotas importadas');

  // Testar middleware
  console.log('3. Testando middleware...');
  const errorHandler = require('./middleware/errorHandler');
  console.log('✅ Middleware importado');

  console.log('\n🎉 Todos os imports estão funcionando!');
  console.log('Agora teste: npm run dev');

} catch (error) {
  console.error('❌ Erro encontrado:', error.message);
  console.error('Stack:', error.stack);
}