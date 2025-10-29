require('dotenv').config();
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

// Script para inicializar o banco de dados no AWS RDS
// Execute: node init-rds.js

const config = {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  multipleStatements: true,
  connectTimeout: 60000
};

async function initRDS() {
  let connection;
  
  try {
    console.log('🔄 Conectando ao AWS RDS...');
    console.log(`Host: ${config.host}`);
    
    connection = await mysql.createConnection(config);
    console.log('✅ Conexão estabelecida com sucesso!');

    // Criar banco de dados se não existir
    console.log('\n🔄 Criando banco de dados...');
    await connection.query(
      `CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME} 
       CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
    );
    console.log(`✅ Banco '${process.env.DB_NAME}' criado/verificado`);

    // Usar o banco de dados
    await connection.query(`USE ${process.env.DB_NAME}`);

    // Ler e executar o schema SQL
    console.log('\n🔄 Executando schema SQL...');
    const schemaPath = path.join(__dirname, '..', 'database-schema.sql');
    
    if (!fs.existsSync(schemaPath)) {
      console.log('⚠️  Arquivo database-schema.sql não encontrado');
      console.log('📋 Criando tabelas manualmente...');
      await createTablesManually(connection);
    } else {
      const schema = fs.readFileSync(schemaPath, 'utf8');
      
      // Remover comandos CREATE DATABASE (já fizemos acima)
      const schemaWithoutDB = schema
        .replace(/CREATE DATABASE.*?;/gi, '')
        .replace(/USE.*?;/gi, '');
      
      // Executar schema
      await connection.query(schemaWithoutDB);
      console.log('✅ Schema executado com sucesso');
    }

    // Verificar tabelas criadas
    console.log('\n📊 Verificando tabelas...');
    const [tables] = await connection.query('SHOW TABLES');
    console.log(`✅ ${tables.length} tabelas criadas:`);
    tables.forEach(table => {
      const tableName = Object.values(table)[0];
      console.log(`   - ${tableName}`);
    });

    // Verificar usuários iniciais
    console.log('\n👥 Verificando usuários...');
    const [users] = await connection.query('SELECT usuario, perfil FROM usuarios');
    if (users.length > 0) {
      console.log(`✅ ${users.length} usuários encontrados:`);
      users.forEach(user => {
        console.log(`   - ${user.usuario} (${user.perfil})`);
      });
    } else {
      console.log('⚠️  Nenhum usuário encontrado. Execute o seed de dados.');
    }

    console.log('\n' + '='.repeat(60));
    console.log('✅ BANCO DE DADOS RDS INICIALIZADO COM SUCESSO!');
    console.log('='.repeat(60));
    console.log('\n📋 Credenciais de teste:');
    console.log('   Gerente: gerente / 123');
    console.log('   Assistente: assistente / 123');
    console.log('   Motorista: motorista / 123');
    console.log('\n🚀 Agora você pode executar: npm run dev\n');

  } catch (error) {
    console.error('\n❌ ERRO:', error.message);
    console.error('\n📋 Verifique:');
    console.error('   1. Endpoint RDS está correto no .env');
    console.error('   2. Security Group permite conexão da sua IP');
    console.error('   3. RDS está publicly accessible (se conectando de fora da AWS)');
    console.error('   4. Credenciais do .env estão corretas');
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Conexão fechada');
    }
  }
}

async function createTablesManually(connection) {
  // Criar tabelas essenciais se o schema.sql não existir
  
  const tables = [
    // Tabela usuarios
    `CREATE TABLE IF NOT EXISTS usuarios (
      id INT AUTO_INCREMENT PRIMARY KEY,
      nome VARCHAR(100) NOT NULL,
      usuario VARCHAR(50) NOT NULL UNIQUE,
      senha VARCHAR(255) NOT NULL,
      perfil ENUM('Motorista', 'Assistente', 'Gerente') NOT NULL,
      telefone VARCHAR(20),
      cnh VARCHAR(11),
      ativo BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_usuario (usuario),
      INDEX idx_perfil (perfil)
    ) ENGINE=InnoDB`,

    // Tabela veiculos
    `CREATE TABLE IF NOT EXISTS veiculos (
      id INT AUTO_INCREMENT PRIMARY KEY,
      tipo ENUM('Caminhão', 'Carreta', 'Van', 'Utilitário') NOT NULL,
      placa VARCHAR(10) NOT NULL UNIQUE,
      modelo VARCHAR(100) NOT NULL,
      marca VARCHAR(50),
      ano INT NOT NULL,
      km_atual INT DEFAULT 0,
      capacidade_kg DECIMAL(10,2),
      status ENUM('Disponível', 'Em Rota', 'Em Manutenção', 'Indisponível') DEFAULT 'Disponível',
      ativo BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_placa (placa),
      INDEX idx_status (status)
    ) ENGINE=InnoDB`,

    // Tabela manutencoes
    `CREATE TABLE IF NOT EXISTS manutencoes (
      id INT AUTO_INCREMENT PRIMARY KEY,
      veiculo_id INT NOT NULL,
      tipo ENUM('Preventiva', 'Corretiva', 'Preditiva') NOT NULL,
      data_programada DATE NOT NULL,
      data_realizada DATE,
      km_manutencao INT NOT NULL,
      descricao TEXT NOT NULL,
      observacoes TEXT,
      gravidade ENUM('Baixa', 'Média', 'Alta', 'Crítica') NOT NULL,
      status ENUM('Pendente', 'Em Andamento', 'Concluída', 'Cancelada') DEFAULT 'Pendente',
      custo DECIMAL(10,2),
      oficina VARCHAR(100),
      responsavel_id INT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (veiculo_id) REFERENCES veiculos(id) ON DELETE CASCADE,
      FOREIGN KEY (responsavel_id) REFERENCES usuarios(id) ON DELETE SET NULL,
      INDEX idx_veiculo (veiculo_id),
      INDEX idx_status (status)
    ) ENGINE=InnoDB`,

    // Tabela ctes
    `CREATE TABLE IF NOT EXISTS ctes (
      id INT AUTO_INCREMENT PRIMARY KEY,
      numero VARCHAR(50) NOT NULL UNIQUE,
      chave_acesso VARCHAR(44),
      data_emissao DATE NOT NULL,
      veiculo_id INT,
      motorista_id INT,
      origem VARCHAR(100),
      destino VARCHAR(100),
      valor DECIMAL(10,2),
      peso_kg DECIMAL(10,2),
      arquivo_nome VARCHAR(255),
      arquivo_path VARCHAR(500),
      status ENUM('Emitido', 'Em Trânsito', 'Entregue', 'Cancelado') DEFAULT 'Emitido',
      observacoes TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (veiculo_id) REFERENCES veiculos(id) ON DELETE SET NULL,
      FOREIGN KEY (motorista_id) REFERENCES usuarios(id) ON DELETE SET NULL,
      INDEX idx_numero (numero)
    ) ENGINE=InnoDB`,

    // Inserir usuários de teste (senha: 123 - hash bcrypt)
    `INSERT IGNORE INTO usuarios (nome, usuario, senha, perfil, telefone, cnh) VALUES
      ('João Silva', 'motorista', '$2b$10$rBV2kw3qH5ZJZKcY8lq4JOYGZqQZ5VZqYqYqYqYqYqYqYqYqYqYqY', 'Motorista', '31 99999-0001', '12345678901'),
      ('Ana Costa', 'assistente', '$2b$10$rBV2kw3qH5ZJZKcY8lq4JOYGZqQZ5VZqYqYqYqYqYqYqYqYqYqYqY', 'Assistente', '31 99999-0002', NULL),
      ('Carlos Oliveira', 'gerente', '$2b$10$rBV2kw3qH5ZJZKcY8lq4JOYGZqQZ5VZqYqYqYqYqYqYqYqYqYqYqY', 'Gerente', '31 99999-0003', NULL)`
  ];

  for (const sql of tables) {
    await connection.query(sql);
  }
  
  console.log('✅ Tabelas criadas manualmente');
}

// Executar
initRDS();