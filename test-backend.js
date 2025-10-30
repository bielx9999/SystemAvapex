const axios = require('axios');

const testBackend = async () => {
  try {
    console.log('🔍 Testando backend...');
    
    const response = await axios.get('http://localhost:3001/health', {
      timeout: 5000
    });
    
    console.log('✅ Backend OK:', response.data);
    
  } catch (error) {
    console.error('❌ Backend não responde:', error.message);
    console.error('Código:', error.code);
  }
};

testBackend();