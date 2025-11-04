require('dotenv').config();
const { User } = require('./models');

const checkMatriculas = async () => {
  try {
    console.log('🔍 Verificando matrículas no banco...');
    
    const users = await User.findAll({
      attributes: ['id', 'nome', 'matricula', 'ativo'],
      order: [['matricula', 'ASC']]
    });

    console.log('\nTodos os usuários (ativos e inativos):');
    users.forEach(user => {
      console.log(`- ID: ${user.id}, Matrícula: ${user.matricula}, Nome: ${user.nome}, Ativo: ${user.ativo}`);
    });

    // Verificar duplicatas
    const matriculas = users.map(u => u.matricula);
    const duplicatas = matriculas.filter((item, index) => matriculas.indexOf(item) !== index);
    
    if (duplicatas.length > 0) {
      console.log('\n⚠️ Matrículas duplicadas encontradas:', [...new Set(duplicatas)]);
    } else {
      console.log('\n✅ Nenhuma matrícula duplicada encontrada');
    }
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
  
  process.exit(0);
};

checkMatriculas();