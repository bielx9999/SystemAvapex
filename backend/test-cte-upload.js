const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

const testCteUpload = async () => {
  try {
    console.log('🔍 Testando upload de CT-e...');
    
    // 1. Fazer login
    const loginResponse = await axios.post('http://localhost:3001/api/auth/login', {
      usuario: 'assistente',
      senha: '123'
    });
    
    const token = loginResponse.data.data.token;
    console.log('✅ Token obtido');
    
    // 2. Criar arquivo de teste
    const testFile = 'test-cte.txt';
    fs.writeFileSync(testFile, 'Arquivo de teste para CT-e');
    
    // 3. Testar upload
    const formData = new FormData();
    formData.append('numero', 'CTE-TEST-001');
    formData.append('data_emissao', '2025-01-01');
    formData.append('arquivo', fs.createReadStream(testFile));
    
    const response = await axios.post('http://localhost:3001/api/ctes', formData, {
      headers: {
        ...formData.getHeaders(),
        Authorization: `Bearer ${token}`
      }
    });
    
    console.log('✅ CT-e criado:', response.data);
    
    // Limpar arquivo de teste
    fs.unlinkSync(testFile);
    
  } catch (error) {
    console.error('❌ Erro:', error.response?.data || error.message);
  }
};

testCteUpload();