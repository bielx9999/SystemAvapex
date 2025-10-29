const { Sequelize, DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');

const sequelize = new Sequelize('sistema_logistica', 'root', 'Biel2004??', {
  host: 'localhost',
  dialect: 'mysql',
});

// Modelo de Usuário
const User = sequelize.define('User', {
  nome: DataTypes.STRING,
  usuario: { type: DataTypes.STRING, unique: true },
  senha: DataTypes.STRING,
  perfil: DataTypes.STRING,
  telefone: DataTypes.STRING,
  cnh: DataTypes.STRING,
  ativo: { type: DataTypes.BOOLEAN, defaultValue: true },
});

// Hash da senha antes de salvar
User.beforeCreate(async (user) => {
  user.senha = await bcrypt.hash(user.senha, 10);
});

// Método para comparar senhas
User.prototype.comparePassword = async function (senhaDigitada) {
  return bcrypt.compare(senhaDigitada, this.senha);
};

sequelize.sync();

module.exports = { sequelize, User };
