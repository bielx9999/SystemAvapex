const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const sequelize = require('../config/database');

// Modelo de Usuário
const User = sequelize.define('User', {
  nome: DataTypes.STRING,
  matricula: { type: DataTypes.STRING, unique: true },
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
  status: { type: DataTypes.STRING, defaultValue: 'Pendente' }
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

// Relacionamentos
Vehicle.hasMany(Maintenance, { foreignKey: 'veiculo_id', as: 'manutencoes' });
Maintenance.belongsTo(Vehicle, { foreignKey: 'veiculo_id', as: 'veiculo' });
Maintenance.belongsTo(User, { foreignKey: 'responsavel_id', as: 'responsavel' });
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

module.exports = { sequelize, User, Vehicle, Maintenance, Cte };
