const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const sequelize = require('../config/database');

// Modelo de Usuário
const User = sequelize.define('User', {
  nome: DataTypes.STRING,
  matricula: DataTypes.STRING,
  senha: DataTypes.STRING,
  perfil: DataTypes.STRING,
  telefone: DataTypes.STRING,
  ativo: { type: DataTypes.BOOLEAN, defaultValue: true },
});

// Modelo de Veículo
const Vehicle = sequelize.define('Vehicle', {
  tipo: DataTypes.STRING,
  frota: { type: DataTypes.STRING, unique: true },
  placa: DataTypes.STRING,
  modelo: DataTypes.STRING,
  ano: DataTypes.INTEGER,
  km_atual: { type: DataTypes.INTEGER, defaultValue: 0 },
  status: { type: DataTypes.STRING, defaultValue: 'Disponível' },
  ativo: { type: DataTypes.BOOLEAN, defaultValue: true }
});

// Modelo de Manutenção
const Maintenance = sequelize.define('Maintenance', {
  veiculo_id: DataTypes.INTEGER,
  responsavel_id: DataTypes.INTEGER,
  tipo: DataTypes.STRING,
  data_programada: DataTypes.DATE,
  km_manutencao: DataTypes.INTEGER,
  descricao: DataTypes.TEXT,
  gravidade: DataTypes.STRING,
  status: { type: DataTypes.STRING, defaultValue: 'Pendente' },
  em_andamento: { type: DataTypes.BOOLEAN, defaultValue: false }
});

// Modelo de CT-e
const Cte = sequelize.define('Cte', {
  numero: { type: DataTypes.STRING, unique: true },
  data_emissao: DataTypes.DATE,
  veiculo_id: DataTypes.INTEGER,
  motorista_id: DataTypes.INTEGER,
  arquivo_nome: DataTypes.STRING,
  arquivo_path: DataTypes.STRING,
  status: { type: DataTypes.STRING, defaultValue: 'Ativo' }
});

// Modelo de Histórico de Manutenção
const MaintenanceHistory = sequelize.define('MaintenanceHistory', {
  manutencao_id: DataTypes.INTEGER,
  etapa: DataTypes.STRING,
  descricao: DataTypes.TEXT,
  status: { type: DataTypes.STRING, defaultValue: 'Pendente' },
  data_inicio: DataTypes.DATE,
  data_conclusao: DataTypes.DATE,
  responsavel_id: DataTypes.INTEGER,
  observacoes: DataTypes.TEXT
});

// Modelo de Mensagens
const Mensagem = sequelize.define('Mensagem', {
  usuario_id: DataTypes.INTEGER,
  titulo: DataTypes.STRING,
  mensagem: DataTypes.TEXT,
  tipo: DataTypes.STRING,
  lida: { type: DataTypes.BOOLEAN, defaultValue: false }
});

// Relacionamentos
Vehicle.hasMany(Maintenance, { foreignKey: 'veiculo_id', as: 'manutencoes' });
Maintenance.belongsTo(Vehicle, { foreignKey: 'veiculo_id', as: 'veiculo' });
Maintenance.belongsTo(User, { foreignKey: 'responsavel_id', as: 'responsavel' });
Maintenance.hasMany(MaintenanceHistory, { foreignKey: 'manutencao_id', as: 'historico' });
MaintenanceHistory.belongsTo(Maintenance, { foreignKey: 'manutencao_id', as: 'manutencao' });
MaintenanceHistory.belongsTo(User, { foreignKey: 'responsavel_id', as: 'responsavel' });
Cte.belongsTo(Vehicle, { foreignKey: 'veiculo_id', as: 'veiculo' });
Cte.belongsTo(User, { foreignKey: 'motorista_id', as: 'motorista' });

// Hash da senha antes de salvar
User.beforeCreate(async (user) => {
  user.senha = await bcrypt.hash(user.senha, 10);
});

// Método para comparar senhas
User.prototype.comparePassword = async function (senhaDigitada) {
  return bcrypt.compare(senhaDigitada, this.senha);
};

module.exports = { sequelize, User, Vehicle, Maintenance, Cte, MaintenanceHistory, Mensagem };
